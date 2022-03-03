import { GPU } from 'gpu.js';

class IntroAnimation {
	constructor(canvasId, fps, introKernel = kernel) {
		this.canvasId = canvasId;
		this.canvas = undefined;
		this.fps = fps;
		this.kernel = introKernel;
		this.render = undefined;
		this.introData = undefined;
		this.textSize = [undefined, undefined];
	}

	setTextSize(textWidth, textHeight) {
		this.textSize = [textHeight / 2, textWidth / 2];
	}
	init() {
		this.canvas = document.getElementById(this.canvasId);
		this.initIntroData();
		this.render = this.getRender();
	}

	getBezierVal(duration, time, p0, p1, p2, p3) {
		const t = time / duration;
		// Functions used inside gpu.js kernel can't take arrays as
		//arguments(Unhandled argument type) thus points have to be passed separately
		const b0 = p0 * Math.pow(1 - t, 3);
		const b1 = p1 * 3 * Math.pow(1 - t, 2) * t;
		const b2 = p2 * 3 * (1 - t) * Math.pow(t, 2);
		const b3 = p3 * Math.pow(t, 3);
		const bezierVal = b0 + b1 + b2 + b3;
		// We are interested only in y value because it represents 0-1 progress value in animation
		return bezierVal;
	}

	initIntroData() {
		const { width: canvasWidth, height: canvasHeight } = this.canvas;
		const center = [canvasWidth / 2, canvasHeight / 2];

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

		const noiseSize = [this.textSize[0] / 2, this.textSize[1] * 1.5];
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
			textSize: this.textSize,
		};
	}

	getRender() {
		const gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false });
		const gpu = new GPU({
			canvas: this.canvas,
			context: gl,
		});
		const { canvasWidth, canvasHeight } = this.introData;

		return gpu
			.createKernel(this.kernel)
			.setConstants(this.introData)
			.setOutput([canvasWidth, canvasHeight])
			.setGraphical(true)
			.setFunctions([this.getBezierVal]);
	}

	initAnimation(transitionCallback, endCallback) {
		const phase0 = 1500;
		const phase1 = 1000;
		const phase2 = 400;
		const phase3 = 2500;
		const afterDelay = 1200;
		const transitionDuration = 1500;
		const phasesDuration = phase0 + phase1 + phase2 + phase3;
		const animDuration = phasesDuration + afterDelay + transitionDuration;
		this.init();
		const timeStep = 1000 / this.fps;
		let time = 0;
		//this.render(time);
		const interval = setInterval(() => {
			this.render(time, phase0, phase1, phase2, phase3);
			time += timeStep;
			if (time > phasesDuration) transitionCallback();
			if (time > animDuration) {
				endCallback();
				clearInterval(interval);
			}
		}, timeStep);
		return { phasesDuration, animDuration };
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
	const p0ToP1 = phase0 + phase1;
	const isP1 = time > phase0 && time < p0ToP1;
	if (isP1) {
		const time1 = time - phase0;
		let randomBez2 = 0;
		let randomBez3 = 0;
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

		// Edge of transparent pixels shrinking
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

		// White pixels amoun growing
		const randomAnimDuration3 = (phase1 * 1.5) / 2;
		const anim3Delay = phase1 / 4;
		let out2 = 0;
		if (_dXMod > 0 && _dYMod > 0) {
			if (time1 > anim3Delay && time1 < randomAnimDuration3 + anim3Delay)
				randomBez3 = getBezierVal(
					randomAnimDuration3,
					time1 - anim3Delay,
					this.constants.bezierP1[0],
					this.constants.bezierP1[1],
					this.constants.bezierP1[2],
					this.constants.bezierP1[3]
				);
			if (time1 > anim3Delay + randomAnimDuration3) randomBez3 = 1;
			const limit = 0.1 * randomBez3 + 0.005;
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

	//PHASE 2
	const phase2TimeOverlap = 10;
	const phase2AfterDelay = 500;
	const p0ToP2 =
		phase0 + phase1 + phase2 - phase2TimeOverlap + phase2AfterDelay;
	const isP2 = time > p0ToP1 - phase2TimeOverlap && time < p0ToP2;
	if (isP2) {
		const time2 = time - phase0 - phase1 + phase2TimeOverlap;
		let randomBez = 1;
		let randomAnimDuration = phase2;
		let out = 0;
		let randomMod = 0;

		const widthDiff = this.constants.noiseSize[1] - this.constants.textSize[1];
		const heightDiff = this.constants.noiseSize[0] - this.constants.textSize[0];

		if (time2 < randomAnimDuration)
			randomBez = getBezierVal(
				randomAnimDuration,
				time2,
				this.constants.bezierP1[0],
				this.constants.bezierP1[1],
				this.constants.bezierP1[2],
				this.constants.bezierP1[3]
			);

		const dX = this.constants.noiseSize[0] - (1 - randomBez) * heightDiff;
		const dY = this.constants.noiseSize[1] - (1 - randomBez) * widthDiff;

		// Distance from x center axis
		const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
		if (_dX < dX) dXMod = Math.pow(1 - _dX / dX, 1 + 1 * randomBez);
		// Distance from y center axis
		const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
		if (_dY < dY) dYMod = Math.pow(1 - _dY / dY, 1);

		if (dXMod > 0 && dYMod > 0) {
			const limit = 0.1 + 0.005 + 0.5 * randomBez;
			let combined = dXMod * dYMod;
			combined = combined > limit ? limit : combined;
			const randomMod1 = Math.random();
			const randomMod2 = Math.random();
			const condition = randomMod1 < combined && randomMod2 < combined;
			out = condition ? 1 : 0;
		}

		opacity = 1;
		pixelColor = out;

		// pixelColor = Math.random() * 2 < (1 - dXBez2) * testOut ? 1 : 0;
	}

	//PHASE 3
	const isP3 = time > p0ToP2;
	if (isP3) {
		const time3 = time - p0ToP2;
		const circleMax = 200;
		const circleBorder = 3;
		let rBez = 0;
		let oBez = 0;
		let mBez = 0;
		const rAnimDuration = (phase3 * 4) / 5;
		const oAnimDuration = phase3 / 5;
		if (time3 < oAnimDuration) {
			oBez = getBezierVal(
				oAnimDuration,
				time3,
				this.constants.bezierP3[0],
				this.constants.bezierP3[1],
				this.constants.bezierP3[2],
				this.constants.bezierP3[3]
			);
		} else {
			oBez = 1;
		}
		if (time3 > oAnimDuration && time3 < rAnimDuration + oAnimDuration) {
			rBez = getBezierVal(
				rAnimDuration,
				time3 - oAnimDuration,
				this.constants.bezierP1[0],
				this.constants.bezierP1[1],
				this.constants.bezierP1[2],
				this.constants.bezierP1[3]
			);
		}
		if (time3 > rAnimDuration + oAnimDuration) {
			rBez = 1;
		}
		if (time3 > oAnimDuration) {
			mBez = getBezierVal(
				oAnimDuration,
				time3 - oAnimDuration,
				this.constants.bezierP1[0],
				this.constants.bezierP1[1],
				this.constants.bezierP1[2],
				this.constants.bezierP1[3]
			);
		}
		if (time3 > (phase3 * 2) / 5) {
			mBez = 1;
		}

		r = (circleMax - circleBorder) * rBez;
		const circleBlendMargin = r;
		//Distance from center
		const cDx = Math.abs(pixelPos[0] - this.constants.center[0]);
		const cDy = Math.abs(pixelPos[1] - this.constants.center[1]);
		const circleDistance = Math.sqrt(Math.pow(cDx, 2) + Math.pow(cDy, 2));
		if (circleDistance < r) centerMod = 0;

		// //Circle margin

		const mCondition1 = circleDistance < r + (circleMargin * (1 - rBez) + 8);
		const mCondition2 = circleDistance > r;
		if (mCondition1 && mCondition2) {
			const ratio = (circleDistance - r) / (circleMargin * (1 - rBez) + 8);
			let condition = true;
			if (rBez < 1) {
				condition = ratio < Math.pow(Math.random(), 1 + 2 * (1 - rBez));
			}
			if (condition) {
				marginMod = Math.pow(1 - ratio, 1 + 1 * (1 - rBez));
				if (r < 1) marginMod = 0;
			}
		}

		// //circleBlend
		const bCondition1 = circleDistance < r + circleBlendMargin;
		const bCondition2 = circleDistance > r;
		if (bCondition1 && bCondition2) {
			const ratio = (circleDistance - r) / circleBlendMargin;
			circleBlendMod = Math.pow(1 - ratio, 3);
		}

		const blendAmplifier = r * 2;

		// Distance from x center axis
		const _dX = Math.abs(pixelPos[1] - this.constants.center[1]);
		const dxA = this.constants.noiseSize[0] + blendAmplifier * circleBlendMod;
		if (_dX < dxA) dXMod = Math.pow(1 - _dX / dxA, 2);
		// Distance from y center axis
		const _dY = Math.abs(pixelPos[0] - this.constants.center[0]);
		if (_dY < this.constants.noiseSize[1])
			dYMod =
				Math.pow(1 - _dY / this.constants.noiseSize[1], 1 + 3 * rBez) *
				(1 - rBez / 1.5);
		let out = 0;
		if (dXMod > 0 && dYMod > 0) {
			if (rBez < 1) {
				const limit = 0.705;
				let combined = dXMod * dYMod * centerMod;
				combined = combined > limit ? limit : combined;
				const randomMod1 = Math.random();
				const randomMod2 = Math.random();
				const condition = randomMod1 < combined && randomMod2 < combined;
				out = condition ? combined : 0;
			}
		}

		opacity = 1;

		if (marginMod > 0) out = marginMod;

		if (out > 0) {
			const outMod = out * oBez + 1 * (1 - oBez);
			pixelColor = outMod;
		}
	}

	this.color(pixelColor, pixelColor, pixelColor, opacity);
};

export default IntroAnimation;
