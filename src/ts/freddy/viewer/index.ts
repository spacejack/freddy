import * as m from 'mithril'
import {fit as fitRc} from '../../lib/rect'
import wait from '../../lib/wait'
import viewerItem from '../../models/viewer'

interface State {
	imgUrl: string,
	width: number,
	height: number,
	resizeCallback?(): void,
}

/**
 * This component is more complex than it othrwise might be because
 * we want to fade the image in after it loads. Unfortunately we can't
 * use image onload events for cross-domain image urls unless the image
 * tag is built with an HTML string. Additionally, there is no way to
 * catch an onload event for a background image (which would greatly
 * simplify positioning and scaling.)
 */
export default {
	resizeCallback: undefined,
	imgUrl: '',
	width: 1,
	height: 1,

	oninit() {
		const item = viewerItem()
		if (!item || !item.image) {
			console.warn("No item for viewer to display")
			return
		}
		const img = item.image
		this.imgUrl = img.url
		// Now scale the image to container size
		const rc = document.body.getBoundingClientRect()
		const size = fitRc(img.width, img.height, rc.width, rc.height)
		this.width = size.w
		this.height = size.h
	},

	oncreate ({dom}) {
		// Fade in bg
		wait(1).then(() => {dom.classList.add('show')})
		// Fade in image after it loads
		const imgEl = dom.firstChild!.firstChild as HTMLImageElement
		imgEl.addEventListener('load', () => {
			imgEl.classList.add('show')
		})
		// Need to resize img element on window resize
		this.resizeCallback = resize.bind(this, imgEl)
		window.addEventListener('resize', this.resizeCallback!)
	},

	onbeforeremove ({dom}) {
		// Remove resize listener
		window.removeEventListener('resize', this.resizeCallback)
		this.resizeCallback = undefined
		// Fade out viewer (and contents) on close
		dom.classList.remove('show')
		return new Promise(resolve => {
			dom.addEventListener('transitionend', resolve)
		})
	},

	view () {
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
					}
				},
				// Image request will fail unless we build it as HTML string
				m.trust(
					`<img src="${this.imgUrl}"`
					+ ' class="image"'
					+ ` style="width:${this.width}px;height:${this.height}px"`
					+ '/>'
				)
			)
		)
	}
} as m.Comp<{},State>

function resize (this: State, imgEl: HTMLImageElement) {
	const rc = document.body.getBoundingClientRect()
	const size = fitRc(this.width, this.height, rc.width, rc.height)
	imgEl.style.width = size.w.toString() + 'px'
	imgEl.style.height = size.h.toString() + 'px'
}
