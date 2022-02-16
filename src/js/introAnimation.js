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

	getBezierVal(duration, time, p0, p1, p2, p3) {
		const t = time / duration;
		//functions used inside gpu.js kernel can't take arrays as
		//arguments(Unhandled argument type) thus points have to be passed separately
		const b0 = p0 * Math.pow(1 - t, 3);
		const b1 = p1 * 3 * Math.pow(1 - t, 2) * t;
		const b2 = p2 * 3 * (1 - t) * Math.pow(t, 2);
		const b3 = p3 * Math.pow(t, 3);
		const bezierVal = b0 + b1 + b2 + b3;
		//we are interested only in y value because it represents 0-1 progress value in animation
		return bezierVal;
	}

	initIntroData() {
		const { width: canvasWidth, height: canvasHeight } = this.canvas;
		const center = [canvasWidth / 2, canvasHeight / 2];

		console.log(canvasWidth, canvasHeight);
		const circleMaxSize = 200;

		const bezierMatrix = [1, 0, 0, 0, -3, 3, 0, 0, 3, -6, 3, 0, -1, 3, -3, 1];
		const bezierPoints1 = [
			[0, 0],
			[0, 0.9],
			[0.8, 1],
			[1, 1],
		];
		const bezierPoints2 = [
			[0, 0],
			[0.8, 0],
			[0.5, 1],
			[1, 1],
		];

		const bezierPoints3 = [
			[0, 0],
			[0.7, 0],
			[0.5, 1],
			[1, 1],
		];

		const bezierPoints4 = [
			[0, 0],
			[1, 0],
			[1, 0],
			[1, 1],
		];

		//we are interested only in y value because it represents 0-1 progress value in animation
		const mapPoints = (p, val) => p.map((_p) => _p[val]);
		const bezierP1 = mapPoints(bezierPoints1, 1);
		const bezierP2 = mapPoints(bezierPoints2, 1);
		const bezierP3 = mapPoints(bezierPoints3, 1);
		const bezierP4 = mapPoints(bezierPoints4, 1);

		const noiseSize = [75, 400];
		const textSize = [55, 277];
		this.introData = {
			center,
			canvasWidth,
			canvasHeight,
			circleMaxSize,
			bezierMatrix,
			bezierP1,
			bezierP2,
			bezierP3,
			bezierP4,
			noiseSize,
			textSize,
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
		//this.render(time);
		setInterval(() => {
			this.render(time, 0, 2000, 0, 0);
			time += timeStep;
			// console.log(time);
		}, timeStep);
	}
}

////////////////////////////// Kernel function

const kernel = function (time, phase0, phase1, phase2, phase3) {
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
	let pixelColor = 0;
	let opacity = 0;

	// PHASE 1
	const isP1 = time > phase0 && time < phase0 + phase1;
	if (time > 0) {
		const time1 = time - phase0;
		let randomBez2 = 0;
		let randomBez3 = 1;
		let randomBez = 1;
		let randomAnimDuration2 = (phase1 * 4) / 6;
		let randomAnimDuration = (phase1 * 5) / 6;
		let dxAnimStart = phase1 / 2;

		if (time1 > dxAnimStart && time1 < randomAnimDuration2 + dxAnimStart) {
			randomBez2 = getBezierVal(
				randomAnimDuration2,
				time1 - dxAnimStart,
				this.constants.bezierP2[0],
				this.constants.bezierP2[1],
				this.constants.bezierP2[2],
				this.constants.bezierP2[3]
			);
		}
		if (time1 > randomAnimDuration2 + dxAnimStart - 100) randomBez2 = 1;
		const dX = this.constants.textSize[0];
		const dY = this.constants.textSize[1];
		let _dXMod = 0;
		let _dYMod = 0;
		// Distance from x center axis
		const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
		if (_dX < dX) _dXMod = Math.pow(1 - _dX / dX, 1);
		// Distance from y center axis
		const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
		if (_dY < dY) _dYMod = Math.pow(1 - _dY / dY, 1);

		let out = 0;

		if (_dXMod > 0 && _dYMod > 0) {
			if (time1 < randomAnimDuration)
				randomBez = getBezierVal(
					randomAnimDuration,
					time1,
					this.constants.bezierP2[0],
					this.constants.bezierP2[1],
					this.constants.bezierP2[2],
					this.constants.bezierP2[3]
				);
			const testOut = _dXMod * _dYMod * (1 - randomBez2);
			const randomMod1 = randomBez * Math.random();
			const randomMod2 = randomBez * Math.random();
			const randomMod = randomMod1 < testOut && randomMod2 < testOut;
			out = randomMod ? 1 : 0;
		}

		let out2 = 0;
		if (_dXMod > 0 && _dYMod > 0) {
			if (time1 < 2000)
				randomBez3 = getBezierVal(
					2000,
					time1,
					this.constants.bezierP4[0],
					this.constants.bezierP4[1],
					this.constants.bezierP4[2],
					this.constants.bezierP4[3]
				);
			const limit = 0.2 * randomBez3 + 0.005;
			let combined = _dXMod * _dYMod;
			combined = combined > limit ? limit : combined;
			const testOut = combined;
			const randomMod1 = Math.random();
			const randomMod2 = Math.random();
			const condition = randomMod1 < testOut && randomMod2 < testOut;
			out2 = condition ? 1 : 0;
		}
		opacity = 1 - out;

		if (out2 > 0) {
			pixelColor = 1;
			opacity = 1;
		}
	}

	// //PHASE 2
	// const phase2TimeOverlap = 1500;
	// const isP2 = time > phase0 + phase1 - phase2TimeOverlap;
	// if (isP2) {
	// 	const time2 = time - phase0 - phase1 + phase2TimeOverlap;
	// 	const dxAnimDuration = 2000;
	// 	let dXBez2 = 1;
	// 	let randomBez = 1;
	// 	let randomAnimDuration = 1500;

	// 	const widthDiff = this.constants.noiseSize[1] - this.constants.textSize[1];

	// 	const dX = (dXBez2 * this.constants.noiseSize[0]) / 2;
	// 	const dY = this.constants.noiseSize[1] - widthDiff;

	// 	// Distance from x center axis
	// 	const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
	// 	if (_dX < dX) dXMod = Math.pow(1 - _dX / dX, 1);
	// 	// Distance from y center axis
	// 	const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
	// 	if (_dY < dY) dYMod = Math.pow(1 - _dY / dY, 1);

	// 	let out = 0;
	// 	let randomMod = 0;
	// 	if (dXMod > 0 && dYMod > 0) {
	// 		if (time2 < randomAnimDuration)
	// 			randomBez = getBezierVal(
	// 				randomAnimDuration,
	// 				time2,
	// 				this.constants.bezierP4[0],
	// 				this.constants.bezierP4[1],
	// 				this.constants.bezierP4[2],
	// 				this.constants.bezierP4[3]
	// 			);
	// 		const limit = 0.2 * randomBez + 0.005;
	// 		let combined = dXMod * dYMod;
	// 		combined = combined > limit ? limit : combined;
	// 		const testOut = combined;
	// 		const randomMod1 = Math.random();
	// 		const randomMod2 = Math.random();
	// 		const condition = randomMod1 < testOut && randomMod2 < testOut;
	// 		out = condition ? 1 : 0;

	// 		const transitionTime = 100;
	// 		if (time > phase1 + phase0 - transitionTime) {
	// 			opacity = 1;
	// 		}
	// 		if (out > 0) {
	// 			pixelColor = 1;
	// 			opacity = 1;
	// 		}
	// 	}

	// 	// pixelColor = Math.random() * 2 < (1 - dXBez2) * testOut ? 1 : 0;
	// }

	// //PHASE 3
	// const circleBlendMargin = r;
	// 		//Distance from center
	// 		const cDx = Math.abs(pixelPos[0] - this.constants.center[0]);
	// 		const cDy = Math.abs(pixelPos[1] - this.constants.center[1]);
	// 		const circleDistance = Math.sqrt(Math.pow(cDx, 2) + Math.pow(cDy, 2));
	// 		if (circleDistance < r) centerMod = 0;

	// 		// //Circle margin
	// 		const mCondition1 = circleDistance < r + circleMargin;
	// 		const mCondition2 = circleDistance > r;
	// 		if (mCondition1 && mCondition2) {
	// 			const ratio = (circleDistance - r) / circleMargin;
	// 			let condition = ratio < Math.pow(Math.random(), 3);
	// 			if (condition) {
	// 				marginMod = Math.pow(1 - ratio, 2);
	// 			}
	// 		}

	// 		// //circleBlend
	// 		const bCondition1 = circleDistance < r + circleBlendMargin;
	// 		const bCondition2 = circleDistance > r;
	// 		if (bCondition1 && bCondition2) {
	// 			const ratio = (circleDistance - r) / circleBlendMargin;
	// 			circleBlendMod = Math.pow(1 - ratio, 3);
	// 		}

	//PHASE 2
	// const phase2TimeOverlap = 2000;
	// const isP2 = time > phase0 + phase1 - phase2TimeOverlap;
	// if (isP2) {
	// 	const time2 = time - phase0 - phase1 + phase2TimeOverlap;
	// 	const blendAmplifier = r * 2;
	// 	const dxAnimDuration = 4000;
	// 	let dXBez2 = 1;

	// 	if (time2 < dxAnimDuration) {
	// 		dXBez2 = getBezierVal(
	// 			dxAnimDuration,
	// 			time2,
	// 			this.constants.bezierP1[0],
	// 			this.constants.bezierP1[1],
	// 			this.constants.bezierP1[2],
	// 			this.constants.bezierP1[3]
	// 		);
	// 	}

	// 	// Distance from x center axis
	// 	const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
	// 	const dxA =
	// 		dXBez2 * this.constants.noiseSize[0] + blendAmplifier * circleBlendMod;
	// 	if (_dX < dxA) dXMod = Math.pow(1 - _dX / dxA, 3);
	// 	// Distance from y center axis
	// 	const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
	// 	if (_dY < this.constants.noiseSize[1])
	// 		dYMod = Math.pow(1 - _dY / this.constants.noiseSize[1], 1.2);

	// 	let out = 0;
	// 	if (dXMod > 0 && dYMod > 0) {
	// 		const testOut = Math.pow(dXMod * dYMod * centerMod, 1);
	// 		out = Math.random() + 0.004 < testOut ? testOut * dXBez2 : 0;
	// 	}

	// 	if (marginMod > 0) out = marginMod;

	// 	if (out > 0) {
	// 		pixelColor = out;
	// 		opacity = 1;
	// 	}
	// }

	this.color(pixelColor, pixelColor, pixelColor, opacity);
};

export default IntroAnimation;
