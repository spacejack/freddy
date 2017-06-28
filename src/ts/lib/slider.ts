import * as stream from 'mithril/stream'
import {Stream} from 'mithril/stream'
import createDragger from '../lib/dragger'
import {Dragger} from '../lib/dragger'
import {easeOutLoop} from '../lib/anim'
import {clamp, sign, roundFrac} from '../lib/math'

export type Layouts = -1 | 0 | 1

export const LEFT   = -1
export const CENTER =  0
export const RIGHT  =  1

export function create(
	minLayout: Layouts, maxLayout: Layouts, maxSlide: number,
	duration: number, initialLayout: Layouts
) {
	const curLayout = stream<Layouts>(initialLayout)
	const panelWidth = stream(100) // will be reset after we read DOM
	const maxTravelX = panelWidth.map(w => w * maxSlide)
	const maxLeft = stream.combine(
		(lyo: Stream<Layouts>, mx: Stream<number>) => mx() * (minLayout - lyo()),
		[curLayout, maxTravelX]
	)
	const maxRight = stream.combine(
		(lyo: Stream<Layouts>, mx: Stream<number>) => mx() * (maxLayout - lyo()),
		[curLayout, maxTravelX]
	)
	const xpos = stream<number>(curLayout())
	const translateStyle = xpos.map(x => `translate3d(${pctStr(x * maxSlide * 100)},0,0)`)
	// Set after mount
	let dragger: Dragger | undefined
	let panel: HTMLElement | undefined
	let onchangeCB: ((l: Layouts) => any) | undefined
	let destinationLayout: Layouts | undefined

	/** Mount slider to the supplied element */
	function mount (el: HTMLElement, onchange?: (position: Layouts) => any) {
		if (dragger != null) {
			console.warn("slider already mounted")
			return
		}
		onchangeCB = onchange
		panel = el
		translateStyle.map(t => {panel!.style.transform = t})
		dragger = createDragger(panel, {
			ondragstart: dragPanel, ondragmove: dragPanel, ondragend,
			maxLeft, maxRight
		})
		window.addEventListener('resize', resize)
		resize()
	}

	function unmount() {
		if (dragger == null) {
			console.warn("slider not mounted")
			return
		}
		dragger.destroy()
		dragger = undefined
		translateStyle.end(true)
		onchangeCB = dragger = panel = undefined
		curLayout(CENTER)
		window.removeEventListener('resize', resize)
	}

	/** Sets the current layout. */
	function setLayout (lyo: Layouts) {
		if (lyo === curLayout() || lyo === destinationLayout) {
			return Promise.resolve(lyo)
		}
		destinationLayout = lyo
		return animateToLayout(curLayout(), lyo).then(_lyo => {
			destinationLayout = undefined
			return _lyo
		})
	}

	/** Set panel position constrained to draggable range */
	function dragPanel (dx: number) {
		const mx = maxTravelX()
		const x = clamp(curLayout() * mx + dx, -mx, mx)
		xpos(x / mx)
	}

	function ondragend (dx: number, vx: number) {
		// Check if we passed threshold to change panel position,
		// weighted by speed of drag.
		const mtx = maxTravelX()
		const pwidth = panelWidth()
		const lyo = curLayout()
		const xs = dx / mtx + lyo
		let weight = vx / pwidth
		let end = lyo
		let isChanging = false
		if (Math.abs(dx + weight * pwidth * 0.2) > mtx / 2.0) {
			// Threshold exceeded - animate to new layout
			const direction = sign(dx + weight * 50.0)
			end = clamp(lyo + direction, minLayout, maxLayout) as Layouts
			isChanging = true
		} else {
			weight = 0
		}
		animateToLayout(xs, end, Math.abs(weight * 0.25)).then(lyo => {
			if (isChanging && onchangeCB) {
				onchangeCB(lyo)
			}
		})
	}

	/**
	 * Animate panels to a layout position
	 * @param start Start position (-1.0 to 1.0)
	 * @param end End position (-1 | 0 | 1)
	 */
	function animateToLayout (
		start: number, end: Layouts, weight = 0
	): Promise<Layouts> {
		start = clamp(start, -1, 1)
		const dist = end - start
		const weightDivisor = Math.max(weight, 1.0)
		const dur = duration * Math.abs(dist) / weightDivisor
		return new Promise(resolve => {
			easeOutLoop(start, end, dur, xpos,
				() => {
					curLayout(end)
					requestAnimationFrame(() => {
						resolve(curLayout())
					})
				}
			)
		})
	}

	function resize() {
		if (!panel) return
		const rc = panel.getBoundingClientRect()
		panelWidth(rc.width)
	}

	return {mount, unmount, xpos, setLayout, getLayout: curLayout as () => Layouts}
}

/** Convert percent number into style percent string */
export function pctStr (pct: number) {
	const p = roundFrac(pct, 4)
	return p === 0 ? '0' : p + '%'
}

export default create(CENTER, RIGHT, 1.05, 340, RIGHT)
