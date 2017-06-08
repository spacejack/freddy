import * as m from 'mithril'
import viewer from './viewer'
import menu from './menu'
import feedView from './feed'
import optionsView from './options'
import sidebarView from './sidebar'
import articleView from './article'

export interface Attrs {
	menuOpen?: boolean
	viewerOpen?: boolean
}

export default {
	view ({attrs: {menuOpen, viewerOpen}}) {
		return m('.freddy',
			optionsView(),
			sidebarView(),
			feedView(),
			articleView(),
			viewerOpen && m(viewer),
			menuOpen && m(menu),
			m('.logger')
		)
	}
} as m.Component<Attrs,{}>
