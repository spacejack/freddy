import * as m from 'mithril'
import {triggerTransition} from '../../lib/html'
import {ItemImage} from '../../models/feed'

export interface Attrs {
	media: ItemImage
	onLoad?(): void
}

/** Renders image content */
export default {
	view ({attrs: {media, onLoad}}) {
		return m('img.image', {
			src: media.url,
			touchAction: 'none',
			onload (e: Event) {
				//(e.currentTarget as HTMLImageElement).classList.add('show')
				triggerTransition(e.currentTarget as Element, 'show')
				onLoad && onLoad()
			},
			onclick (e: MouseEvent & {redraw?: boolean}) {
				e.stopPropagation()
				e.redraw = false
				window.history.back()
			}
		})
	}
} as m.Component<Attrs>
