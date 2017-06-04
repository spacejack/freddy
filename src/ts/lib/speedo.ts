import {pmod} from './math'

const DEFAULT_SAMPLES = 4

export interface Speedo {
	start(x: number, t?: number): void
	addSample(x: number, t?: number): void
	getVel(): number
}

interface Sample {
	x: number
	t: number
}

/**
 * Computes speed (delta x over time)
 */
export default function createSpeedo (numSamples = DEFAULT_SAMPLES) : Speedo {
	let index = 0
	let count = 0
	let samples: Sample[] = new Array(numSamples)

	for (let i = 0; i < numSamples; ++i) {
		samples[i] = {x: 0, t: 0}
	}

	function start (x: number, t: number) {
		index = 0
		count = 0
		samples[index].x = x
		samples[index].t = t
		index = 1
		count = 1
	}

	function addSample (x: number, t: number) {
		samples[index].x = x
		samples[index].t = t
		index = (index + 1) % numSamples
		count += 1
	}

	function getVel() {
		if (count < 1) return 0
		const n = count > numSamples ? numSamples : count
		const iLast = pmod(index - 1, numSamples)
		const iFirst = pmod(index - n, numSamples)
		const deltaT = samples[iLast].t - samples[iFirst].t
		const dx = samples[iLast].x - samples[iFirst].x
		return dx / deltaT
	}

	return {
		start,
		addSample,
		getVel
	}
}
