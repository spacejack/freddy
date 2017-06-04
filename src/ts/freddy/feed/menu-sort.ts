import * as m from 'mithril'
import menuContent from '../../models/menu'

const sorts = [
	{id: 'hot', text: "Hot"},
	{id: 'new', text: "New"},
	{id: 'rising', text: "Rising"},
	{id: 'controversial', text: "Controversial"},
	{id: 'top', text: "Top"}
]

export default function render (subreddit: string) {
	return m('.btn-panelnav',
		{
			onclick: (e: Event & {redraw?: false}) => {
				menuContent({
					title: "Sort by",
					items: sorts.map(s => ({id: s.id, text: s.text})),
					onselect: id => {m.route.set(`/r/${subreddit}/${id}`)}
				})
				e.redraw = false
				m.route.set('/menu')
			}
		},
		m.trust('&middot;&middot;&middot;')
	)
}
