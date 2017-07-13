import * as m from 'mithril'
import age from '../../lib/age'
import {isStandalone, isMobile} from '../../lib/browser'
import {Item} from '../../models/feed'
import {Preferences} from '../../models/options'
import renderThumb from './thumb'

export default function render (
	subreddit: string, item: Item, time: number, prefs: Preferences
) {
	return m('.item', {key: item.id},
		m('.left',
			(prefs.feedThumbs && item.thumbnail) && renderThumb(item),
			item.is_self
				? m('p', {class: 'title self'},
					m('a',
						{
							href: item.permalink,
							oncreate: m.route.link
						},
						m.trust(item.title)
					)
				)
				: m('p', {class: 'title'},
					m('a',
						isMobile.iOS && isStandalone
						? {
							// Currently iOS homescreen app won't allow target _blank
							// however offsite links will open in a new safari window.
							href: item.url
						}
						: {
							href: item.url,
							target: '_blank',
							rel: 'noopener'
						},
						m.trust(item.title)
					)
				),
			m('p.details',
				item.subreddit.toLowerCase() === subreddit.toLowerCase()
					? `(${item.domain}) ${item.score} points by ${item.author}` +
						` ${age(time - item.created_utc)}`
					: [
						`(${item.domain}) ${item.score} points by ${item.author} in `,
						m('a', {href: `/r/${item.subreddit}`, oncreate: m.route.link}, item.subreddit),
						' ' + age(time - item.created_utc)
					]
			)
		),
		m('.right',
			{
				onclick: (e: Event & {redraw?: boolean}) => {
					e.redraw = false
					m.route.set(item.permalink)
				}
			},
			m('p', `“${item.num_comments}”`)
		)
	)
}
