const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let { width: canvasWidth, height: canvasHeight } = canvas;
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
let id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
const canvasFps = 50;
const canvasPos = {
	top: undefined,
	left: undefined,
};
const mousePos = {
	x: undefined,
	y: undefined,
};
function getPointsDistance(a, b) {
	const x = Math.abs(a.x - b?.x);
	const y = Math.abs(a.y - b?.y);
	const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	return distance;
}
function getSpawnChance(pixelPos, mouseCanvasPos) {
	const maxDistance = 10;
	const randDistance = Math.floor(Math.random() * 40 + maxDistance);

	const distance = getPointsDistance(pixelPos, mouseCanvasPos);
	if (distance < randDistance) {
		const ratio = distance / randDistance;
		return Math.pow(ratio, 1.5) < Math.random();
	}
	return false;
}
function getCirclePos(pixelPos) {
	const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
	const width = 1.2;
	const margin = 20;
	const radius = canvasWidth / 2 - width / 2 - margin;
	const distance = getPointsDistance(center, pixelPos);
	const partialWidth = width / 2;
	if (distance < radius + partialWidth && distance > radius - partialWidth)
		return true;
	return false;
}
function init() {
	let { top, left } = canvas.getBoundingClientRect();
	canvasPos.top = top;
	canvasPos.left = left;
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
		let chance = getSpawnChance({ x, y }, mouseCanvasPos);
		let s = chance ? Math.floor(Math.random() * 255) : 255;
		let off = i * 4;
		pixels[off] = 0;
		pixels[off + 1] = 0;
		pixels[off + 2] = 0;
		pixels[off + 3] = s;
		if (getCirclePos({ x, y })) {
			pixels[off] = 255;
			pixels[off + 1] = 255;
			pixels[off + 2] = 255;
			pixels[off + 3] = 255;
		}
	}
	ctx.putImageData(id, 0, 0);
}
function main() {
	init();
	document.addEventListener('mousemove', handleMouseMove);
	paint();
	setInterval(() => {
		paint();
	}, 1000 / canvasFps);
}

window.onload = main;
