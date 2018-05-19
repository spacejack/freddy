import * as m from 'mithril'
import {ItemVideo} from '../../models/feed'

export interface Attrs {
	media: ItemVideo
	onLoad?(): void
}

/** Renders video content */
const video: m.FactoryComponent<Attrs> = function({attrs: {media}}) {
	let el: HTMLVideoElement
	// Use reported size to start with
	let width = media.width || 240
	let height = media.height || 240

	function resize() {
		// Find best fit size for video element
		const rc = el.parentElement!.getBoundingClientRect()
		const wider = width / height > rc.width / rc.height
		el.style.width = wider ? '100%' : 'auto'
		el.style.height = wider ? 'auto' : '100%'
	}

	return {
		oncreate (vnode) {
			el = vnode.dom as HTMLVideoElement
			resize()
			window.addEventListener('resize', resize)
		},
		onremove() {
			window.removeEventListener('resize', resize)
		},
		view({attrs: {onLoad}}) {
			return m('video.video', {
				src: media.url,
				autoplay: true,
				controls: true,
				loop: true,
				playsinline: true,
				oncanplay (e: Event) {
					const vid = e.currentTarget as HTMLVideoElement
					// Use size from video
					width = vid.videoWidth
					height = vid.videoHeight
					resize()
					vid.classList.add('show')
					onLoad && onLoad()
				},
				onclick (e: MouseEvent & {redraw?: boolean}) {
					e.stopPropagation()
					e.redraw = false
					window.history.back()
				}
			})
		}
	}
}

export default video
