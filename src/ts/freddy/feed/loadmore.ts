import * as m from 'mithril'
import {loadMore} from '../../models/feed'

export default function render (after: string) {
	return m('.loadmore-block',
		{onclick: () => {loadMore(after)}},
		"load more articles..."
	)
}
