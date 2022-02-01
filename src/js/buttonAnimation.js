import { GPU } from 'gpu.js';

const btnAnimFps = 60;
const animDuration = 0.28; //in secounds

function getRender(id) {
	const canvas = document.getElementById(id);

	const gl = canvas.getContext('webgl2');

	const btnGpu = new GPU({
		canvas: canvas,
		context: gl,
	});

	let { width: canvasWidth, height: canvasHeight } = canvas;

	return btnGpu
		.createKernel(btnKernel)
		.setOutput([canvasWidth, canvasHeight])
		.setGraphical(true);
}

const btnKernel = function (chance) {
	const rand = Math.random();
	const s = rand < chance ? 1 : 0;
	this.color(s, s, s, 1);
};

function animateButtonBackground(render, duration, fps, enter) {
	const chanceStep = 1 / (duration * fps);
	let chance = enter ? 0 : 1;
	const interval = setInterval(() => {
		render(chance);
		if (chance > 1 || chance < 0) clearInterval(interval);
		chance = chance + (enter ? chanceStep : -chanceStep);
	}, 1000 / fps);
}

function animateButton(id, onEnter) {
	const render = getRender(id);
	animateButtonBackground(render, animDuration, btnAnimFps, onEnter);
}

export default animateButton;
