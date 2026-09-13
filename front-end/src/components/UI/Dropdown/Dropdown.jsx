import React, { useState, useRef, useEffect } from "react";
import "./Dropdown.css";

const Dropdown = (props) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const [selectedOption, setSelectedOption] = useState('calories');

	const handleButtonClick = () => {
		setIsOpen((prevState) => !prevState);
	};

	const handleOptionClick = (option) => {
		setIsOpen(false);
		setSelectedOption(option)
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	return (
		<div className="dropdown-container" ref={dropdownRef}>
			<button className="dropdown-button" onClick={handleButtonClick}>
				{selectedOption}
			</button>
			{isOpen && (
				<div className="dropdown-content">
					{props.options.map((option, index) => (
						<button
							key={index}
							className="dropdown-option"
							onClick={() => handleOptionClick(option)}
						>
							{option}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
