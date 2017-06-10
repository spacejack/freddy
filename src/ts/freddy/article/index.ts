import * as m from 'mithril'
import * as stream from 'mithril/stream'
import {Stream} from 'mithril/stream'
import {Article, article as articleStream} from '../../models/article'
import {Preferences, preferences as prefsStream} from '../../models/options'
import renderContent from './content'

function render (article: Article | undefined, prefs: Preferences) {
	return m('.panel.panel-article',
		m('.panel-head',
			m('.btn-panelnav',
				{
					style: {marginRight: '0.5em'},
					onclick: (e: Event & {redraw?: boolean}) => {
						e.redraw = false
						window.history.back()
					}
				},
				m.trust('&#9666;')
			),
			m('div', {style: {display: 'inline-block'}}, "Article comments")
		),
		m('.panel-content',
			article
				? renderContent(article, prefs)
				: m('.content-loading', "Loading...")
		)
	)
}

/** A stream containing current VDOM */
export default stream.combine(
	(a: Stream<Article|undefined>, p: Stream<Preferences>) => render(a(), p()),
	[articleStream, prefsStream]
)
