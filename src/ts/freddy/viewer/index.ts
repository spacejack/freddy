import * as m from 'mithril'
import {readyDom, transitionPromise} from '../../lib/html'
import viewerItem from '../../models/viewer'
import {ItemImage, ItemVideo} from '../../models/feed'

/**
 * Fullscreen overlay with media content.
 */
const viewer: m.FactoryComponent = function() {
	let media: ItemImage | ItemVideo

	return {
		oninit() {
			const item = viewerItem()
			if (!item || !item.media) {
				console.warn("No item for viewer to display")
				return
			}
			media = item.media
		},

		oncreate ({dom}) {
			// Fade in bg
			readyDom(dom)
			dom.classList.add('show')
		},

		onbeforeremove ({dom}) {
			// Fade out viewer (and contents) on close
			dom.classList.remove('show')
			return transitionPromise(dom)
		},

		view() {
			return m('.viewer',
				{
					onclick: (e: MouseEvent & {redraw?: false}) => {
						e.redraw = false
						window.history.back()
					}
				},
				media.type === 'image'
					? m(image, {media})
					: m(video, {media})
			)
		}
	}
}

export default viewer

/** Renders image content */
const image: m.Component<{media: ItemImage}> = {
	view ({attrs: {media}}) {
		return m('img.image', {
			src: media.url,
			touchAction: 'none',
			onload (e: Event & {redraw?: false}) {
				(e.currentTarget as HTMLImageElement).classList.add('show')
				e.redraw = false
			},
			onclick (e: MouseEvent & {redraw?: boolean}) {
				e.stopPropagation()
				e.redraw = false
				window.history.back()
			}
		})
	}
}

/** Renders video content */
const video: m.FactoryComponent<{media: ItemVideo}> = function({attrs: {media}}) {
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
		view() {
			return m('video.video', {
				src: media.url,
				autoplay: true,
				controls: true,
				loop: true,
				playsinline: true,
				oncanplay (e: Event & {redraw?: false}) {
					const vid = e.currentTarget as HTMLVideoElement
					// Use size from video
					width = vid.videoWidth
					height = vid.videoHeight
					resize()
					vid.classList.add('show')
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
