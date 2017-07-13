import * as fastClick from 'fastclick'
import * as m from 'mithril'
import wait from './lib/wait'
import slider3 from './lib/slider3'
import {default as slider, LEFT, CENTER, RIGHT} from './lib/slider'
import {load as loadOptions} from './models/options'
import routes from './routes'

/*if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register(
		'/sw.js', {scope: '/'}
	).then(reg => {
		console.log('SW registration succeeded. Scope: ', reg.scope)
	}).catch(err => {
		console.log('SW registration failed: ', err)
	})
}*/

/**
 * Mount Mithril app routes
 */
function mountApp() {
	m.route(document.body, '/', routes)

	// Initialize sliders.
	// Wait 2 frames so initial routing & mounting are complete because
	// we need to use DOM elements that are created by components.
	wait(2).then(() => {
		const dom = document.querySelector('.freddy') as HTMLElement
		slider3.mount(
			dom.querySelector('.panel-feed') as HTMLElement,
			dom.querySelector('.panel-options') as HTMLElement,
			dom.querySelector('.panel-sidebar') as HTMLElement,
			position => {
				if (position === CENTER) {
					window.history.back()
				} else if (position === LEFT) {
					m.route.set('/sidebar')
				} else if (position === RIGHT) {
					m.route.set('/options')
				}
			}
		)
		slider.mount(
			dom.querySelector('.panel-article') as HTMLElement,
			position => {
				if (position === RIGHT) {
					// Panel was swiped-closed - back to prev url.
					window.history.back()
				}
			}
		)
	})
}

// Load user options from local storage
loadOptions()

// Setup fastclick
fastClick(document.body)

// If started in sidebar or options, redirect to home
if (window.location.hash === '#!/options' || window.location.hash === '#!/sidebar') {
	window.history.replaceState(undefined, '', '#!/')
	wait(1).then(mountApp)
} else {
	mountApp()
}

// Hot reloading when in development
declare const module: any
if (module.hot) module.hot.accept()
