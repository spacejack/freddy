import * as m from 'mithril'
import {isStandalone, isMobile} from '../../lib/browser'
import age from '../../lib/age'
import {Article} from '../../models/article'
import {Preferences} from '../../models/options'
import renderThumb from './thumb'
import renderComments from './comments'

export default function render (article: Article, prefs: Preferences) {
	const time = Date.now() / 1000
	return m('.article',
		m('.content-block',
			prefs.articleThumbs && renderThumb(article),
			m('.title',
				article.is_self
					? m.trust(article.title)
					: m('a',
						isMobile.iOS && isStandalone
							? {href: article.url}
							: {href: article.url, target: '_blank', rel: 'noopener'},
						m.trust(article.title)
					)
			),
			m('p.info',
				`${article.domain} [+${article.score}] `,
				m('a',
					{
						href: `/r/${article.subreddit}`,
						onclick: (e: Event & {redraw?: boolean}) => {
							e.preventDefault()
							e.redraw = false
							m.route.set(
								`/r/${article.subreddit}`, undefined, {replace: true}
							)
						}
					},
					`/r/${article.subreddit}`
				),
				` ${age(time - article.created_utc)} by ${article.author}`
			),
			article.body && m('p.body', article.body)
		),
		renderComments(article.comments, time)
	)
}
