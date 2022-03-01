import React, { useEffect, useState } from 'react';

import '../css/App.css';
import Nav from './Nav';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClimbingApp from './ClimbingApp/ClimbingApp';
import MainPage from './MainPage';

function App() {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='app'>
			<BrowserRouter>
				<Nav windowWidth={windowWidth} />
				<Routes>
					<Route path='/' element={<MainPage windowWidth={windowWidth} />} />
					{/* <Route path='/climbing-app' element={<ClimbingApp />} /> */}
					<Route
						path='/climbing-app'
						element={<ClimbingApp windowWidth={windowWidth} />}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}
export default App;
