import {Stream} from 'mithril/stream'
import {
	LEFT, CENTER, RIGHT,
	create as createSlider, Layouts, pctStr
} from './slider'

export function create (
	minLayout: Layouts, maxLayout: Layouts, maxSlide: number,
	duration: number, initialLayout: Layouts
) {
	const slider = createSlider(minLayout, maxLayout, maxSlide, duration, initialLayout)
	let panelLeft: HTMLElement| undefined
	let panelRight: HTMLElement | undefined
	let xpos: Stream<number> | undefined

	/** Mount slider to the supplied elements. */
	function mount (
		el: HTMLElement, elLeft: HTMLElement, elRight: HTMLElement,
		onchange?: (position: Layouts) => any
	) {
		if (xpos) {
			console.warn("slider3 already mounted")
			return
		}
		slider.mount(el, onchange)
		panelLeft = elLeft
		panelRight = elRight
		// Create a dependent stream so we can stop listening when unmounted
		xpos = slider.xpos.map(x => x)
		xpos.map(x => {
			panelLeft!.style.transform = `translate3d(${leftPct(x)},0,0)`
			panelRight!.style.transform = `translate3d(${rightPct(x)},0,0)`
		})
	}

	function unmount() {
		if (!xpos) {
			console.warn("slider3 already unmounted")
			return
		}
		slider.unmount()
		xpos.end(true)
		xpos = panelLeft = panelRight = undefined
	}

	/**
	 * @param x From -1.0 to 1.0
	 */
	function leftPct (x: number) {
		return pctStr(100 * (x * 0.5 - 0.5))
	}

	/**
	 * @param x From -1.0 to 1.0
	 */
	function rightPct (x: number) {
		return pctStr(100 * ((x * 0.5 + 0.5) * maxSlide + (1.0 - maxSlide)))
	}

	return {
		mount, unmount,
		getLayout: slider.getLayout,
		setLayout: slider.setLayout
	}
}

export default create(LEFT, RIGHT, 0.87, 300, CENTER)
