import React, { useEffect } from 'react';
import '../css/Hero.css';
import initCircleAnimation from '../js/circleAnimation';

export default function Hero() {
	useEffect(() => {
		initCircleAnimation('canvas');
	}, []);
	return (
		<header id='header' className='flex-container'>
			<div className='art-container'>
				<div className='clipping-mask'>
					<canvas id='canvas' width='600' height='600'></canvas>
				</div>
			</div>
		</header>
	);
}
