import createDragger from '../lib/dragger'
import {Dragger} from '../lib/dragger'
import {easeOutLoop} from '../lib/anim'
import {clamp, sign, roundFrac} from '../lib/math'

export const LEFT   = -1
export const CENTER =  0
export const RIGHT  =  1

export type Layouts = -1 | 0 | 1

const DURATION = 300
const MAX_SLIDE = 0.87

let dragger: Dragger | undefined = undefined
let panelLeft: HTMLElement = undefined as any,
	panelCenter: HTMLElement = undefined as any,
	panelRight: HTMLElement = undefined as any
let onchangeCB: ((position: Layouts) => any) | undefined = undefined
let curLayout: Layouts = CENTER
let panelWidth = 100 // will be set after we read DOM
let maxTravelX = panelWidth * MAX_SLIDE
let destinationLayout: Layouts | undefined

/** Gets the current layout. */
export function getLayout() {
	return curLayout
}

/**
 * Transition to the specified layout. Returns a promise that resolves when complete.
 */
export function setLayout (lyo: Layouts) {
	console.log('setting layout to:', lyo)
	if (lyo === curLayout || lyo === destinationLayout) {
		return Promise.resolve(lyo)
	}
	destinationLayout = lyo
	return animateToLayout(curLayout, lyo).then(_lyo => {
		destinationLayout = undefined
		return _lyo
	})
}

/** Returns transform style for center panel */
export function getCenterTransform() {
	const x = curLayout === CENTER
		? '0'
		: curLayout === LEFT
			? pctStr(-100 * MAX_SLIDE)
			: pctStr(100 * MAX_SLIDE)
	return `translate3d(${x},0,0)`
}

/** Returns transform style for right panel */
export function getRightTransform() {
	const x = curLayout === LEFT ? String(Math.round(100 - MAX_SLIDE * 100)) + '%' : '100%'
	return `translate3d(${x},0,0)`
}

/** Returns transform style for left panel */
export function getLeftTransform() {
	const x = curLayout === RIGHT ? '0' : '-100%'
	return `translate3d(${x},0,0)`
}

/**
 * Enable panel slider for use by supplying panel elements and onchange callback.
 */
export function init (
	leftPanel: HTMLElement, centerPanel: HTMLElement, rightPanel: HTMLElement,
	onchange?: (position: Layouts) => any
) {
	if (dragger != null) {
		console.warn("panel3slider already initialized")
		return
	}
	panelLeft = leftPanel
	panelCenter = centerPanel
	panelRight = rightPanel
	onchangeCB = onchange
	dragger = createDragger(panelCenter, {
		ondragstart, ondragmove, ondragend, ondragcancel
	})
	window.addEventListener('resize', resize)
	resize()
}

export function unInit() {
	if (dragger == null) {
		console.warn("panel3slider not initialized")
		return
	}
	dragger.destroy()
	dragger = undefined
	onchangeCB = dragger = panelLeft = panelCenter = panelRight = undefined as any
	curLayout = CENTER
	panelWidth = 100
	window.removeEventListener('resize', resize)
}

/** Convert percent number into style percent string */
function pctStr (pct: number) {
	return String(roundFrac(pct, 4)) + '%'
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
	return pctStr(100 * ((x * 0.5 + 0.5) * 0.88 + 0.12))
}

/**
 * Set the panel positions.
 * @param xs Number from -1.0 to 1.0
 */
function setPanelPositions (x: number) {
	panelLeft.style.transform = `translate3d(${leftPct(x)},0,0)`
	panelRight.style.transform = `translate3d(${rightPct(x)},0,0)`
	panelCenter.style.transform = `translate3d(${pctStr(100 * x * MAX_SLIDE)},0,0)`
}

/**
 * Set panel positions by amount dragged (in pixels) from current layout position.
 * @param dx Drag amount in pixels
 */
function dragPanels (dx: number) {
	const panelPosX = curLayout * maxTravelX
	const x = clamp(panelPosX + dx, -maxTravelX, maxTravelX)
	const xs = x / maxTravelX
	setPanelPositions(xs)
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
		easeOutLoop(start, end, dur, setPanelPositions,
			() => {
				curLayout = end
				requestAnimationFrame(() => {
					resolve(curLayout)
				})
			}
		)
	})
}

function ondragstart (dx: number) {
	dragPanels(dx)
}

function ondragmove (dx: number) {
	dragPanels(dx)
}

function ondragend (dx: number, vx: number) {
	// Check if we passed threshold to change panel position,
	// weighted by speed of drag.
	const xs = dx / maxTravelX + curLayout
	let weight = vx / panelWidth
	let end = curLayout
	let isChanging = false
	if (Math.abs(dx + weight * panelWidth * 0.2) > maxTravelX / 2.0) {
		// Threshold exceeded - animate to new layout
		const direction = sign(dx + weight * 50.0)
		end = clamp(curLayout + direction, LEFT, RIGHT) as Layouts
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

function ondragcancel() {
	setPanelPositions(curLayout)
}

function resize() {
	const rc = panelCenter.getBoundingClientRect()
	panelWidth = rc.width
	maxTravelX = panelWidth * MAX_SLIDE
}
