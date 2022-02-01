import React, { useEffect } from 'react';
import '../css/Hero.css';
import circleAnimation from '../js/circleAnimation';

export default function Hero({ scrollElementId }) {
	const CANVAS_ID = 'canvas';
	const animationFps = 60;
	const circle = new circleAnimation(CANVAS_ID, animationFps);

	useEffect(() => {
		circle.initCircleAnimation();
		console.log(scrollElementId);
		const scrollHandle = document.getElementById(scrollElementId);

		const handleCanvasPos = () => circle.setCanvasPos();

		window.addEventListener('resize', handleCanvasPos);
		scrollHandle.addEventListener('scroll', handleCanvasPos);
		return () => {
			window.removeEventListener('onresize', handleCanvasPos);
			scrollHandle.removeEventListener('onscroll', handleCanvasPos);
		};
	}, []);

	function handleMouseMove(e) {
		circle.setMousePos([e.clientX, e.clientY]);
	}

	return (
		<header id='header' className='flex-container'>
			<div className='art-container' onMouseMove={handleMouseMove}>
				<div className='clipping-mask'>
					<canvas id={CANVAS_ID} width='600' height='600'></canvas>
				</div>
			</div>
		</header>
	);
}
