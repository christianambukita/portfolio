import React, { useEffect, useRef } from 'react';
import '../css/CircleAnim.css';
import CircleAnimation from '../js/circleAnimation';

export default function CircleAnim({ scrollElementId }) {
	const CANVAS_ID = 'circle-canvas';
	const animationFps = 60;
	const circle = useRef(new CircleAnimation(CANVAS_ID, animationFps));

	useEffect(() => {
		circle.current.initAnimation();
		const scrollHandle = document.getElementById(scrollElementId);
		const handleCanvasPos = () => circle.current.setCanvasPos();

		window.addEventListener('resize', handleCanvasPos);
		scrollHandle.addEventListener('scroll', handleCanvasPos);
		return () => {
			window.removeEventListener('onresize', handleCanvasPos);
			scrollHandle.removeEventListener('onscroll', handleCanvasPos);
		};
	}, []);

	function handleMouseMove(e) {
		circle.current.setMousePos([e.clientX, e.clientY]);
	}
	return (
		<div className='art-container' onMouseMove={handleMouseMove}>
			<div className='clipping-mask'>
				<canvas id={CANVAS_ID} width='600' height='600'></canvas>
			</div>
		</div>
	);
}
