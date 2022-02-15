import { GPU } from 'gpu.js';

class IntroAnimation {
	constructor(canvasId, fps, introKernel = kernel) {
		this.canvasId = canvasId;
		this.canvas = undefined;
		this.fps = fps;
		this.kernel = introKernel;
		this.render = undefined;
		this.introData = undefined;
	}

	init() {
		this.canvas = document.getElementById(this.canvasId);
		this.initIntroData();
		this.render = this.getRender();
	}

	// multiplyMatrices(m1, m2, cols1, cols2) {
	// 	const rows1 = m1.length / cols1;
	// 	let result = [null];
	// 	result = []; // gpu.js doesnt allow to create empty array "Cannot read properties of undefined (reading 'type')"
	// 	for (let i = 0; i < rows1; i++) {
	// 		for (let j = 0; j < cols2; j++) {
	// 			let sum = 0;
	// 			for (let k = 0; k < cols1; k++) {
	// 				const m1el = m1[i * cols1 + k];
	// 				const m2el = m2[j + k * cols2];
	// 				sum += m1el * m2el;
	// 				const it = i + k * cols2;
	// 				console.log({ i, j, k, m1el, m2el, it });
	// 			}
	// 			result.push(sum);
	// 		}
	// 	}
	// 	return result;
	// }
	// multiplyMatrices(m1, m2, cols1, cols2) {
	// 	const rows1 = m1.length / cols1;
	// 	let result = [];
	// 	for (let i = 0; i < m1.length; i++) {
	// 		let sum = 0;
	// 		for (let j = 0; j < cols1; j++) {
	// 			sum +=
	// 				m1[j + Math.floor(i / cols1) * cols1] * m2[(i % cols1) + j * cols2];
	// 			const it = (i % cols1) + j * cols2;
	// 			console.log({ i, j, it });
	// 		}
	// 		result[i] = sum;
	// 	}
	// 	return result;
	// }
	// multiplyMatrices(m1, m2) {
	// 	let result = [];
	// 	for (let i = 0; i < m1.length; i++) {
	// 		result[i] = [];
	// 		for (let j = 0; j < m2[0].length; j++) {
	// 			let sum = 0;
	// 			for (let k = 0; k < m1[0].length; k++) {
	// 				sum += m1[i][k] * m2[k][j];
	// 			}
	// 			result[i][j] = sum;
	// 		}
	// 	}
	// 	return result;
	// }

	// getBezierVal(t, p0, p1, p2, p3) {
	// 	const m1 = [[1, t, Math.pow(t, 2), Math.pow(t, 3)]];
	// 	const m2 = [
	// 		[1, 0, 0, 0],
	// 		[-3, 3, 0, 0],
	// 		[3, -6, 3, 0],
	// 		[-1, 3, -3, 1],
	// 	];
	// 	const m3 = this.multiplyMatrices(m1, m2);
	// 	const m4 = [p0, p1, p2, p3];

	// 	return this.multiplyMatrices(m3, m4);
	// }

	getBezierVal(min, max, duration, time, p0, p1, p2, p3) {
		//functions used inside gpu.js kernel can't take arrays as
		//arguments(Unhandled argument type) thus points have to be passed separately

		const t = time / duration;
		const b0 = p0 * Math.pow(1 - t, 3);
		const b1 = p1 * 3 * Math.pow(1 - t, 2) * t;
		const b2 = p2 * 3 * (1 - t) * Math.pow(t, 2);
		const b3 = p3 * Math.pow(t, 3);
		const bezierVal = b0 + b1 + b2 + b3;
		//we are interested only in y value because it represents 0-1 progress value in animation
		return bezierVal * max + min;
	}

	initIntroData() {
		const { width: canvasWidth, height: canvasHeight } = this.canvas;
		const center = [canvasWidth / 2, canvasHeight / 2];

		const circleMaxSize = 200;

		const bezierMatrix = [1, 0, 0, 0, -3, 3, 0, 0, 3, -6, 3, 0, -1, 3, -3, 1];
		const bezierPoints = [
			[0, 0],
			[0, 0.9],
			[0.8, 1],
			[1, 1],
		];
		//we are interested only in y value because it represents 0-1 progress value in animation
		const bezierPY = bezierPoints.map((p) => p[1]);
		console.log(bezierPY);
		this.introData = {
			center,
			canvasWidth,
			canvasHeight,
			circleMaxSize,
			bezierMatrix,
			bezierPY,
		};
	}

	getRender() {
		const gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false });
		const gpu = new GPU({
			canvas: this.canvas,
			context: gl,
		});
		const { canvasWidth, canvasHeight } = this.introData;

		function fRet() {
			return 100;
		}
		function fTest(fIn) {
			const a = fIn();
			return a;
		}
		return gpu
			.createKernel(this.kernel)
			.setConstants(this.introData)
			.setOutput([canvasWidth, canvasHeight])
			.setGraphical(true)
			.setFunctions([this.getBezierVal]);
	}

	initAnimation() {
		this.init();
		const timeStep = 1000 / this.fps;
		let time = 0;
		this.render(100, 500, time);
		setInterval(() => {
			this.render(100, 500, time);
			time += timeStep;
		}, timeStep);
	}
}

////////////////////////////// Kernel function

const kernel = function (dX, dY, time) {
	const x = this.thread.x;
	const y = this.thread.y;
	const pixelPos = [x, this.constants.canvasHeight - y];
	let dXMod = 0;
	let dYMod = 0;
	let centerMod = 1;
	let marginMod = 0;
	let circleBlendMod = 0;
	let r = 0;
	let circleMargin = 30;

	if (time < 3000) {
		// r = getBezierVal(
		// 	0,
		// 	200,
		// 	3000,
		// 	time,
		// 	this.constants.bezierPY[0],
		// 	this.constants.bezierPY[1],
		// 	this.constants.bezierPY[2],
		// 	this.constants.bezierPY[3]
		// );
	}

	const circleBlendMargin = r;
	const blendAmplifier = r * 2;

	//Distance from center
	const cDx = Math.abs(pixelPos[0] - this.constants.center[0]);
	const cDy = Math.abs(pixelPos[1] - this.constants.center[1]);
	const circleDistance = Math.sqrt(Math.pow(cDx, 2) + Math.pow(cDy, 2));
	if (circleDistance < r) centerMod = 0;

	// //Circle margin
	const mCondition1 = circleDistance < r + circleMargin;
	const mCondition2 = circleDistance > r;
	if (mCondition1 && mCondition2) {
		const ratio = (circleDistance - r) / circleMargin;
		let condition = ratio < Math.pow(Math.random(), 3);
		if (condition) {
			marginMod = Math.pow(1 - ratio, 2);
		}
	}

	// //circleBlend
	const bCondition1 = circleDistance < r + circleBlendMargin;
	const bCondition2 = circleDistance > r;
	if (bCondition1 && bCondition2) {
		const ratio = (circleDistance - r) / circleBlendMargin;
		circleBlendMod = Math.pow(1 - ratio, 3);
	}

	// Distance from x center axis
	const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
	const dxA = dX + blendAmplifier * circleBlendMod;
	if (_dX < dxA) dXMod = Math.pow(1 - _dX / dxA, 3);
	// Distance from y center axis
	const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
	if (_dY < dY) dYMod = Math.pow(1 - _dY / dY, 1.2);

	let out = 0;
	if (dXMod > 0 && dYMod > 0) {
		const testOut = Math.pow(dXMod * dYMod * centerMod, 1);
		out = Math.random() + 0.004 < testOut ? testOut : 0;
	}

	if (marginMod > 0) out = marginMod;
	// if (circleBlendMod > 0) {
	// 	const testOut = Math.pow(dXMod * dYMod * circleBlendMod, 1);
	// 	out = Math.random() + 0.004 < testOut ? testOut : 0;
	// }

	this.color(out, out, out, 1);
};

export default IntroAnimation;
