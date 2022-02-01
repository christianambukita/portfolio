import { GPU } from 'gpu.js';

const canvasFps = 60;
const canvasPos = {
	top: undefined,
	left: undefined,
};
const mousePos = [undefined, undefined];
let canvasWidth, canvasHeight;

function initCircle(canvasWidth, canvasHeight) {
	const width = 1.2;
	const margin = 100;
	const innerNoiseWidth = 100;
	const noiseRandomWidth = innerNoiseWidth;
	const noiseModifier = 8;
	const widthHalf = width / 2;
	const padding = 2.5;

	const center = [canvasWidth / 2, canvasHeight / 2];
	const radius = canvasWidth / 2 - width / 2 - margin + padding;

	const noiseOutterBorder = radius - widthHalf;
	const noiseInnerBorder = radius - widthHalf - noiseRandomWidth;

	return {
		center,
		noiseOutterBorder,
		noiseInnerBorder,
		noiseModifier,
		w: canvasWidth,
		h: canvasHeight,
	};
}

function getRender(canvasId, kernel) {
	const canvas = document.getElementById(canvasId);
	const gl = canvas.getContext('webgl2');
	const gpu = new GPU({
		canvas: canvas,
		context: gl,
	});

	({ width: canvasWidth, height: canvasHeight } = canvas);
	canvasPos[0] = left;
	canvasPos[1] = top;

	const { top, left } = canvas.getBoundingClientRect();
	const circleData = initCircle(canvasWidth, canvasHeight);

	return gpu
		.createKernel(kernel)
		.setConstants(circleData)
		.setOutput([canvasWidth, canvasHeight])
		.setGraphical(true);
}

function handleMouseMove(e) {
	mousePos[0] = e.clientX;
	mousePos[1] = e.clientY;
}
function getMouseCanvasPos() {
	const x = mousePos[0] - Math.floor(canvasPos[0]);
	const y = mousePos[1] - Math.floor(canvasPos[1]);
	let isMouseOverCanvas = true;
	if (x < 0 || y < 0) isMouseOverCanvas = false;
	if (x > canvasWidth || y > canvasHeight) isMouseOverCanvas = false;
	if (isMouseOverCanvas) return [x, y];
	return null;
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

function newPaint(render) {
	const mouseCanvasPos = getMouseCanvasPos();
	const mouseOver = mouseCanvasPos ? true : false;
	if (mouseOver) render(mouseOver, mouseCanvasPos[0], mouseCanvasPos[1]);
	else render(mouseOver, 0, 0);
}

export default function initCircleAnimation(canvasId) {
	const render = getRender(canvasId, kernel);

	document.addEventListener('mousemove', handleMouseMove);
	newPaint(render);
	setInterval(() => {
		newPaint(render);
	}, 1000 / canvasFps);
}
