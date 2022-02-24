import React from 'react';
import About from './About';
import Hero from './Hero';
import MyWork from './MyWork/MyWork';
import { Route } from 'react-router-dom';

export default function MainPage({ windowWidth }) {
	return (
		<main id='main'>
			<Hero windowWidth={windowWidth} />
			<MyWork />
			<About />
		</main>
	);
}
