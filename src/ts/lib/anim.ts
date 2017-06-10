/* Set X position of an element via style transform:translate3d() */
export function setPosX (el: HTMLElement, x: number) {
	el.style.transform = `translate3d(${x}px,0,0)`
}

/** Transition a value */
export function easeOutLoop (
	x0: number, x1: number, dur: number,
	onloop: (x: number) => any, done?: () => any
) {
	// Wait a frame before we start animating
	// (because redraw or other stuff may be happening)
	//requestAnimationFrame(() => {
	const startT = Date.now()
	const dist = x1 - x0
	function loop() {
		const t = Date.now() - startT
		let x: number
		let s: number
		if (t >= dur) {
			onloop(x1)
			done && done()
		} else {
			s = Math.pow(t / dur, 0.4)
			x = x0 + s * dist
			onloop(x)
			requestAnimationFrame(loop)
		}
	}
	loop()
	//})
}

/** Transition an element's x position */
export function easeOutX (
	el: HTMLElement, x0: number, x1: number, dur: number,
	complete?: () => any
) {
	easeOutLoop(x0, x1, dur, x => {setPosX(el, x)}, complete)
}
