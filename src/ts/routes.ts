import * as m from 'mithril'
import {load as loadFeed} from './models/feed'
import {load as loadArticle} from './models/article'
import freddy from './freddy'
import {default as slider, LEFT, CENTER, RIGHT} from './lib/slider'
import slider3 from './lib/slider3'

/** App routes */
export default {
	'/': {
		onmatch() {
			loadFeed('Frontpage', undefined, slider3.setLayout(CENTER))
			slider.setLayout(RIGHT)
			return freddy
		}
	},
	'/options': {
		onmatch() {
			slider3.setLayout(RIGHT)
			slider.setLayout(RIGHT)
			return freddy
		}
	},
	'/sidebar': {
		onmatch() {
			slider3.setLayout(LEFT)
			slider.setLayout(RIGHT)
			return freddy
		}
	},
	'/viewer': {
		render() {
			return m(freddy, {viewerOpen: true})
		}
	},
	'/menu': {
		render() {
			return m(freddy, {menuOpen: true})
		}
	},
	'/r/:subreddit': {
		onmatch(attrs) {
			loadFeed(attrs.subreddit, undefined, slider3.setLayout(CENTER))
			slider.setLayout(RIGHT)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string},{}>,
	'/r/:subreddit/:sortby': {
		onmatch(attrs) {
			loadFeed(attrs.subreddit, attrs.sortby, slider3.setLayout(CENTER))
			slider.setLayout(RIGHT)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, sortby: string},{}>,
	'/r/:subreddit/comments/:postid/:slug': {
		onmatch(attrs) {
			loadArticle(
				`/r/${attrs.subreddit}/comments/${attrs.postid}/${attrs.slug}`,
				slider.setLayout(CENTER)
			)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, postid: string, slug: string},{}>,
	'/r/:subreddit/comments/:postid/:slug/:comment': {
		onmatch(attrs) {
			loadArticle(
				`/r/${attrs.subreddit}/comments/${attrs.postid}/${attrs.slug}/${attrs.comment}`,
				slider.setLayout(CENTER)
			)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, postid: string, slug: string, comment: string},{}>
}
