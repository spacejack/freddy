import * as m from 'mithril'
import {transitionPromise} from '../../lib/html'

const loading: m.FactoryComponent = function() {
	let timer: number | undefined
	return {
		oncreate({dom}) {
			// Don't display spinner unless we wait for some amount of time
			timer = setTimeout(() => {
				dom.classList.add('show')
				timer = undefined
			}, 1000)
		},
		onbeforeremove({dom}) {
			if (timer != null) {
				// Spinner never appeared - remove immediately
				clearTimeout(timer)
				timer = undefined
				return Promise.resolve()
			}
			// Fade out spinner
			return transitionPromise(dom, 'show')
		},
		view() {
			return m('.loading',
				 m('.loading-spinner', [
					m('.bar', {style: 'animation-delay: 0s'}),
					m('.bar', {style: 'animation-delay: 0.25s'}),
					m('.bar', {style: 'animation-delay: 0.5s'}),
					m('.bar', {style: 'animation-delay: 0.75s'})
				])
			)
		}
	}
}

export default loading
