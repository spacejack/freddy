import * as m from 'mithril'
import menuContent from '../../models/menu'
import {options, THEMES, Preferences, reset as resetOptions} from '../../models/options'
import renderSubredditList from './subreddit-list'
import subredditAdd from './subreddit-add'
import renderPrefCheck from './pref-check'

function render (prefs: Preferences, subreddits: string[]) {
	return m('.panel.panel-options',
		m('.panel-head',
			m('div', {style: {display: 'inlineBlock'}},
				m('img', {src: 'img/logo.svg', class: 'svg-logo'}),
				m('span', "Freddy")
			)
		),
		m('.panel-content',
			m('.options-content',
				renderSubredditList(subreddits),
				m('hr'),
				m(subredditAdd),
				m('hr'),
				m('.options-block',
					m('h2', "Preferences:"),
					m('p', {style: {marginBottom: '1em'}},
						m('span', "Theme:"),
						m('button',
							{
								style: {marginLeft: '0.4em'},
								onclick: (e: Event & {redraw?: boolean}) => {
									menuContent({
										title: "Select Theme",
										text: '',
										items: THEMES.map(t =>
											({id: t.name, text: t.title})
										)
									})
									e.redraw = false
									m.route.set('/menu')
								}
							},
							"Default"
						),
						m('p', renderPrefCheck('articleThumbs', "Show article images")),
						m('p', renderPrefCheck('feedThumbs', "Show thumbnail images")),
						m('p', renderPrefCheck('nsfw', "Show NSFW content (18+)"))
					),
					m('hr'),
					m('p',
						{
							style: {
								textAlign: 'center',
								margin: '1em 0'
							},
							onclick: (e: Event & {redraw?: boolean}) => {
								menuContent({
									title: "Reset all Subreddits and preferences to defaults?",
									text: '',
									items: [
										{id: 'yes', text: "Yes"},
										{id: 'no', text: "No"}
									],
									onselect: id => {
										if (id === 'yes') {
											resetOptions()
										}
									}
								})
								e.redraw = false
								m.route.set('/menu')
							}
						},
						m('button', "Reset to defaults")
					)
				)
			)
		)
	)
}

/** A stream containing current VDOM */
export default options.map(o => render(o.preferences, o.subreddits))
