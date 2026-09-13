import React from "react";
import "./Card.css"
import Circle from "../Circle/Circle";

const Card = props => {
	let health_score;

	if (props.graph2Value <= 100) {
		health_score = 10;
	} else if (props.graph2Value <= 150) {
		health_score = 9;
	} else if (props.graph2Value <= 200) {
		health_score = 8;
	} else if (props.graph2Value <= 225) {
		health_score = 7;
	} else if (props.graph2Value <= 250) {
		health_score = 6;
	} else if (props.graph2Value <= 350) {
		health_score = 5;
	} else if (props.graph2Value <= 400) {
		health_score = 4;
	} else if (props.graph2Value <= 450) {
		health_score = 3;
	} else if (props.graph2Value <= 500) {
		health_score = 2;
	} else if (props.graph2Value <= 650) {
		health_score = 1;
	} else if (props.graph2Value <= 700) {
		health_score = 0;
	}

	return (
		<div className="card">
			<div className="card-image">
				<img src={"https://cdn-icons-png.flaticon.com/512/562/562678.png"} alt={props.title} 
				style={{filter: 'invert(54%) sepia(96%) saturate(4663%) hue-rotate(319deg) brightness(92%) contrast(96%)'}}
		/>
			</div>
			<div className="card-content">
				<h1 className="card-title">{props.title}</h1>
				<div className="card-graphs">
					<div className="circleHolder">
						<Circle className="circle" value={props.graph2Value*2} maxValue="2000" />
						<p className="valuelabel"> calories </p>
					</div>
					<div className="circleHolder">
						<Circle className="circle" value={health_score} maxValue="10" />
						<p className="valuelabel"> health score </p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Card
