import * as stream from 'mithril/stream'
import createDragger from '../lib/dragger'
import {Dragger} from '../lib/dragger'
import {easeOutLoop} from '../lib/anim'
import {clamp, sign, roundFrac} from '../lib/math'

export const CENTER =  0
export const RIGHT  =  1

export type Layouts = 0 | 1

const DURATION = 370
const MAX_SLIDE = 1.05

let dragger: Dragger | undefined
let panel: HTMLElement | undefined
let onchangeCB: ((position: Layouts) => any) | undefined = undefined
let curLayout: Layouts = RIGHT
let destinationLayout: Layouts | undefined
let panelWidth = 100 // will be set after we read DOM
let maxTravelX = panelWidth * MAX_SLIDE
const maxLeft = stream(-panelWidth)
const maxRight = stream(0)
let curTransform = `translate3d(${pctStr(curLayout * MAX_SLIDE * 100)},0,0)`

/** Gets the current layout. */
export function getLayout() {
	return curLayout
}

/**
 * Transition to the specified layout. Returns a promise that resolves when complete.
 */
export function setLayout (lyo: Layouts) {
	if (lyo === curLayout || lyo === destinationLayout) {
		return Promise.resolve(lyo)
	}
	destinationLayout = lyo
	return animateToLayout(curLayout, lyo).then(_lyo => {
		destinationLayout = undefined
		return _lyo
	})
}

/** Returns transform style for panel */
export function getTransform() {
	return curTransform
}

/**
 * Enable panel slider for use by supplying panel elements and onchange callback.
 */
export function init (
	p: HTMLElement,	onchange?: (position: Layouts) => any
) {
	if (dragger != null) {
		console.warn("article-slider already initialized")
		return
	}
	onchangeCB = onchange
	panel = p
	panel.style.transform = curTransform
	dragger = createDragger(panel, {
		ondragstart, ondragmove, ondragend, maxLeft, maxRight
	})
	window.addEventListener('resize', resize)
	resize()
}

export function unInit() {
	if (dragger == null) {
		console.warn("article-slider not initialized")
		return
	}
	dragger.destroy()
	dragger = undefined
	onchangeCB = dragger = panel = undefined as any
	curLayout = CENTER
	panelWidth = 100
	window.removeEventListener('resize', resize)
}

/** Convert percent number into style percent string */
function pctStr (pct: number) {
	const p = roundFrac(pct, 4)
	return p === 0 ? '0' : p + '%'
}

/**
 * Set the panel position.
 * @param xs Number from 0 to 1.0
 */
function setPanelPosition (x: number) {
	if (panel == null) return
	curTransform = `translate3d(${pctStr(100 * x * MAX_SLIDE)},0,0)`
	panel.style.transform = curTransform
}

/**
 * Set panel positions by amount dragged (in pixels) from current layout position.
 * @param dx Drag amount in pixels
 */
function dragPanel (dx: number) {
	const panelPosX = curLayout * maxTravelX
	const x = clamp(panelPosX + dx, -maxTravelX, maxTravelX)
	const xs = x / maxTravelX
	setPanelPosition(xs)
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
	const dur = DURATION * Math.abs(dist) / weightDivisor
	return new Promise(resolve => {
		easeOutLoop(start, end, dur, setPanelPosition,
			() => {
				curLayout = end
				maxLeft(-curLayout * panelWidth)
				maxRight((1 - curLayout) * panelWidth)
				requestAnimationFrame(() => {
					resolve(curLayout)
				})
			}
		)
	})
}

function ondragstart (dx: number) {
	dragPanel(dx)
}

function ondragmove (dx: number) {
	dragPanel(dx)
}

function ondragend (dx: number, vx: number) {
	// Check if we passed threshold to change panel position,
	// weighted by speed of drag.
	let weight = vx / panelWidth
	const xs = dx / maxTravelX + curLayout
	let end = curLayout
	let isChanging = false
	if (Math.abs(dx + weight * 40) > maxTravelX / 2.0) {
		// Threshold exceeded - animate to new layout
		const direction = sign(dx + weight)
		end = clamp(curLayout + direction, 0, RIGHT) as Layouts
		isChanging = true
	} else {
		weight = 0
	}
	animateToLayout(xs, end, Math.abs(weight)).then(lyo => {
		if (isChanging && onchangeCB) {
			onchangeCB(lyo)
		}
	})
}

function resize() {
	const rc = panel!.getBoundingClientRect()
	panelWidth = rc.width
	maxTravelX = panelWidth * MAX_SLIDE
}
