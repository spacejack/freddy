import * as m from 'mithril'
import {isStandalone, isStandaloneIOS} from '../../lib/browser'

/** Static content about App */
export default function render() {
	return m('div',
		{style: {padding: '1em 0.4em 0 0'}},
		m('p',
			m('strong', "Freddy."),
			" A fast Reddit reader."
		),
		m('p.small', "© 2016-2018 By Mike Linkovich"),
		m('p', {style: {paddingTop: '0.5em'}},
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
		!isStandalone && m('p',
			{style: {fontSize: '0.75em'}},
			"This app works better when you add it to your homescreen."
		)
	)
}
