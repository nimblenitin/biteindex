import requests
import json
import os
import time
from transformers import pipeline
from playwright.sync_api import sync_playwright

print("Loading NER model...")
ner_pipeline = pipeline('token-classification', model='Dizex/InstaFoodRoBERTa-NER', aggregation_strategy='simple')
print("NER model loaded.")

print("Loading ABSA model...")
absa_pipeline = pipeline('text-classification', model='yangheng/deberta-v3-large-absa-v1.1')
print("ABSA model loaded.")


def scrape_google_reviews(search_query):
    reviews = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
        )
        page = context.new_page()

        page.goto(f'https://www.google.com/maps/search/{search_query}', timeout=30000)
        time.sleep(8)

        # Click the first result if available
        try:
            page.click(f'text={search_query.split("+")[0].strip()}', timeout=5000)
            time.sleep(5)
        except:
            pass

        # Click Reviews tab
        btns = page.query_selector_all('button, [role="tab"]')
        for btn in btns:
            try:
                if btn.inner_text().strip() == 'Reviews':
                    btn.click()
                    time.sleep(5)
                    break
            except:
                pass

        # Expand all "More" links in reviews
        for _ in range(10):
            try:
                spans = page.query_selector_all('button')
                for span in spans:
                    txt = span.inner_text().strip()
                    if txt == 'More' or txt == '… More':
                        span.click()
                        time.sleep(0.3)
            except:
                break

        time.sleep(2)

        # Scroll the review feed to load more
        feeds = page.query_selector_all('.m6QErb')
        for feed in feeds:
            try:
                h = feed.evaluate('el => el.scrollHeight')
                ch = feed.evaluate('el => el.clientHeight')
                if h > ch:
                    for _ in range(5):
                        feed.evaluate('el => el.scrollTop = el.scrollHeight')
                        time.sleep(2)
                    break
            except:
                pass

        # Expand more after scrolling
        for _ in range(10):
            try:
                spans = page.query_selector_all('button')
                for span in spans:
                    txt = span.inner_text().strip()
                    if txt in ['More', '… More']:
                        span.click()
                        time.sleep(0.3)
            except:
                break

        time.sleep(2)

        # Extract text and parse reviews
        text = page.inner_text('body')
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        # Parse review blocks: pattern is name -> stats -> stars -> date -> review text
        # We look for lines that match date patterns and extract the review text after them
        date_markers = ['ago', 'Edited', 'yesterday', 'today']
        skip_words = ['Local Guide', 'reviews', 'photos', 'Like', 'Share', 'Reply',
                      'Response from the owner', 'Sort', 'All', 'Photos', 'Videos',
                      'See more reviews', 'limited view', 'Sign in', 'Write a review',
                      'Map data', 'You\'re seeing', 'Get the most', 'Nearby restaurants',
                      'Hotels', 'Things to do', 'Restaurants', 'Layers', 'Search Google',
                      'Burger Authority', 'Get app', 'Directions', 'Overview', 'About',
                      'Order online', 'Send to phone', 'See menus', 'Get pickup',
                      'halal burger', 'garlic fries', 'halal food', 'chilli chicken',
                      'chicken sandwich', 'spicy beef burger', 'juicy burgers',
                      'Hell\'s Kitchen', 'new york times', 'gyro']

        i = 0
        while i < len(lines):
            line = lines[i]
            is_date = any(m in line.lower() for m in date_markers) and len(line) < 50
            is_skip = any(s.lower() in line.lower() for s in skip_words)

            if is_date and not is_skip:
                review_text = ''
                j = i + 1
                while j < len(lines):
                    next_line = lines[j]
                    if any(m in next_line.lower() for m in date_markers) and len(next_line) < 50:
                        break
                    if next_line in ['Like', 'Share', 'Reply']:
                        break
                    if 'Response from the owner' in next_line:
                        break
                    if 'reviews' in next_line.lower() and 'photos' in next_line.lower():
                        break
                    if not any(s.lower() in next_line.lower() for s in skip_words):
                        if len(next_line) > 10:
                            if review_text:
                                review_text += ' '
                            review_text += next_line
                    j += 1

                if review_text and len(review_text) > 20:
                    reviews.append(review_text)
            i += 1

        browser.close()

    print(f"Extracted {len(reviews)} reviews")
    for idx, r in enumerate(reviews):
        print(f"  Review {idx+1}: {r[:100]}...")

    return reviews


def retrieve_info(link):
    # Extract restaurant name from Google Maps URL
    # Handle various Google URL formats
    import re

    search_query = None

    if '/maps/search/' in link:
        # e.g. https://www.google.com/maps/search/Burger+Authority+Buffalo
        search_query = link.split('/maps/search/')[1].split('?')[0].split('#')[0]
        search_query = search_query.replace('+', ' ').replace('%20', ' ')
    elif '/maps/place/' in link:
        # e.g. https://www.google.com/maps/place/Burger+Authority/...
        match = re.search(r'/maps/place/([^/@]+)', link)
        if match:
            search_query = match.group(1).replace('+', ' ').replace('%20', ' ')
    elif 'google.com/search' in link:
        # e.g. https://www.google.com/search?q=burger+authority
        match = re.search(r'[?&]q=([^&]+)', link)
        if match:
            search_query = match.group(1).replace('+', ' ').replace('%20', ' ')
    else:
        # Try to use the link as a search query directly
        search_query = link

    if not search_query:
        raise Exception("Could not extract restaurant name from URL. Please provide a Google Maps URL.")

    print(f"Searching for: {search_query}")

    reviews = scrape_google_reviews(search_query)

    if not reviews:
        raise Exception("No reviews found for this restaurant.")

    foodset = set()

    for review in reviews:
        ner_entity_results = ner_pipeline(review)

        for i in range(len(ner_entity_results)):
            if ner_entity_results[i]["word"][0] == ' ':
                ner_entity_results[i]["word"] = ner_entity_results[i]["word"][1:]
                ner_entity_results[i]["start"] += 1

        curfoodlist = []
        for i in range(len(ner_entity_results)):
            if i != 0 and (ner_entity_results[i]["start"] - ner_entity_results[i - 1]["end"]) <= 1:
                curfoodlist[-1] += ner_entity_results[i]["word"]
            else:
                curfoodlist.append(ner_entity_results[i]["word"])

        for i in curfoodlist:
            foodset.add(i)

    fw = []
    for food in foodset:
        fw.append([])
        for word in food.split():
            fw[len(fw) - 1].append(word.capitalize())
    for i in range(len(fw)):
        for j in range(len(fw)):
            if i == j:
                continue
            f1 = fw[i]
            f2 = fw[j]
            check1 = True
            for k in f1:
                check2 = False
                for l in f2:
                    if k in l:
                        check2 = True
                if not check2:
                    check1 = False
            if check1:
                fw[i].clear()
    ffoods = []
    for i in fw:
        if len(i) != 0:
            ffoods.append([i[0]])
            for j in range(1, len(i)):
                ffoods[len(ffoods) - 1].append(i[j])
    ff = []
    for i in ffoods:
        ff.append(i[0])
        for j in range(1, len(i)):
            ff[len(ff) - 1] = ff[len(ff) - 1] + ' ' + i[j]

    foodlist = ff
    with open("ingredients.json") as f:
        ingredients_list = json.load(f)
    ingredients_plural_list = []
    for ingredient in ingredients_list:
        ingredients_plural_list.append(ingredient + "s")

    print(f"Foods found: {foodlist}")

    for i in reversed(range(len(foodlist))):
        food = foodlist[i]
        removed = False
        for ingredient in ingredients_list:
            if food == ingredient:
                foodlist.remove(food)
                removed = True
                break
        if not removed:
            for ingredient in ingredients_plural_list:
                if food == ingredient:
                    foodlist.remove(food)
                    break

    print(f"Foods after filtering: {foodlist}")

    if not foodlist:
        raise Exception("No food items found in reviews.")

    reviewlist = reviews
    negativetotal = []
    neutraltotal = []
    positivetotal = []
    count = []

    for food in foodlist:
        negativelist = []
        neutrallist = []
        positivelist = []
        for review in reviewlist:
            if food.lower() in review.lower():
                input_text = "[CLS] " + review.lower() + " [SEP] " + food.lower() + " [SEP]"
                outdata = absa_pipeline(input_text)
                outdata.sort(key=lambda x: x["label"])
                scores = {"Negative": 0, "Neutral": 0, "Positive": 0}
                for item in outdata:
                    scores[item["label"]] = item["score"]
                negativelist.append(scores["Negative"])
                neutrallist.append(scores["Neutral"])
                positivelist.append(scores["Positive"])
        negativetotal.append(negativelist)
        neutraltotal.append(neutrallist)
        positivetotal.append(positivelist)
        count.append(len(negativelist))

    rawscore = []
    weightscore = []
    popularity = []
    for i in range(len(foodlist)):
        s = 0
        for j in range(count[i]):
            s += positivetotal[i][j] - negativetotal[i][j]
        if count[i] != 0:
            s /= count[i]
        rawscore.append([s, i])
        if count[i] >= 3:
            s += 0.05
        weightscore.append([s, i])
        popularity.append([count[i], i])

    rawscore.sort(reverse=True, key=lambda x: x[0])
    print("Raw Scores:")
    for i in range(min(len(rawscore), 3)):
        print(foodlist[rawscore[i][1]])

    weightscore.sort(reverse=True, key=lambda x: x[0])
    print("\nWeighted Scores:")
    for i in range(min(len(weightscore), 3)):
        print(foodlist[weightscore[i][1]])

    popularity.sort(reverse=True, key=lambda x: x[0])
    print("\nPopularity:")
    for i in range(min(len(popularity), 3)):
        print(foodlist[popularity[i][1]])

    weightscorefood = []
    weightscorerating = []
    for i in weightscore:
        weightscorerating.append(i[0])
        weightscorefood.append(foodlist[i[1]])

    popularityfood = []
    popularityrating = []
    for i in popularity:
        popularityrating.append(i[0])
        popularityfood.append(foodlist[i[1]])

    food_api_key = os.getenv('foodkey')

    popularityfood_calories = []
    weightscorefood_calories = []

    calories = -1
    for n in range(min(3, len(popularityfood))):
        try:
            response = requests.get(
                f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={food_api_key}&query={popularityfood[n]}')
            data = response.json()
            food_data = data['foods'][0]
            for i, nutrient in enumerate(food_data['foodNutrients']):
                if food_data['foodNutrients'][i]['nutrientName'] == 'Energy':
                    calories = food_data['foodNutrients'][i]['value']
        except:
            calories = -1
        popularityfood_calories.append(calories)

        try:
            response = requests.get(
                f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={food_api_key}&query={weightscorefood[n]}')
            data = response.json()
            food_data = data['foods'][0]
            for i, nutrient in enumerate(food_data['foodNutrients']):
                if food_data['foodNutrients'][i]['nutrientName'] == 'Energy':
                    calories = food_data['foodNutrients'][i]['value']
        except:
            calories = -1
        weightscorefood_calories.append(calories)

    items = [weightscorefood, weightscorerating, popularityfood, popularityrating, weightscorefood_calories,
             popularityfood_calories]
    return json.dumps(items)
