import React from 'react';
import Hero from './Hero';
import MyWork from './MyWork/MyWork';
import About from './About';
import '../css/App.css';
import Nav from './Nav';

function App() {
	return (
		<div className='app'>
			<Nav />
			<main id='main' className='scrollbar'>
				<Hero scrollElementId='main' />
				<MyWork />
				<About />
			</main>
		</div>
	);
}
export default App;