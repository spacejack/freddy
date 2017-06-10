import * as m from 'mithril'
import {About} from '../../models/feed'

export default function render (about: About) {
	return m('div', {style: {padding: '1em 0.4em 0 0'}},
		m('hr'),
		m('h2', about.display_name),
		m('.meta-body',
			m('p', "Subscribers: ",
				typeof about.subscribers === 'number' ?
					String(about.subscribers.toString()) : "?"
			),
			m('p', about.body)
		)
	)
}
