import * as m from 'mithril'
import age from '../../lib/age'
import {Comment} from '../../models/article'

export default function render (comments: Comment[]) {
	const time = Date.now() / 1000
	return m('.comments',
		comments.map(c => renderCommentTree(c, time))
	)
}

function renderCommentTree (comment: Comment, time: number): m.Children {
	if (!comment || !comment.author) {
		return null
	}
	return m('div.comment',
		[
			m('.head',
				m('span.author', comment.author),
				m('span.meta',
					` ${comment.score} points ${age(time - (+comment.created_utc))}` + (comment.edited ? '*' : ''),
					comment.gilded ? m('span.symbol', m.trust('&#10024;')) : null,
					(comment.controversiality > 0) ? m('span.symbol', m.trust('&dagger;')) : null
				)
			),
			m('.body', comment.body)
		].concat(
			comment.replies.map(c => renderCommentTree(c, time) as m.Vnode<any,any>)
		)
	)
}
