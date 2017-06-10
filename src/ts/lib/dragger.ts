import createSpeedo from './speedo'

const NONE  = 0
const MOUSE = 1
const TOUCH = 2

const DEVICE_DELAY = 300

const DEFAULT_DRAG_THRESHOLD = 12
const DEFAULT_DRAG_RATIO     = 1.5

export interface Dragger {
	destroy(): void
}

export interface DraggerOptions {
	/** Fires when dragThreshold exceeded and element is in 'dragging' state */
	ondragstart?(dx: number): void
	/** Fires for every move made while dragged */
	ondragmove?(dx: number, dvx: number): void
	/** Fires when drag ends */
	ondragend?(dx: number, dvx: number): void
	/** Fires if drag was started then cancelled */
	ondragcancel?(): void
	/** Specify drag threshold distance */
	dragThreshold?: number
	/** Specifiy minimum drag ratio */
	dragRatio?: number
	/** Maximum left drag amount */
	maxLeft?(): number
	/** Maximum left drag amount */
	maxRight?(): number
}

/**
 * Given a dom element, sends back horizontal 'drag' events.
 * An array of child 'scrollable' elements may be provided so
 * that scrolling and horizontal dragging do not happen simultaneously.
 */
export default function create (
	el: HTMLElement,
	{
		ondragstart, ondragmove, ondragend, ondragcancel,
		dragThreshold = DEFAULT_DRAG_THRESHOLD,
		dragRatio = DEFAULT_DRAG_RATIO,
		maxLeft, maxRight
	}: DraggerOptions = {}
): Dragger {
	applyIOSHack()
	const speedo = createSpeedo()
	let device: 0 | 1 | 2 = NONE
	/** Flag to prevent dragging while some child element is scrolling */
	let isScrolling = false
	/** Touch/Mouse is down */
	let pressed = false
	/** Indicates drag threshold crossed and we're in "dragging" mode */
	let isDragging = false
	const dragStart = {x: 0, y: 0}

	function onMouseDown (e: MouseEvent) {
		if (device === TOUCH) return
		cancelPress()
		if (e.button !== 0) return
		device = MOUSE
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
		onPress(e.clientX, e.clientY)
	}
	function onMouseMove (e: MouseEvent) {
		onMove(e.clientX, e.clientY, e)
	}
	function onMouseUp (e: MouseEvent) {
		window.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('mouseup', onMouseUp)
		onRelease(e.clientX, e.clientY)
	}

	function onTouchStart (e: TouchEvent) {
		if (device === MOUSE) return
		cancelPress()
		device = TOUCH
		el.addEventListener('touchmove', onTouchMove)
		el.addEventListener('touchend', onTouchEnd)
		const t = e.changedTouches[0]
		onPress(t.clientX, t.clientY)
	}
	function onTouchMove (e: TouchEvent) {
		const t = e.changedTouches[0]
		onMove(t.clientX, t.clientY, e)
	}
	function onTouchEnd (e: TouchEvent) {
		el.removeEventListener('touchmove', onTouchMove)
		el.removeEventListener('touchend', onTouchEnd)
		const t = e.changedTouches[0]
		onRelease(t.clientX, t.clientY)
	}

	function onPress (x: number, y: number) {
		isScrolling = false
		pressed = true
		dragStart.x = x
		dragStart.y = y
		speedo.start(0, Date.now() / 1000)
		document.addEventListener('scroll', onScroll, true)
	}

	function onMove (x: number, y: number, e: Event) {
		if (!pressed) return
		let dx = x - dragStart.x
		if (maxLeft != null) {
			dx = Math.max(dx, maxLeft())
		}
		if (maxRight != null) {
			dx = Math.min(dx, maxRight())
		}
		const dy = y - dragStart.y
		speedo.addSample(dx, Date.now() / 1000)
		if (!isDragging) {
			const ratio = dy !== 0 ? Math.abs(dx / dy) : 1000000000.0
			if (Math.abs(dx) < dragThreshold || ratio < dragRatio) {
				// Still not dragging. Bail out.
				return
			}
			// Distance threshold crossed - init drag state
			isDragging = true
			ondragstart && ondragstart(dx)
		}
		e.preventDefault()
		ondragmove && ondragmove(dx, speedo.getVel())
	}

	function onRelease (x: number, y: number) {
		document.removeEventListener('scroll', onScroll, true)
		pressed = false
		if (!isDragging) {
			// Never crossed drag start threshold, bail out now.
			return
		}
		isDragging = false
		const dx = x - dragStart.x
		speedo.addSample(dx, Date.now() / 1000)
		setTimeout(() => {
			if (!pressed) device = NONE
		}, DEVICE_DELAY)
		ondragend && ondragend(dx, speedo.getVel())
	}

	function onScroll (e: UIEvent) {
		isScrolling = true
		cancelPress()
	}

	function cancelPress() {
		if (!pressed) return
		if (device === MOUSE) {
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
		} else if (device === TOUCH) {
			el.removeEventListener('touchmove', onTouchMove)
			el.removeEventListener('touchend', onTouchEnd)
		}
		document.removeEventListener('scroll', onScroll, true)
		pressed = false
		if (isDragging) {
			isDragging = false
			ondragcancel && ondragcancel()
		}
	}

	function destroy() {
		el.removeEventListener('mousedown', onMouseDown)
		window.removeEventListener('mouseup', onMouseUp)
		window.removeEventListener('mousemove', onMouseMove)
		el.removeEventListener('touchstart', onTouchStart)
		el.removeEventListener('touchend', onTouchEnd)
		el.removeEventListener('touchmove', onTouchMove)
		document.removeEventListener('scroll', onScroll, true)
	}

	el.addEventListener('mousedown', onMouseDown)
	el.addEventListener('touchstart', onTouchStart)

	return {destroy}
}


// Workaround for webkit bug where event.preventDefault
// within touchmove handler fails to prevent scrolling.
const isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod/i)
let iOSHackApplied = false
function applyIOSHack() {
	// Only apply this hack if iOS, haven't yet applied it,
	// and only if a component is actually created
	if (!isIOS || iOSHackApplied) return
	window.addEventListener('touchmove', function(){})
	iOSHackApplied = true
}
