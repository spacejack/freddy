import * as m from 'mithril'
import {isStandaloneIOS} from '../../lib/browser'
import {About, about as aboutStream} from '../../models/feed'

function render (about: About | undefined) {
	return m('.panel.panel-sidebar',
		m('.panel-head.panel-sidebar-head', "Sidebar"),
		m('.panel-content.panel-sidebar-content',
			m('div',
				{style: {padding: '1em 0.4em 0 0'}},
				m('p',
					m('strong', "Freddy."),
					m('span', " A fast Reddit reader.")
				),
				m('p',
					m('a', isStandaloneIOS
						? {
							href: 'https://github.com/spacejack/freddy'
						}
						: {
							href: 'https://github.com/spacejack/freddy',
							target: '_blank',
							rel: "noopener"
						},
						"Github Repo"
					)
				),
				m('p',
					{style: {fontSize: '0.75em'}},
					"This app works better when you add it to your homescreen."
				)
			),
			m('div', {style: {padding: '1em 0.4em 0 0'}},
				m('hr'),
				m('h2', about ? about.display_name : ""),
				m('.sidebar-meta-body',
					m('p', "Subscribers: ",
						(about && typeof about.subscribers === 'number') ?
							String(about.subscribers.toString()) : "?"
					),
					m('p', about ? about.body : "")
				)
			)
		)
	)
}

/** A stream containing current VDOM */
export default aboutStream.map(about => render(about))
