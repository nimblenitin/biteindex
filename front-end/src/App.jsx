import { useContext, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import NavBar from "./components/Navbar/Navbar"
import BottomBar from "./components/BottomBar/BottomBar"
import AppContext from './store/app-context'
import HomePage from './components/HomePage/HomePage'
import RestaurantPage from './components/RestaurantPage/RestaurantPage'

function App() {
	const ctx = useContext(AppContext)
	return (
		<div className="App">
			<NavBar />
			{!ctx.isHome ? (<HomePage />) : (<RestaurantPage />
			)}
			<BottomBar className="BottomBar" />
		</div>
	)
}

export default App
