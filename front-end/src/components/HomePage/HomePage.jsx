import React, { useContext, useRef, useState } from "react";
import "./HomePage.css"
import AppContext from "../../store/app-context";
import LoaderGraph from "../../loader";


const HomePage = props => {
	let inputRef = useRef("");
	const [isLoading, setIsLoading] = useState(false);
	const ctx = useContext(AppContext)

	const validateLink = () => {
		return true;
	}

	const formSubmitHandler = async (event) => {
		event.preventDefault()
		setIsLoading(true);
		const url = inputRef.current.value;

		// Extract restaurant name from Google URL
		let businessName = "restaurant";
		if (url.includes('/maps/search/')) {
			businessName = url.split('/maps/search/')[1].split('?')[0].split('#')[0].replace(/\+/g, ' ').replace(/%20/g, ' ');
		} else if (url.includes('/maps/place/')) {
			const match = url.match(/\/maps\/place\/([^/@]+)/);
			if (match) businessName = match[1].replace(/\+/g, ' ').replace(/%20/g, ' ');
		} else if (url.includes('q=')) {
			const match = url.match(/[?&]q=([^&]+)/);
			if (match) businessName = match[1].replace(/\+/g, ' ').replace(/%20/g, ' ');
		}

		console.log(businessName);
		ctx.setRestaurantName(businessName)
		if (validateLink()) {
			let id = inputRef.current.value
			console.log(id)
			let response = await fetch("http://localhost:8080/get_info?url=" + encodeURIComponent(id))
			.catch((err) => { alert("Failed to connect to server: " + err); setIsLoading(false); return null })
			if (!response) return
			let data = await response.json()
			if (data.error) { alert("Server error: " + data.error); setIsLoading(false); return }
			data = JSON.parse(data.data)
			console.log(typeof data)
			console.log(data[0])
			console.log(data)//best foods
			let bestFoodsFetched = data[0]
			console.log(data[2])//popular foods
			let popularFoodsFetched = data[2]
			console.log(data[4])//calories
			let bestFoodsCaloriesFetched = data[4]
			console.log(data[5])//popular foods
			let popularFoodsCaloriesFetched = data[5]
			let bestFoods = []
			let popularFoods = []
			for (var i = 0; i < 3; i++) {
				bestFoods.push({ title: bestFoodsFetched[i], calories: bestFoodsCaloriesFetched[i] })
				popularFoods.push({ title: popularFoodsFetched[i], calories: popularFoodsCaloriesFetched[i] })

			}
			ctx.setBestFoods(bestFoods)
			console.log(bestFoods)
			ctx.setPopularFoods(popularFoods)
			console.log(popularFoods)
			setIsLoading(false);
			ctx.setIsHome(true)


		}
	}

	return (
		<form onSubmit={formSubmitHandler} className="HURR">
			{isLoading ? (
				<>
					<marquee> <h1> querying: {ctx.restaurantName}</h1> </marquee>
					<LoaderGraph />
				</>
			) : (
				<>
					<input ref={inputRef} placeholder="enter Google Maps link for a restaurant" />

				</>)}
		</form>
	)
}

export default HomePage

