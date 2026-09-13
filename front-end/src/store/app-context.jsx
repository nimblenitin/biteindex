import React, { useState } from "react";

const AppContext = React.createContext({
  isHome: false,
  restaurantData: {
    name: "Ippudo Cupertino",
    popularFoods: [
      {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }],
    bestFoods: [
      {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }],
    sortRestaurantData: () => { }

  },

})

export const AppContextProvider = (props) => {
  const [isHome, setIsHome] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [popularFoods, setPopularFoods] = useState({
    popularFoods: [
      {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }
    ],

  })
  const [bestFoods, setBestFoods] = useState({
    bestFoods: [
      {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }, {
        title: "",
        img: "",
        calories: 0,
        healthscore: 0,
      }],
  })
  const sortBleh = (option) => {
    const sortedData = {
      ...restaurantData,
      popularFoods: restaurantData.popularFoods.sort((a, b) => b[option] - a[option]),
    };
    setRestaurantData(sortedData);
  };

  return (
    <AppContext.Provider value={{
      isHome: isHome,
      setIsHome: setIsHome,
      setPopularFoods: setPopularFoods,
      setBestFoods: setBestFoods,
      popularFoods: popularFoods,
      bestFoods: bestFoods,
      restaurantName: restaurantName,
      setRestaurantName: setRestaurantName,
      sortRestaurantData: sortBleh,
    }}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContext
