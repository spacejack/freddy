/*exported Router, Route */

/**
 *  Route object
 */
var Route = function Route( name, rx, fn ) {
	if( name && typeof name === 'object' ) {
		this.copy(name)
	}
	else {
		this.name = name
		this.rx = rx
		this.fn = fn
	}
}
Route.prototype.copy = function(r) {
	this.name = r.name
	this.rx = r.rx
	this.fn = r.fn
	return this
}
Route.prototype.constructor = Route

/**
 *  Router module
 *  @param {Array<Route>} routes
 *  @param {string} opts.defaultRoutName The route to use as default
 *  @param {boolean} useHashes Whether or not to use location.hash
 */
var Router = function Router(routes, opts) {
	routes = routes || []
	opts = opts || {}
	var defaultRouteName = opts.defaultRouteName || 'home'
	var useHashes = !!opts.useHashes
	var defaultUrl = opts.defaultUrl || ''
	opts = null

	var curRoute = (routes.length > 0) ? getRouteByName(defaultRouteName) : null
	var curUrl = defaultUrl
	var noGo = false
	var noPush = false
	var urlStack = [curUrl]  // url history stack

	var MAX_ROUTE_LENGTH = 250  // url length sanity check

	// Allowed pattern for routes
	var ROUTE_SAFE_RX = /^[\w\u00C0-\u017F\-\/]*$/

	/**  Change options after Router instance was created. */
	function setOptions( opts ) {
		if( typeof opts.useHashes === 'boolean' ) {
			if( useHashes !== opts.useHashes ) {
				useHashes = opts.useHashes
				if( useHashes ) { // turn on
					window.addEventListener('hashchange', onHashChange)
				} else {  // turn off
					window.removeEventListener('hashchange', onHashChange)
				}
			}
		}
		// else { Other options?
	}

	function getOption( opt ) {
		if( opt === 'useHashes' ) return useHashes
	}

	function clearHistory() {
		urlStack = [defaultUrl]
	}

	/**
	 *  Clean up an input url, anything illegal
	 *  results in default route url: ''
	 *  TODO: throw exception? return false?
	 */
	function sanitizeUrl(url) {
		var u = url || ''
		u = u.trim()
		if( !u ) return u
		var i = u.lastIndexOf('#')
		if( i >= 0 ) u = u.substr(i+1).trim()
		// final validation checks
		if( !u || u.length > MAX_ROUTE_LENGTH || !u.match(ROUTE_SAFE_RX) ) return ''
		// url ok!
		return u
	}

	/**  Add a route */
	function add( route ) {
		if( routes.hasOwnProperty(route.name) ) throw "Route '"+route.name+"' already exists"
		routes[route.name] = route
		return true
	}

	/**  Find route by name */
	function getRouteByName( routeName ) {
		if( !routeName ) return null
		for( var i = 0, n = routes.length; i < n; ++i )
			if( routes[i].name.toLowerCase() === routeName.toLowerCase() )
				return routes[i]
		return null
	}

	/**  Match a URL to a route by its regex */
	function matchRoute( url ) {
		var route
		if( !url ) {
			// Empty URL. Use default route.
			if( !(route = getRouteByName(defaultRouteName)) )
				throw "Default route '"+defaultRouteName+"' not found"
			return route
		}
		for( var name in routes ) if( routes.hasOwnProperty(name) ) {
			route = routes[name]
			if( url.match(route.rx) ) {
				console.log("Matched url", url, "to route", route.name)
				return route
			}
		}
		return null
	}

	function gotoUrl( url ) {
		var route
		var u = sanitizeUrl(url)
		if( curRoute === u ) return false
		if( !(route = matchRoute(u)) ) {
			throw "Could not match any route for url: '" + u + "'"
		}
		curRoute = route
		curUrl = u
		route.go(u)  // invoke callback
		return true
	}

	/**
	 *  Routes to specified URL.
	 *  Does not use or update hash.
	 *  Adds to urlStack.
	 */
	function pushUrl( url ) {
		//var oldUrl = curUrl
		if( gotoUrl(url) )
			urlStack.push(url)
	}

	/**
	 *  Go to the given URL.
	 *  Updates hash, performs routing.
	 */
	function go( url ) {
		if( useHashes ) {
			// Change the location.hash and let our event listener handle it.
			// Note this is async
			url = sanitizeUrl(url)
			document.location.hash = url ? '#'+url : ''
		} else {
			// Perform routing, not using location.hash
			// Note this is sync (should we make async for consistency?)
			pushUrl(url)
		}
	}

	function back() {
		if( urlStack.length <= 1 ) {
			throw "Cannot go back, history stack empty."
		}
		urlStack.pop()
		if( useHashes ) {
			noPush = true
			window.history.back()
		} else {
			var l = urlStack.length
			var url = (l > 0) ? urlStack[l-1] : ''
			gotoUrl(url)  //  Don't push this url on stack
		}
	}

	/**
	 *  When we want to set the hash (eg. after routing without hash change)
	 */
	function updateHash() {
		if( !useHashes ) return
		var hash = curUrl ? '#'+curUrl : ''
		noGo = true
		window.location.hash = hash
	}

	/**
	 *  When we want to set the hash (eg. after routing without hash change)
	 *  and when the current route & url need to be updated.
	 *  Does not perform routing.
	 */
	function updateUrl( url ) {
		var u = sanitizeUrl(url)
		var r = matchRoute(u)
		if( !r ) console.warn('failed to match route to url:', url)
		urlStack.push(curUrl)
		curRoute = r
		curUrl = u
		updateHash()
	}

	/**
	 *  When a hash change has been detected, call this to trigger the route.
	 */
	function onHashChange() {
		if( noGo ) {
			// Routing was prevented. Allow next time...
			noGo = false
			return
		}
		var url = window.location.hash
		if( noPush ) {
			noPush = false
			gotoUrl(url)
		} else {
			pushUrl(url)
		}
	}

	function popUrl() {
		if( urlStack.length <= 1 )
			throw "popUrl: stack empty"
		//curUrl = urlStack.pop()
		urlStack.pop()
		curUrl = urlStack.length > 0 ? urlStack[urlStack.length-1] : ''
		curRoute = matchRoute(curUrl)
		if( useHashes ) {
			noGo = true
			window.history.back()
		}
	}

	if( useHashes ) {
		//  Listen for address bar hash changes.
		//  i.e., handle back button events.
		window.addEventListener('hashchange', onHashChange)
	}

	//  Public interface.
	//  Note that location.hash changes/events are only used when useHashes is true.
	return {
		/**  Typical route call. Performs routing & updates location.hash */
		go: go,
		/**  Go back to previous route, hash updated */
		back: back,
		/**  Add a route object */
		add: add,
		/**  Returns a route object by name */
		getRouteByName: getRouteByName,
		/**  Returns current route object */
		curRoute: function(){return curRoute},
		/**  Returns current url */
		curUrl: function(){return curUrl},
		/**  Change some options */
		setOptions: setOptions,
		getOption: getOption,

		clearHistory: clearHistory,

		//  Lower-level calls. Don't use unless necessary...
		/**  Executes route, does not read or change location.hash */
		gotoUrl: gotoUrl,
		/**  Executes route, does not read or change location.hash. Pushes url onto urlStack */
		pushUrl: pushUrl,
		/**  Go to the url in location.hash */
		onHashChange: onHashChange,
		/**  Update hash without routing */
		updateHash: updateHash,
		/**  Update hash url and current route when route has changed outside of Router. Does not perform routing. */
		updateUrl: updateUrl,
		/**  Pops one off the history stack without navigating. */
		popUrl: popUrl,
		sanitizeUrl: sanitizeUrl,
		matchRoute: matchRoute
	}

};
