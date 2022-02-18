import { GPU } from 'gpu.js';

class CircleAnimation {
	constructor(canvasId, fps, circleKernel = kernel) {
		this.canvasId = canvasId;
		this.canvas = undefined;
		this.fps = fps;
		this.canvasPos = [];
		this.mousePos = [undefined, undefined];
		this.circleData = undefined;
		this.circleRadius = undefined;
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
		const { width: canvasWidth, height: canvasHeight } = this.canvas;
		const center = [canvasWidth / 2, canvasHeight / 2];

		// Margin - space between circle border and canvas border to enable canvas
		//mouseover interaction with circle when cursor is outside of circle
		const margin = canvasWidth / 6;
		const innerNoiseWidth = canvasWidth / 6;
		const noiseModifier = 8;
		const borderWidth = 2;

		// Circle outter border to ensure seamless connection with clipping mask
		const circleOutterBorder = 3;
		this.circleRadius = canvasWidth / 2 - margin;
		const radius = this.circleRadius + circleOutterBorder;
		const noiseOutterBorder = radius - borderWidth;
		const noiseInnerBorder = noiseOutterBorder - innerNoiseWidth;

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
		if (!this.mousePos) return null;
		const x = this.mousePos[0] - Math.floor(this.canvasPos[0]);
		const y = this.mousePos[1] - Math.floor(this.canvasPos[1]);
		return [x, y];
	}

	renderWrap() {
		const mouseCanvasPos = this.getMouseCanvasPos();
		const mouseOver = mouseCanvasPos ? true : false;
		if (mouseOver) this.render(mouseOver, mouseCanvasPos[0], mouseCanvasPos[1]);
		else this.render(mouseOver, 0, 0);
	}

	initAnimation() {
		this.init();
		this.renderWrap();
		setInterval(() => {
			this.renderWrap();
		}, 1000 / this.canvasFps);
	}
}

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
		const minDistance = this.constants.w / 30;
		let randDistance = Math.floor(
			Math.random() * minDistance * 2 + minDistance
		);
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
	let ampDistance = this.constants.w / 4;
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

export default CircleAnimation;
