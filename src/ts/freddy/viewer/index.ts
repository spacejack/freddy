import * as m from 'mithril'
import {triggerTransition, transitionPromise} from '../../lib/html'
import viewerItem from '../../models/viewer'
import {ItemImage, ItemVideo} from '../../models/feed'
import image from './image'
import video from './video'
import loading from './loading'

/**
 * Fullscreen overlay with media content.
 */
const viewer: m.FactoryComponent = function() {
	let media: ItemImage | ItemVideo
	let isLoading = true

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
			triggerTransition(dom, 'show')
		},

		onbeforeremove ({dom}) {
			// Fade out viewer (and contents) on close
			return transitionPromise(dom, 'show')
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
					? m(image, {media, onLoad() {isLoading = false}})
					: m(video, {media, onLoad() {isLoading = false}}),
				isLoading && m(loading)
			)
		}
	}
}

export default viewer
