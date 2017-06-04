import * as fastClick from 'fastclick'
import * as m from 'mithril'
import wait from './lib/wait'
import {
	init as initMainSlider, LEFT, CENTER, RIGHT
} from './lib/panel3slider'
import {init as initArticleSlider} from './lib/right-slider'
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

// Setup fastclick
fastClick(document.body)

// Load user options from local storage
loadOptions()

//
// Mount Mithril app routes
//
m.route(document.body, '/', routes)

// Initialize sliders.
// Wait 2 frames so initial routing & mounting are complete because
// we need to use DOM elements that are created by components.
wait(2).then(() => {
	const dom = document.querySelector('.freddy') as HTMLElement
	initMainSlider(
		dom.querySelector('.panel-options') as HTMLElement,
		dom.querySelector('.panel-feed') as HTMLElement,
		dom.querySelector('.panel-sidebar') as HTMLElement,
		position => {
			if (position === CENTER) {
				window.history.back()
			} else if (position === LEFT) {
				m.route.set('/sidebar')
			} else if (position === RIGHT) {
				m.route.set('/options')
			}
			console.log("Slider position changed to:", position)
		}
	)
	initArticleSlider(
		dom.querySelector('.panel-article') as HTMLElement,
		position => {
			if (position === RIGHT) {
				// Panel was swiped-closed - back to prev url.
				window.history.back()
			}
		}
	)
})

// Hot reloading when in development
declare const module: any
if (module.hot) module.hot.accept()
