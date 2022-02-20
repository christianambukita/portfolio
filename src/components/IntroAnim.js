import React, { useEffect, useRef, useState } from 'react';
import '../css/IntroAnim.css';
import '../css/CircleAnim.css';
import IntroAnimation from '../js/introAnimation';

//difference between font size and real font height
const fontMarginMod = 0.76;
const animationFps = 60;
const fallbackTime = { delay: 2000, duration: 500 };
const CANVAS_ID = 'intro-canvas';

export default function IntroAnim({
	transition,
	setTransition,
	canvasWidth,
	maxCanvasWidth,
}) {
	const titleRef = useRef(null);
	const intro = new IntroAnimation(CANVAS_ID, animationFps);
	const [end, setEnd] = useState(false);
	const [fallback, setFallback] = useState(false);

	useEffect(() => {
		if (canvasWidth !== maxCanvasWidth) {
			setTimeout(() => {
				setFallback(true);
				setTimeout(() => {
					setEnd(true);
					setTransition(true);
				}, fallbackTime.duration);
			}, fallbackTime.delay);
		} else {
			const pxToNumber = (px) => Number(px.match(/\d+/)[0]);
			const titleStyle = window.getComputedStyle(titleRef.current);
			const textHeight = pxToNumber(titleStyle.fontSize) * fontMarginMod;
			const textWidth = pxToNumber(titleStyle.width);
			intro.setTextSize(textWidth, textHeight);

			const { phasesDuration, animDuration } = intro.initAnimation();
			setTimeout(() => setTransition(true), phasesDuration);
			setTimeout(() => setEnd(true), animDuration);
		}
	}, []);

	function getClasses() {
		const baseClass = 'intro-container';
		const transitionC = transition ? ' i-transition' : '';
		const endC = end ? ' anim-end' : '';
		const fallbackC = fallback ? ' i-fallback' : '';
		return baseClass + transitionC + endC + fallbackC;
	}
	return (
		<div className={getClasses()}>
			<h1 ref={titleRef}>CHRISTIAN AMBUKITA</h1>
			<div className={`intro-clipping-mask`}>
				<canvas id={CANVAS_ID} width={1500} height={maxCanvasWidth}></canvas>
			</div>
		</div>
	);
}
