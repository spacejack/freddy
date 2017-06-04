import * as m from 'mithril'
import * as stream from 'mithril/stream'
import {addSubreddit} from '../../models/options'

interface State {
	newSub: stream.Stream<string>
}

export default {
	newSub: undefined as any,

	oninit () {
		this.newSub = stream<string>()
	},

	view () {
		return (
			m('.subreddit-add-block',
				m('h2', "Add Subreddit:"),
				m('p',
					m('input',
						{
							class: 'txt-subreddit-add',
							type: 'text',
							maxlength: '21',
							oninput: (e: UIEvent & {redraw?: boolean}) => {
								this.newSub((e.currentTarget as HTMLInputElement).value)
								e.redraw = false
							},
							value: this.newSub()
						}
					),
					m('button',
						{
							style: {marginLeft: '0.4em'},
							onclick: () => {
								addSubreddit(this.newSub())
								this.newSub('')
							}
						},
						"Add"
					)
				)
			)
		)
	}
} as m.Comp<{},State>
