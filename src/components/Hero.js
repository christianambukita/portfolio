import React, { useEffect, useState } from 'react';
import '../css/Hero.css';
import circleAnimation from '../js/circleAnimation';
import CircleAnim from './CircleAnim';
import IntroAnim from './IntroAnim';

const maxCanvasWidth = 600;

const getCanvasWidth = (value) => {
	const flooredValue = value - (value % 100);
	return flooredValue < maxCanvasWidth ? flooredValue : maxCanvasWidth;
};

export default function Hero({ scrollElementId }) {
	const [transition, setTransition] = useState(false);
	const [canvasWidth, setcanvasWidth] = useState(
		getCanvasWidth(window.innerWidth)
	);

	useEffect(() => {
		function handleResize() {
			const newWidth = getCanvasWidth(window.innerWidth);
			setcanvasWidth(newWidth);
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<header id='header' className='flex-container'>
			<IntroAnim
				setTransition={setTransition}
				transition={transition}
				canvasWidth={canvasWidth}
				maxCanvasWidth={maxCanvasWidth}
			/>
			<div className={`transition${transition ? ' visible' : ''}`}>
				<CircleAnim
					scrollElementId={scrollElementId}
					canvasWidth={canvasWidth}
				/>
			</div>
		</header>
	);
}
