const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let { width: canvasWidth, height: canvasHeight } = canvas;
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
let id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

const mousePos = {
	x: undefined,
	y: undefined,
};

function handleMouseMove(e) {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
}

document.addEventListener('mousemove', handleMouseMove);

function main() {
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	let canvasWidth = canvas.width;
	let canvasHeight = canvas.height;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	let id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	let pixels = id.data;

	for (let i = 0; i < canvasHeight * canvasWidth; i++) {
		let off = i * 4;
		pixels[off] = 0;
		pixels[off + 1] = 0;
		pixels[off + 2] = 0;
		pixels[off + 3] = 255;
	}

	ctx.putImageData(id, 0, 0);

	setInterval(() => {
		console.log(mousePos);
	}, 200);
}

window.onload = main;
