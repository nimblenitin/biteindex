import React, { useContext, useState } from "react";
import AppContext from "../../store/app-context";
import Card from "../UI/Card/Card";
import "./RestaurantPage.css"
// import Dropdown from 'react-bootstrap/Dropdown';
// import { DropdownButton } from "react-bootstrap";
import BasicButtonExample from "../UI/BasicButton";


const RestaurantPage = props => {
	const ctx = useContext(AppContext)
	const dropdownOptions = ["best foods", "popular foods"];
	const [option, setOption] = useState(dropdownOptions[0])
	const changeSort = (option) => {
		setOption(option)
		ctx.sortRestaurantData(option)

	}
	const [best, setBest]=useState(true);
	return (
		<div className="app-container">
			<div className="restaurantHeader">
				{ctx.restaurantName}
			</div>
			<div className="dropDown">
				<select name="cars" id="cars" >
					{dropdownOptions.map((o, index) => (
						<option key={index} value={o}>{o}</option>
					))}
				</select>
			</div>
			<div className="card-wrapper">
				{best?ctx.bestFoods.map((item, index) => 

					(<Card
						key={index}
						title={item.title}
						graph2Value={item.calories}
					/>
				)):ctx.popularFoods.map((item,index)=>(
					<Card
					key={index}
						title={item.title}
						graph2Value={item.calories}
					/>

				)) }
			</div>

		</div>
	)
}
export default RestaurantPage
