/*global $ */
/**  HTML utils */
$.html = (function() {

	return {
		unescape: function( escapedStr ) {
			if( !escapedStr ) return ''
			var div = document.createElement('div')
			div.innerHTML = escapedStr
			var child = div.childNodes[0]
			return child ? child.nodeValue : ''
		},

		setLinkTargets: function( baseEl, target ) {
			var anchors = baseEl.querySelectorAll('a')
			if( anchors ) {
				for( var i = 0, n = anchors.length; i < n; ++i ) {
					anchors[i].setAttribute('target', target)
				}
			}
		},

		/**
		 *  Adjust links in Reddit content feed.
		 *  @param baseEl {HTMLElement} Element containing HTML with <a> links
		 *  @param domain {string} Domain to use when link points to self (i.e. has no domain)
		 *  @param forceSecure {boolean} Ensure https for any links adjusted
		 */
		setLinkDomains: function( baseEl, domain, forceSecure ) {
			forceSecure = (forceSecure === undefined) ? true : !!forceSecure
			var a, url
			var anchors = baseEl.querySelectorAll('a')
			if( !anchors ) return;
			for( var i = 0, n = anchors.length; i < n; ++i ) {
				a = anchors[i]
				url = a.href
				if( url ) {
					if( url.indexOf('://') < 0 ) {
						if( url.charAt(0) !== '/' ) {
							url = '/'+url
						}
						url = $.browser.protocol + '//' + domain + url
						a.href = url
					}
					// Check for links to own host... need to change to reddit.
					if( url.indexOf($.browser.protocol+'//'+$.browser.hostname) === 0 ) {
						url = url.replace($.browser.hostname, domain)
						// Force to secure?
						if( forceSecure && url.indexOf('https:') < 0 ) {
							url = url.replace('http:', 'https:')
						}
						a.href = url
					}
				}
			}
		},

		//  Prepare for Reddit. Should probably be in a reddit util lib
		prep: function( escapedStr ) {
			var html = $.html.unescape(escapedStr)
			var div = document.createElement('div')
			div.innerHTML = html
			$.html.setLinkTargets(div, '_blank')
			$.html.setLinkDomains(div, 'www.reddit.com', true)
			return div.innerHTML
		}
	}
}());
