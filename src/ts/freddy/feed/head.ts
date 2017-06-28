import * as m from 'mithril'
import {CENTER} from '../../lib/slider'
import slider3 from '../../lib/slider3'
import renderMenuSort from './menu-sort'

export default function render (subreddit: string, title: string) {
	return m('.panel-head',
		m('div',
			{
				style: {
					float: 'left', maxWidth: '70%', overflow: 'hidden',
					whiteSpace: 'nowrap'
				}
			},
			// Left Arrow button
			m('.btn-panelnav',
				{
					style: {marginRight: '0.5em'},
					onclick: (e: Event & {redraw?: false}) => {
						e.redraw = false
						if (slider3.getLayout() === CENTER) {
							m.route.set('/options')
						} else {
							window.history.back()
						}
					}
				},
				m.trust('&#9666;')
			),
			m('div', {style: {display: 'inline-block'}}, title)
		),
		m('div', {style: {float: 'right', textAlign: 'right'}},
			// Feed options menu button
			renderMenuSort(subreddit),
			// Right Arrow button
			m('.btn-panelnav',
				{
					style: {marginLeft: '0.25em'},
					onclick: (e: Event & {redraw?: false}) => {
						e.redraw = false
						if (slider3.getLayout() === CENTER) {
							m.route.set('/sidebar')
						} else {
							window.history.back()
						}
					}
				},
				m.trust('&#9656;')
			)
		)
	)
}