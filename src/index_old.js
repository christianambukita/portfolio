const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let { width: canvasWidth, height: canvasHeight } = canvas;
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
let id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
const canvasFps = 20;
const canvasPos = {
	top: undefined,
	left: undefined,
};
const mousePos = {
	x: undefined,
	y: undefined,
};
let circleData = {};

function getPointsDistance(a, b) {
	const x = Math.abs(a.x - b?.x);
	const y = Math.abs(a.y - b?.y);
	const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	return distance;
}
function getMouseSpawnChance(pixelPos, mouseCanvasPos) {
	const maxDistance = 20;
	let randDistance = Math.floor(Math.random() * 40 + maxDistance);
	//randDistance = maxDistance;

	// chech if pixel is outside of circle
	// const { center, radius } = getCircleParams();
	// const distanceFromCenter = getPointsDistance(pixelPos, center);
	// if (distanceFromCenter > radius) return false;

	const distance = getPointsDistance(pixelPos, mouseCanvasPos);
	if (distance < randDistance) {
		const ratio = distance / randDistance;
		const chance = ratio * 1.5 < Math.random();
		return chance && ratio;
	}
	return false;
}
// function getCircleParams(width = 1.2, margin = 20) {
// 	const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
// 	const radius = canvasWidth / 2 - width / 2 - margin;
// 	return { center, radius };
// }
function getCirclePos(pixelPos, mouseCanvasPos) {
	let { center, radius, noiseRandomWidth, widthHalf, noiseModifier } =
		circleData;
	const distance = getPointsDistance(center, pixelPos);

	//paint circle
	// const circleCondition1 = distance < radius + widthHalf;
	// const circleCondition2 = distance > radius - widthHalf;
	// if (circleCondition1 && circleCondition2) return true;

	let mouseAmplifier = 0;
	let ampDistance = 150;

	if (mouseCanvasPos) {
		const mouseDistance = getPointsDistance(pixelPos, mouseCanvasPos);

		if (mouseDistance < ampDistance) {
			let mouseDistanceRatio = (ampDistance - mouseDistance) / ampDistance;
			mouseAmplifier = Math.pow(mouseDistanceRatio, 3) * 10;
		}
	}

	//console.log(mouseAmplifier);

	//paint circle inner noise
	const noiseOutterBorder = radius - widthHalf;
	const noiseInnerBorder =
		radius - widthHalf - noiseRandomWidth - ampDistance * mouseAmplifier;
	const noiseCondition1 = distance < noiseOutterBorder;
	const noiseCondition2 = distance > noiseInnerBorder;

	if (noiseCondition1 && noiseCondition2) {
		const ratio =
			(distance - noiseInnerBorder) / (noiseOutterBorder - noiseInnerBorder);
		let condition = Math.pow(ratio, noiseModifier) > Math.random();
		return condition && Math.pow(ratio, 3);
	}

	return false;
}

function initCircle() {
	const width = 1.2;
	const margin = 50;
	const innerNoiseWidth = 100;
	const noiseRandomWidth = innerNoiseWidth;
	const noiseModifier = 8;
	const widthHalf = width / 2;

	const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
	const radius = canvasWidth / 2 - width / 2 - margin;

	return { center, radius, noiseRandomWidth, widthHalf, noiseModifier };
}

function init() {
	let { top, left } = canvas.getBoundingClientRect();
	canvasPos.top = top;
	canvasPos.left = left;

	circleData = initCircle();
}

function handleMouseMove(e) {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
}
function getMouseCanvasPos() {
	const x = mousePos.x - Math.floor(canvasPos.left);
	const y = mousePos.y - Math.floor(canvasPos.top);
	let isMouseOverCanvas = true;
	if (x < 0 || y < 0) isMouseOverCanvas = false;
	if (x > canvasWidth || y > canvasHeight) isMouseOverCanvas = false;
	if (isMouseOverCanvas) return { x, y };
	return null;
}
function paint() {
	const mouseCanvasPos = getMouseCanvasPos();

	let pixels = id.data;
	for (let i = 0; i < canvasWidth * canvasHeight; i++) {
		let x = i % canvasWidth;
		let y = Math.floor(i / canvasWidth);
		let s = 0;
		if (mouseCanvasPos) {
			let chance = getMouseSpawnChance({ x, y }, mouseCanvasPos);
			s = chance ? chance * Math.floor(Math.random() * 255) : 0;
		}
		let off = i * 4;
		pixels[off] = s;
		pixels[off + 1] = s;
		pixels[off + 2] = s;
		pixels[off + 3] = 255;
		let cicrleRatio = getCirclePos({ x, y }, mouseCanvasPos);
		if (cicrleRatio) {
			let brightness = cicrleRatio * 255;
			pixels[off] = brightness;
			pixels[off + 1] = brightness;
			pixels[off + 2] = brightness;
			pixels[off + 3] = 255;
		}
	}
	ctx.putImageData(id, 0, 0);
}

function getPointsDistanceGPU(a, b) {
	const x = Math.abs(a[0] - b[1]);
	const y = Math.abs(a[0] - b[1]);
	const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	return distance;
}

kernel = function (mouseOver, mouseX, mouseY, getPointsDistanceGPU) {
	const x = this.thread.x;
	const y = this.thread.y;
	const pixelPos = [x, y];
	const mouseCanvasPos = [mouseX, mouseY];

	let mouseSpawnChance = getPointsDistanceGPU;

	//////////////////////////////////////////////////////////////////////

	let s = 0;
	// if (mouseCanvasPos) {
	// 	let chance = getMouseSpawnChance({ x, y }, mouseCanvasPos);
	// 	s = chance ? Math.floor(Math.random()) : 0;
	// }

	let brightness = s;
	// let cicrleRatio = getCirclePos({ x, y }, mouseCanvasPos);
	// if (cicrleRatio) {
	// brightness = cicrleRatio;
	// }
	this.color(brightness, brightness, brightness, 1);
};

const gpu = new GPU({ canvas, context: ctx });

// const render = gpu.createKernel(kernel).setOutput([10, 10]).setGraphical(true);

const render = gpu
	.createKernel(kernel)
	.setOutput([500, 500])
	.setGraphical(true);

function newPaint() {
	const mouseCanvasPos = getMouseCanvasPos();
	console.log(mouseCanvasPos);
	render(true, mouseCanvasPos.x, mouseCanvasPos.y, getPointsDistanceGPU);
	const newData = render.canvas;
	console.log(newData);
	//id.data = newData;
	//ctx.putImageData(id, 0, 0);
}

function main() {
	init();
	document.addEventListener('mousemove', handleMouseMove);
	// newPaint();
	setInterval(() => {
		paint();
	}, 1000 / canvasFps);
}

window.onload = main;
