import React, { useEffect, useState } from 'react';
import '../css/IntroAnim.css';
import IntroAnimation from '../js/introAnimation';

export default function IntroAnim() {
	const CANVAS_ID = 'intro-canvas';
	const animationFps = 60;
	const intro = new IntroAnimation(CANVAS_ID, animationFps);
	const [canvas, setCanvas] = useState({
		width: 1,
		height: 1,
	});
	const [start, setStart] = useState(null);

	useEffect(() => {
		const { width, height } = document
			.getElementById(CANVAS_ID)
			.getBoundingClientRect();
		setCanvas({ width, height });
		setStart(true);
	}, []);

	useEffect(() => {
		if (start) intro.initAnimation();
	}, [start]);

	return (
		<div className='intro-container'>
			<h1>SOME TEXT</h1>
			<canvas
				id={CANVAS_ID}
				width={canvas.width}
				height={canvas.height}></canvas>
		</div>
	);
}
