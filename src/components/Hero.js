import React, { useEffect } from 'react';
import '../css/Hero.css';
import circleAnimation from '../js/circleAnimation';
import CircleAnim from './CircleAnim';
import IntroAnim from './IntroAnim';

export default function Hero({ scrollElementId }) {
	return (
		<header id='header' className='flex-container'>
			{/* <CircleAnim scrollElementId={scrollElementId} /> */}
			<IntroAnim />
		</header>
	);
}
