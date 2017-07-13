import * as m from 'mithril'
import * as stream from 'mithril/stream'
import {Stream} from 'mithril/stream'
import {ItemList, itemList, subreddit, title} from '../../models/feed'
import {Preferences, preferences} from '../../models/options'
import renderHead from './head'
import renderItemList from './item-list'
import renderLoadMore from './loadmore'

function render (
	list: ItemList | undefined, subreddit: string, title: string,
	prefs: Preferences
) {
	return m('.panel.panel-feed',
		renderHead(subreddit, title),
		m('.panel-content',
			list
				? [
					m('.item-list', renderItemList(subreddit, list.items, prefs)),
					list.after && renderLoadMore(list.after)
				]
				: m('.content-loading', "loading...")
		)
	)
}

/** A stream containing current VDOM */
export default stream.combine(
	(list: Stream<ItemList|undefined>, prefs: Stream<Preferences>) =>
		render(list(), subreddit(), title(), prefs()),
	[itemList, preferences]
)
