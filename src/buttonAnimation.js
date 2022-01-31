const btnAnimFps = 60;
const animDuration = 0.18; //in secounds
let renderBtn = undefined;

function initBtnAnim(id) {
	const canvas = document.getElementById(id);

	const gl = canvas.getContext('webgl2');

	const btnGpu = new GPU({
		canvas: canvas,
		context: gl,
	});

	let { width: canvasWidth, height: canvasHeight } = canvas;

	renderBtn = btnGpu
		.createKernel(btnKernel)
		.setOutput([canvasWidth, canvasHeight])
		.setGraphical(true);
}

btnKernel = function (chance) {
	const rand = Math.random();
	const s = rand < chance ? 1 : 0;
	this.color(s, s, s, 1);
};

function animateButtonBackground(duration, fps, enter) {
	const chanceStep = 1 / (duration * fps);
	let chance = enter ? 0 : 1;
	const interval = setInterval(() => {
		renderBtn(chance);
		console.log(chance);
		if (chance > 1 || chance < 0) clearInterval(interval);
		chance = chance + (enter ? chanceStep : -chanceStep);
	}, 1000 / fps);
}

function animMouseEnter(id) {
	initBtnAnim(id);
	animateButtonBackground(animDuration, btnAnimFps, true);
}

function animMouseLeave(id) {
	initBtnAnim(id);
	animateButtonBackground(animDuration, btnAnimFps, false);
}

// setTimeout(() => {
// 	animMouseOver('canvas-0');
// }, 200);
