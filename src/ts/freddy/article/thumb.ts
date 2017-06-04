import * as m from 'mithril'
import {Article} from '../../models/article'
import viewerItem from '../../models/viewer'

export default function render (article: Article) {
	const thumb = article.thumb
	if (!thumb) return null
	return m('.thumb',
		m('img', {
			style: {width: thumb.width, height: thumb.height},
			onclick: (e: Event & {redraw?: false}) => {
				viewerItem(article)
				e.redraw = false
				m.route.set('/viewer')
			},
			onload: (e: Event & {redraw?: false}) => {
				(e.currentTarget as HTMLImageElement).classList.add('show')
				e.redraw = false
			},
			src: thumb.url
		})
	)
}
