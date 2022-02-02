import { GPU } from 'gpu.js';

class circleAnimation {
	constructor(canvasId, fps, circleKernel = kernel) {
		this.canvasId = canvasId;
		this.canvas = undefined;
		this.fps = fps;
		this.canvasPos = [];
		this.mousePos = [undefined, undefined];
		this.circleData = undefined;
		this.kernel = circleKernel;
		this.render = undefined;
	}

	setMousePos(newPos) {
		this.mousePos = newPos;
	}

	setCanvasPos() {
		const { top, left } = this.canvas.getBoundingClientRect();
		this.canvasPos = [left, top];
	}

	init() {
		this.canvas = document.getElementById(this.canvasId);
		this.setCanvasPos();
		this.initCircle();
		this.render = this.getRender();
	}

	initCircle() {
		const width = 1.2;
		const margin = 100;
		const innerNoiseWidth = 100;
		const noiseRandomWidth = innerNoiseWidth;
		const noiseModifier = 8;
		const widthHalf = width / 2;
		const padding = 2.5;

		const { width: canvasWidth, height: canvasHeight } = this.canvas;
		const center = [canvasWidth / 2, canvasHeight / 2];
		const radius = canvasWidth / 2 - width / 2 - margin + padding;

		const noiseOutterBorder = radius - widthHalf;
		const noiseInnerBorder = radius - widthHalf - noiseRandomWidth;

		this.circleData = {
			center,
			noiseOutterBorder,
			noiseInnerBorder,
			noiseModifier,
			w: canvasWidth,
			h: canvasHeight,
		};
	}

	getRender() {
		const gl = this.canvas.getContext('webgl2');
		const gpu = new GPU({
			canvas: this.canvas,
			context: gl,
		});

		const { width: canvasWidth, height: canvasHeight } = this.canvas;

		return gpu
			.createKernel(this.kernel)
			.setConstants(this.circleData)
			.setOutput([canvasWidth, canvasHeight])
			.setGraphical(true);
	}

	getMouseCanvasPos() {
		const x = this.mousePos[0] - Math.floor(this.canvasPos[0]);
		const y = this.mousePos[1] - Math.floor(this.canvasPos[1]);
		let isMouseOverCanvas = true;
		if (x < 0 || y < 0) isMouseOverCanvas = false;
		if (x > this.canvas.width || y > this.canvas.height)
			isMouseOverCanvas = false;
		if (isMouseOverCanvas) return [x, y];
		return null;
	}

	newPaint() {
		const mouseCanvasPos = this.getMouseCanvasPos();
		const mouseOver = mouseCanvasPos ? true : false;
		if (mouseOver) this.render(mouseOver, mouseCanvasPos[0], mouseCanvasPos[1]);
		else this.render(mouseOver, 0, 0);
	}

	initCircleAnimation() {
		this.init();
		this.newPaint(this.render);
		setInterval(() => {
			this.newPaint(this.render);
		}, 1000 / this.canvasFps);
	}
}

// function handleMouseMove(e) {
// 	mousePos[0] = e.clientX;
// 	mousePos[1] = e.clientY;
// }

const kernel = function (mouseOver, mpx, mpy) {
	const x = this.thread.x;
	const y = this.thread.y;
	const pixelPos = [x, this.constants.h - y];
	let s = 0;
	let mouseSpawnChance = false;
	let mouseDistance = 0;
	///Mouse distance
	if (mouseOver) {
		const mdx = Math.abs(pixelPos[0] - mpx);
		const mdy = Math.abs(pixelPos[1] - mpy);
		mouseDistance = Math.sqrt(Math.pow(mdx, 2) + Math.pow(mdy, 2));
		const maxDistance = 20;
		let randDistance = Math.floor(Math.random() * 40 + maxDistance);
		if (mouseDistance < randDistance) {
			const ratio = mouseDistance / randDistance;
			const spawn = ratio * 1.5 < Math.random();
			if (spawn) mouseSpawnChance = true;
		}
	}
	/// End of Mouse distance
	/// Circle position
	let circlePos = false;
	let circleMod = 0;
	const cdx = Math.abs(pixelPos[0] - this.constants.center[0]);
	const cdy = Math.abs(pixelPos[1] - this.constants.center[1]);
	const circleDistance = Math.sqrt(Math.pow(cdx, 2) + Math.pow(cdy, 2));
	let mouseAmplifier = 0;
	let ampDistance = 150;
	if (mouseOver) {
		if (mouseDistance < ampDistance) {
			let mouseDistanceRatio = (ampDistance - mouseDistance) / ampDistance;
			mouseAmplifier = Math.pow(mouseDistanceRatio, 3) * 10;
		}
	}
	//paint circle inner noise
	let noiseInnerBorderA =
		this.constants.noiseInnerBorder - ampDistance * mouseAmplifier;
	const noiseCondition1 = circleDistance < this.constants.noiseOutterBorder;
	const noiseCondition2 = circleDistance > noiseInnerBorderA;
	if (noiseCondition1 && noiseCondition2) {
		const ratio =
			(circleDistance - noiseInnerBorderA) /
			(this.constants.noiseOutterBorder - noiseInnerBorderA);
		let condition = Math.pow(ratio, 8) > Math.random();
		if (condition) {
			circlePos = true;
			circleMod = Math.pow(ratio, 3);
		}
	}
	/// End of Circle position
	if (mouseSpawnChance) s = Math.random();
	if (circlePos) s = circleMod;
	this.color(s, s, s, 1);
};

export default circleAnimation;
