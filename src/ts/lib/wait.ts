/** Wait for a specified number of frames */
export default function wait (frames: number) {
	if (!frames || frames < 1) {
		return Promise.resolve()
	}
	return new Promise<void>(resolve => {
		let count = 0
		function loop() {
			if (count >= frames) {
				resolve()
			} else {
				++count
				requestAnimationFrame(loop)
			}
		}
		loop()
	})
}
