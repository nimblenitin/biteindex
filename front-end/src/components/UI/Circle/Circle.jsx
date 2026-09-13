import React from "react";
import "./Circle.css"

const Circle = ({ value, maxValue }) => {
  const radius = 50;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * (radius);
  const percentage = value / maxValue;
  const dashOffset = circumference * (1 - percentage );
  // const dashArray = `${circumference} ${circumference}`;
  let dashArray;
  if(value==0){
    dashArray = 99999;
  } else { 
    dashArray = `${circumference} ${circumference}`
  }

  return (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <circle
        cx="50"
        cy="50"
        r={radius - strokeWidth / 2}
        fill="none"
        stroke="#000"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="50"
        cy="50"
        r={radius - strokeWidth / 2}
        fill="none"
        stroke="green"
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="3vh" className="text"> 
        {value}
      </text>
    </svg>
  );
};

export default Circle;

