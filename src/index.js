const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let { width: canvasWidth, height: canvasHeight } = canvas;
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
let id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
const canvasFps = 60;
const canvasPos = {
	top: undefined,
	left: undefined,
};
const mousePos = {
	x: undefined,
	y: undefined,
};
function getSpawnChance(pixelPos, mouseCanvasPos) {
	const maxDistance = 20;
	const x = Math.abs(pixelPos.x - mouseCanvasPos?.x);
	const y = Math.abs(pixelPos.y - mouseCanvasPos?.y);
	const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	if (distance < maxDistance) return true;
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
		let s = chance ? 200 : 0;

		let off = i * 4;
		pixels[off] = s;
		pixels[off + 1] = s;
		pixels[off + 2] = s;
		pixels[off + 3] = 255;
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
