import * as m from 'mithril'
import {Item} from '../../models/feed'
import viewerItem from '../../models/viewer'

export default function render (item: Item) {
	return m('img.thumb', {
		onclick: (e: Event & {redraw?: boolean}) => {
			viewerItem(item)
			e.redraw = false
			m.route.set('/viewer')
		},
		onload: (e: Event & {redraw?: boolean}) => {
			(e.currentTarget as HTMLImageElement).classList.add('show')
			e.redraw = false
		},
		src: item.thumbnail
	})
}
