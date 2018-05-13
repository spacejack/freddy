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
	oncreate (vnode) {
		// We can't detect when a background image loads, so load it in
		// an image object to know when it's ready.
		const img = new Image()
		img.onload = () => {
			// Fade in image that's displayed when loaded
			vnode.dom.classList.add('show')
		}
		img.src = vnode.attrs.media.url
	},
	view ({attrs: {media}}) {
		return m('.image', {
			touchAction: 'none',
			onclick: (e: MouseEvent & {redraw?: boolean}) => {
				e.stopPropagation()
				e.redraw = false
				window.history.back()
			},
			style: `background-image: url(${media.url})`
		})
	}
}

/** Renders video content */
const video: m.FactoryComponent<{media: ItemVideo}> = function({attrs: {media}}) {
	let el: HTMLVideoElement

	function resize() {
		// Find best fit size for video element
		const rc = el.parentElement!.getBoundingClientRect()
		const wider = media.width / media.height > rc.width / rc.height
		el.style.width = wider ? '100%' : 'auto'
		el.style.height = wider ? 'auto' : '100%'
	}

	return {
		oncreate (vnode) {
			el = vnode.dom as HTMLVideoElement
			window.addEventListener('resize', resize)
			resize()
			// Fade in when video ready
			el.addEventListener('canplay', () => {
				el.classList.add('show')
			})
		},
		onremove() {
			window.removeEventListener('resize', resize)
		},
		view ({attrs: {media}}) {
			return m('video.video', {
				src: media.url,
				autoplay: true,
				controls: true,
				loop: true,
				playsinline: true,
				onclick: (e: MouseEvent & {redraw?: boolean}) => {
					e.stopPropagation()
					e.redraw = false
					window.history.back()
				}
			})
		}
	}
}
