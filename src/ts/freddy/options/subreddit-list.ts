import * as m from 'mithril'
import {removeSubreddit} from '../../models/options'
import menuContent from '../../models/menu'

export default function render(subreddits: string[]) {
	return m('.subreddit-list',
		subreddits.map((s: string) =>
			s.toLowerCase() === 'frontpage'
				? m('.subreddit-item',
					{
						key: s,
						onclick: (e: Event & {redraw?: boolean}) => {
							e.redraw = false
							m.route.set('/', undefined, {replace: true})
						}
					},
					s
				)
				: m('.subreddit-item',
					{
						key: s,
						onclick: (e: Event & {redraw?: boolean}) => {
							e.redraw = false
							m.route.set('/r/' + s, undefined, {replace: true})
						}
					},
					m('.subreddit-item-text', "/r/" + s),
					m('.subreddit-item-delete',
						{
							onclick: (e: Event & {redraw?: false}) => {
								e.stopPropagation()
								menuContent({
									title: `Are you sure you want to delete the subreddit "${s}"`,
									items: [
										{id: 'yes', text: "Yes"},
										{id: 'no', text: "No"}
									],
									onselect: id => {
										if (id === 'yes') removeSubreddit(s)
									}
								})
								e.redraw = false
								m.route.set('/menu')
							}
						},
						"-"
					),
					m('br', {clear: 'all'})
				)
		)
	)
}
