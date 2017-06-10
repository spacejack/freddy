import * as m from 'mithril'
import {load as loadFeed} from './models/feed'
import {load as loadArticle} from './models/article'
import freddy from './freddy'
import {
	setLayout as setMainLayout, LEFT, CENTER, RIGHT
} from './lib/panel3slider'
import {setLayout as setArticleLayout} from './lib/right-slider'

/** App routes */
export default {
	'/': {
		onmatch() {
			loadFeed('Frontpage', undefined, setMainLayout(CENTER))
			setArticleLayout(RIGHT)
			return freddy
		}
	},
	'/options': {
		onmatch() {
			setMainLayout(RIGHT)
			setArticleLayout(RIGHT)
			return freddy
		}
	},
	'/sidebar': {
		onmatch() {
			setMainLayout(LEFT)
			setArticleLayout(RIGHT)
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
			loadFeed(attrs.subreddit, undefined, setMainLayout(CENTER))
			setArticleLayout(RIGHT)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string},{}>,
	'/r/:subreddit/:sortby': {
		onmatch(attrs) {
			loadFeed(attrs.subreddit, attrs.sortby, setMainLayout(CENTER))
			setArticleLayout(RIGHT)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, sortby: string},{}>,
	'/r/:subreddit/comments/:postid/:slug': {
		onmatch(attrs) {
			loadArticle(
				`/r/${attrs.subreddit}/comments/${attrs.postid}/${attrs.slug}`,
				setArticleLayout(CENTER)
			)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, postid: string, slug: string},{}>,
	'/r/:subreddit/comments/:postid/:slug/:comment': {
		onmatch(attrs) {
			loadArticle(
				`/r/${attrs.subreddit}/comments/${attrs.postid}/${attrs.slug}/${attrs.comment}`,
				setArticleLayout(CENTER)
			)
			return freddy
		}
	} as m.RouteResolver<{subreddit: string, postid: string, slug: string, comment: string},{}>
}
