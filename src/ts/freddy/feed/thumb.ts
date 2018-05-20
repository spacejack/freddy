import * as m from 'mithril'
import {Item} from '../../models/feed'
import viewerItem from '../../models/viewer'
import {playIcon} from '../svg'

export default function render (item: Item) {
	/* return m('img.thumb', {
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
	}) */
	return m('.thumb',
		{
			oncreate (vnode) {
				const img = new Image()
				img.onload = () => {
					vnode.dom.classList.add('show')
				}
				img.src = item.thumbnail
			},
			onclick (e: Event & {redraw?: boolean}) {
				viewerItem(item)
				e.redraw = false
				m.route.set('/viewer')
			},
			style: `background-image: url(${item.thumbnail})`
		},
		item.media && item.media.type === 'video' && playIcon()
	)
}
