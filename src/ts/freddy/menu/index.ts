import * as m from 'mithril'
import {triggerTransition, transitionPromise} from '../../lib/html'
import wait from '../../lib/wait'
import menuContent from '../../models/menu'

export default {
	oncreate ({dom}) {
		// Fade-in menu
		triggerTransition(dom, 'show')
	},

	onbeforeremove ({dom}) {
		// Fade out menu on close
		return transitionPromise(dom, 'show')
	},

	view() {
		const menu = menuContent()
		if (!menu) {
			console.warn('menuContent empty')
			return
		}
		return m('.menu',
			{
				onclick: (e: Event & {redraw?: false}) => {
					e.redraw = false
					window.history.back()
				}
			},
			m('.content',
				m('.block',
					m('.title', menu.title),
					m('.items',
						menu.items.map(i =>
							m('.item',
								{
									onclick: (e: Event & {redraw?: false}) => {
										e.stopPropagation()
										e.redraw = false
										if (menu.onselect) {
											// Wait because we are going back first
											// then fire off the callback.
											wait(2).then(() => {
												menu.onselect && menu.onselect(i.id)
												m.redraw()
											})
										}
										window.history.back()
									}
								},
								i.text
							)
						)
					)
				)
			)
		)
	}
} as m.Component
