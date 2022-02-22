import React, { useEffect, useRef, useState } from 'react';
import '../css/CircleAnim.css';
import CircleAnimation from '../js/circleAnimation';

export default function CircleAnim({ canvasWidth, maxCanvasWidth }) {
	const CANVAS_ID = 'circle-canvas';
	const animationFps = 60;
	const circle = useRef(
		new CircleAnimation(CANVAS_ID, animationFps, maxCanvasWidth)
	);
	const [circleRadius, setCircleRadius] = useState(200);

	function startAnimation() {
		circle.current.init(canvasWidth);
		circle.current.startAnimation();
		setCircleRadius(circle.current.getCircleRadius());
	}

	useEffect(() => {
		startAnimation();
		const handleCanvasPos = () => circle.current.setCanvasPos();

		window.addEventListener('resize', handleCanvasPos);
		window.addEventListener('scroll', handleCanvasPos);
		return () => {
			window.removeEventListener('onresize', handleCanvasPos);
			window.removeEventListener('onscroll', handleCanvasPos);
		};
	}, []);

	useEffect(() => {
		startAnimation();
	}, [canvasWidth]);

	function handleMouseMove(e) {
		circle.current.setMousePos([e.clientX, e.clientY]);
	}
	function handleMouseLeave() {
		circle.current.setMousePos(null);
	}

	function getSize(size) {
		return {
			width: `${size}px`,
			height: `${size}px`,
		};
	}

	function getCanvasStyle() {
		const translation = Math.floor(maxCanvasWidth / 2 - circleRadius);
		const style = {
			transform: `translate(-${translation + 1}px, -${translation}px)`,
		};
		return style;
	}

	return (
		<div
			className='anim-container'
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={getSize(canvasWidth)}>
			<div className='clipping-mask' style={getSize(circleRadius * 2)}>
				<canvas
					id={CANVAS_ID}
					width={maxCanvasWidth}
					height={maxCanvasWidth}
					style={getCanvasStyle()}></canvas>
			</div>
		</div>
	);
}
