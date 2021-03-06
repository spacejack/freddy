import * as m from 'mithril'
import age from '../../lib/age'
import {Comment} from '../../models/article'

export default function render (comments: Comment[], time: number) {
	return m('.comments',
		comments.map(c => renderCommentTree(c, time))
	)
}

function renderCommentTree (comment: Comment, time: number): m.Children {
	if (!comment || !comment.author) {
		return null
	}
	return m('.comment',
		m('.head',
			{
				onclick: (e: Event & {redraw?: boolean}) => {
					(e.currentTarget as HTMLElement).parentElement!.classList.toggle('collapsed')
					e.redraw = false
				}
			},
			m('span.author', comment.author),
			m('span.meta',
				` ${comment.score} points ${age(time - (+comment.created_utc))}`,
				comment.edited && '*',
				comment.gilded > 0 && m('span.symbol', m.trust('&#10024;')),
				comment.controversiality > 0 && m('span.symbol', m.trust('&dagger;'))
			)
		),
		m('.body', comment.body),
		comment.replies.map(c => renderCommentTree(c, time) as m.Vnode<any,any>)
	)
}
