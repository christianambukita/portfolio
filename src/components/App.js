import React, { useEffect, useState } from 'react';
import Hero from './Hero';
import MyWork from './MyWork/MyWork';
import About from './About';
import '../css/App.css';
import Nav from './Nav';

function App() {
	const [windowWidth, setWindowWidth] = useState();
	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='app'>
			<Nav windowWidth={windowWidth} />
			<main id='main' className='scrollbar'>
				<Hero scrollElementId='main' windowWidth={windowWidth} />
				<MyWork />
				<About />
			</main>
		</div>
	);
}
export default App;
