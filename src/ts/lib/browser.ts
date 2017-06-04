// Misc Browser utils

export const protocol = window.location.protocol
export const hostname = window.location.hostname
export const port = window.location.port
export const baseUrl = protocol + '//' + hostname + (port ? ':' + port : '')
export const pixelRatio = window.devicePixelRatio || 1
export const isSecure = protocol.indexOf('https') >= 0
export const isFramed = window.self !== window.top

export const screenSize = {
	width: window.screen.width * pixelRatio,
	height: window.screen.height * pixelRatio
}

/** True if app was launched from homescreen. */
export const isStandalone: boolean = (function() {
	// Safari
	if (navigator['standalone'] != null) {
		return !!navigator['standalone']
	}
	// Windows IE/Edge
	if (window.external && window.external['msIsSiteMode']) {
		return window.external['msIsSiteMode']()
	}
	// Chrome
	if (window.matchMedia('(display-mode: standalone)').matches) {
		return true
	}
	return false
}())

const pubDomains = ['spacejack.ca', 'spacejack.github']

/**
 * @return true if local domain
 */
export function domainIsLocal (_domain?: string) {
	const domain = ((_domain || hostname) + '').toLowerCase()
	return pubDomains.find(pubDomain => domain.indexOf(pubDomain) >= 0)
}

export const isMobile = (function(){
	const a = !!navigator.userAgent.match(/Android/i)
	const bb = !!navigator.userAgent.match(/BlackBerry/i)
	const ios = !!navigator.userAgent.match(/iPhone|iPad|iPod/i)
	const o = !!navigator.userAgent.match(/Opera Mini/i)
	const w = !!navigator.userAgent.match(/IEMobile/i)
	const ff = !!navigator.userAgent.match(/\(Mobile/i)
	const any = (a || bb || ios || o || w || ff)
	return {
		Android: a,
		BlackBerry: bb,
		iOS: ios,
		Opera: o,
		Windows: w,
		FireFox: ff,
		any: any
	}
}())

export const isStandaloneIOS = isStandalone && isMobile.iOS
