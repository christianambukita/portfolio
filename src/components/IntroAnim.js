import React, { useEffect, useState } from 'react';
import '../css/IntroAnim.css';
import '../css/CircleAnim.css';
import IntroAnimation from '../js/introAnimation';

export default function IntroAnim({ transition, setTransition }) {
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
		if (start) {
			const animationDuration = intro.initAnimation();
			setTimeout(() => setTransition(true), animationDuration);
		}
	}, [start]);

	return (
		<div className={`intro-container${transition ? ' i-transition' : ''}`}>
			<h1>SOME TEXT</h1>
			<div className={`intro-clipping-mask`}>
				<canvas
					id={CANVAS_ID}
					width={canvas.width}
					height={canvas.height}></canvas>
			</div>
		</div>
	);
}
