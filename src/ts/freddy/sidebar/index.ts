import * as m from 'mithril'
import {About, about as aboutStream} from '../../models/feed'
import renderAppInfo from './app-info'
import renderSubredditInfo from './subreddit-info'

function render (about: About | undefined) {
	return m('.panel.panel-sidebar',
		m('.panel-head', "Sidebar"),
		m('.panel-content',
			renderAppInfo(),
			about && renderSubredditInfo(about)
		)
	)
}

/** A stream containing current VDOM */
export default aboutStream.map(render)
