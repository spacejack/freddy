import {baseUrl, isStandaloneIOS} from './browser'

/**
 * Prepare escaped HTML content for rendering
 */
export function prepEscapedHtml (escapedHtml: string) {
	// unescape
	const div0 = document.createElement('div')
	div0.innerHTML = escapedHtml
	const div = document.createElement('div')
	div.innerHTML = div0.childNodes[0].nodeValue || ''
	const links = div.querySelectorAll('a')
	for (let i = 0; i < links.length; ++i) {
		const a = links[i]
		const href0 = a.href
		let href = href0.startsWith(baseUrl)
			? 'https://www.reddit.com' + href0.substr(baseUrl.length)
			: href0
		// Convert links to app links where possible
		const apphref = appLink(href)
		if (apphref) href = apphref
		if (href !== href0) {
			a.href = href
		}
		// set target=_blank for off-site links (except iOS homescreen app)
		if (!isStandaloneIOS && href[0] !== '#') {
			a.target = '_blank'
			a.rel = 'noopener'
		}
	}
	return div.innerHTML
}

/**
 * Check if a link needs to be turned into an app link.
 * Returns undefined if not converted.
 * TODO: Only convert reddit URLs that the app will handle.
 */
export function appLink (link: string) {
	if (!link) return undefined
	if (link.startsWith('/r/')) {
		return '#!' + link
	}
	if (link.startsWith('http://www.reddit.com/r/')) {
		return '#!' + link.substr(21)
	}
	if (link.startsWith('https://www.reddit.com/r/')) {
		return '#!' + link.substr(22)
	}
	if (link.startsWith('http://reddit.com/r/')) {
		return '#!' + link.substr(17)
	}
	if (link.startsWith('https://reddit.com/r/')) {
		return '#!' + link.substr(18)
	}
	return undefined
}
