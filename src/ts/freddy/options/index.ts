import * as m from 'mithril'
import menuContent from '../../models/menu'
import {options, THEMES, Preferences, setPref, reset as resetOptions} from '../../models/options'
import {logo} from '../svg'
import renderSubredditList from './subreddit-list'
import subredditAdd from './subreddit-add'
import renderPrefCheck from './pref-check'

function render (prefs: Preferences, subreddits: string[]) {
	console.log("theme:", prefs.theme)
	return m('.panel.panel-options',
		m('.panel-head',
			m('div', {style: {display: 'inlineBlock'}},
				logo(),
				m('span', "Freddy")
			)
		),
		m('.panel-content',
			m('.options-content',
				m('h2', "Subreddits"),
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
										),
										onselect: id => {
											setPref('theme', id)
										}
									})
									e.redraw = false
									m.route.set('/menu')
								}
							},
							THEMES.find(t => t.name === prefs.theme)!.title
						),
						renderPrefCheck('articleThumbs', "Show article images"),
						renderPrefCheck('feedThumbs', "Show thumbnail images"),
						renderPrefCheck('nsfw', "Show NSFW content (18+)")
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
