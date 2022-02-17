import React, { useEffect, useRef, useState } from 'react';
import '../css/IntroAnim.css';
import '../css/CircleAnim.css';
import IntroAnimation from '../js/introAnimation';

export default function IntroAnim({ transition, setTransition }) {
	const CANVAS_ID = 'intro-canvas';
	const titleRef = useRef(null);
	const animationFps = 60;
	//difference between font size and real font height
	const fontMarginMod = 0.76;

	const intro = new IntroAnimation(CANVAS_ID, animationFps);

	const [canvas, setCanvas] = useState({
		width: 1,
		height: 1,
	});

	const [start, setStart] = useState(false);
	const [end, setEnd] = useState(false);

	useEffect(() => {
		const { width, height } = document
			.getElementById(CANVAS_ID)
			.getBoundingClientRect();

		setCanvas({ width, height });
		setStart(true);
	}, []);

	useEffect(() => {
		if (start) {
			const pxToNumber = (px) => Number(px.match(/\d+/)[0]);
			const titleStyle = window.getComputedStyle(titleRef.current);
			const textHeight = pxToNumber(titleStyle.fontSize) * fontMarginMod;
			const textWidth = pxToNumber(titleStyle.width);
			intro.setTextSize(textWidth, textHeight);

			const { phasesDuration, animDuration } = intro.initAnimation();
			setTimeout(() => setTransition(true), phasesDuration);
			setTimeout(() => setEnd(true), animDuration);
		}
	}, [start]);

	return (
		<div
			className={`intro-container${transition ? ' i-transition' : ''}${
				end ? ' anim-end' : ''
			}`}>
			<h1 ref={titleRef}>CHRISTIAN AMBUKITA</h1>

			<div className={`intro-clipping-mask`}>
				<canvas
					id={CANVAS_ID}
					width={canvas.width}
					height={canvas.height}></canvas>
			</div>
		</div>
	);
}
