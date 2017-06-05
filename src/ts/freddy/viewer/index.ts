import * as m from 'mithril'
import wait from '../../lib/wait'
import viewerItem from '../../models/viewer'

interface State {
	imgUrl: string
}

/**
 * This component is more complex than it othrwise might be because
 * we want to fade the image in after it loads, unfortunately we can't
 * use image onload events for background images.
 */
export default {
	imgUrl: '',

	oninit() {
		const item = viewerItem()
		if (!item || !item.image) {
			console.warn("No item for viewer to display")
			return
		}
		this.imgUrl = item.image.url
	},

	oncreate ({dom}) {
		// We can't detect when a background image loads, so load it in
		// an image object to know when it loads.
		const img = new Image()
		img.onload = () => {
			// Fade in image that's displayed when loaded
			dom.querySelector('.content')!.classList.add('show')
		}
		img.src = this.imgUrl
		// Fade in bg
		wait(1).then(() => {dom.classList.add('show')})
	},

	onbeforeremove ({dom}) {
		// Fade out viewer (and contents) on close
		dom.classList.remove('show')
		return new Promise(resolve => {
			dom.addEventListener('transitionend', resolve)
		})
	},

	view() {
		return m('.viewer',
			{
				onclick: (e: MouseEvent & {redraw?: boolean}) => {
					e.redraw = false
					window.history.back()
				}
			},
			m('.content',
				{
					touchAction: 'none',
					onclick: (e: MouseEvent & {redraw?: boolean}) => {
						e.stopPropagation()
						e.redraw = false
						window.history.back()
					},
					style: {
						backgroundImage: `url(${this.imgUrl})`
					}
				}
			)
		)
	}
} as m.Comp<{},State>
