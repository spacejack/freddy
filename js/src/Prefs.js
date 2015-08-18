/*global $ */
/*exported Prefs */

var Prefs = function Prefs() {

	var COOKIE_NAME = 'freddy_prefs'

	var DEFAULT_SUBS = [
		'all',
		'art',
		'askreddit',
		'books',
		'funny',
		'gadgets',
		'gamedev',
		'gaming',
		'javascript',
		'movies',
		'music',
		'pics',
		'programming',
		'science',
		'television',
		'videos',
		'webdev',
		'worldnews'
	]

	var THEMES = ['light','dark']

	var options = {
		theme: null,
		article_images: true,
		thumb_images: true,
		nsfw: false,
		history: !$.browser.isMobile.iOS(),  // iOS swipe-nav makes history problematic, so off by default.
		//confirmquit: false,
		savecookie: true
	}

	var optionsChanged = false
	var subs = DEFAULT_SUBS.slice()  // make a copy of defaults

	function load() {
		var prefs
		if( !$.cookies.exists(COOKIE_NAME) ) return false
		try {
			prefs = JSON.parse($.cookies.get(COOKIE_NAME))
		} catch( err ) {
			console.warn('Failed to parse previously saved cookie prefs:', err)
			return false
		}
		if( prefs.subs ) {
			//subs = prefs.subs
			var n = subs.length = prefs.subs.length
			for( var i = 0; i < n; ++i )
				subs[i] = prefs.subs[i]
		}
		if( prefs.options ) {
			var o = prefs.options
			options.theme = null
			if( o.theme && THEMES.indexOf(o.theme) >= 0 ) {
				options.theme = o.theme;
			}
			options.article_images = (typeof o.article_images === 'boolean') ? o.article_images : true
			options.thumb_images = (typeof o.thumb_images === 'boolean') ? o.thumb_images : true
			options.history = (typeof o.history === 'boolean') ? o.history : !$.browser.isMobile.iOS()
			options.nsfw = !!o.nsfw
			//options.confirmquit = !!o.confirmquit
			options.savecookie = true
		}
		console.log('loaded prefs from cookie')
		return true
	}

	function save() {
		if( !optionsChanged ) {
			return false
		}
		if( !options.savecookie ) {
			// User doesn't want to save cookies. Remove exisiting.
			if( $.cookies.exists(COOKIE_NAME) ) {
				$.cookies.remove(COOKIE_NAME)
				console.log('deleted prefs cookie')
			}
		}
		else
		{
			var prefs = {
				options: options,
				subs: subs
			}
			$.cookies.set(COOKIE_NAME, JSON.stringify(prefs), new Date(Date.now()+1000 * 60 * 60 * 24 * 365))
			console.log('saved prefs in cookie')
		}
		optionsChanged = false
		return true
	}

	function setOption( opt, val ) {
		if( options[opt] !== val ) {
			options[opt] = val
			notifyChange()
			return true
		}
		return false
	}

	//  Notify that a change happened externally
	//  TODO: eliminate this...
	function notifyChange() {
		optionsChanged = true
	}

	return {
		load: load,
		save: save,
		notifyChange: notifyChange,
		setOption: setOption,
		options: options,
		subs: subs
	}

};
