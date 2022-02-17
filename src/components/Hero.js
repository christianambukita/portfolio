import React, { useEffect, useState } from 'react';
import '../css/Hero.css';
import circleAnimation from '../js/circleAnimation';
import CircleAnim from './CircleAnim';
import IntroAnim from './IntroAnim';

export default function Hero({ scrollElementId }) {
	const [transition, setTransition] = useState(false);

	return (
		<header id='header' className='flex-container'>
			<IntroAnim setTransition={setTransition} transition={transition} />
			<div className={`transition${transition ? ' visible' : ''}`}>
				<CircleAnim scrollElementId={scrollElementId} />
			</div>
		</header>
	);
}
