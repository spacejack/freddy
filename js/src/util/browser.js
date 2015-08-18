/*global $ */
/**  Browser utils */
$.browser = (function(){

	var hostname = window.location.hostname || ''
	var protocol = window.location.protocol || ''
	var pixelRatio = window.devicePixelRatio || 1

	var pubDomains = ['spacejack.ca','spacejack.github']

	function domainIsLocal(d) {
		d = d || hostname
		d = (''+d).toLowerCase()
		for( var i = 0, n = pubDomains.length; i < n; ++i )
			if( d.indexOf(pubDomains[i]) >= 0 )
				return false
		return true
	}

	function isStandalone() {
		if( navigator.standalone !== undefined )
			return !!navigator.standalone;
		if( window.external && window.external.msIsSiteMode )
			return !!window.external.msIsSiteMode();
		// Chrome???
		//return (screen.height - document.documentElement.clientHeight ???);
		return false;
	}

	function isSecure() {
		return (protocol.indexOf('https') >= 0)
	}

	function isFramed() {
		return window.self !== window.top
	}

	function screenSize() {
		return {width:(screen.width * pixelRatio), height:(screen.height * pixelRatio)};
	}

	var isMobile = {
		Android: function() { return !!navigator.userAgent.match(/Android/i); },
		BlackBerry: function() { return !!navigator.userAgent.match(/BlackBerry/i); },
		iOS: function() { return !!navigator.userAgent.match(/iPhone|iPad|iPod/i); },
		Opera: function() { return !!navigator.userAgent.match(/Opera Mini/i); },
		Windows: function() { return !!navigator.userAgent.match(/IEMobile/i); },
		FirefoxOS: function() { return !!navigator.userAgent.match(/\(Mobile/i); },
		any: function() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || isMobile.FirefoxOS()); }
	}

	return {
		domainIsLocal: domainIsLocal,
		isStandalone: isStandalone(),
		isSecure: isSecure(),
		isFramed: isFramed(),
		hostname: hostname,
		protocol: protocol,
		screenSize: screenSize(),
		pixelRatio: pixelRatio,
		isMobile: isMobile
	}

}());
