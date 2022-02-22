import React, { useEffect, useState } from 'react';
import '../css/Hero.css';
import CircleAnim from './CircleAnim';
import IntroAnim from './IntroAnim';

const maxCanvasWidth = 600;

const getCanvasWidth = (value) => {
	const flooredValue = value - (value % 100);
	return flooredValue < maxCanvasWidth ? flooredValue : maxCanvasWidth;
};

export default function Hero({ windowWidth }) {
	const [transition, setTransition] = useState(false);
	const [canvasWidth, setcanvasWidth] = useState(
		getCanvasWidth(window.innerWidth)
	);

	useEffect(() => {
		const newWidth = getCanvasWidth(window.innerWidth);
		setcanvasWidth(newWidth);
	}, [windowWidth]);

	return (
		<header id='header' className='flex-container'>
			<IntroAnim
				setTransition={setTransition}
				transition={transition}
				canvasWidth={canvasWidth}
				maxCanvasWidth={maxCanvasWidth}
			/>
			<div className={`transition${transition ? ' visible' : ''}`}>
				<CircleAnim canvasWidth={canvasWidth} maxCanvasWidth={maxCanvasWidth} />
			</div>
		</header>
	);
}
