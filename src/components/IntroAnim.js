import React, { useEffect } from 'react';
import '../css/IntroAnim.css';
import IntroAnimation from '../js/introAnimation';

export default function IntroAnim() {
	const CANVAS_ID = 'intro-canvas';
	const animationFps = 60;
	const intro = new IntroAnimation(CANVAS_ID, animationFps);

	useEffect(() => {
		intro.initAnimation();
	}, []);

	return (
		<div className='intro-container'>
			<canvas id={CANVAS_ID} width='1000' height='600'></canvas>
		</div>
	);
}
