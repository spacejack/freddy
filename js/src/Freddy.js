/*global
	$, Rect, Anim, SubGroup, Article, Feed, PanelSet,
	Viewer, Menu, AlertBox, Prefs, Slider, Router
*/
/* exported Freddy */

/**
 *  Freddy: A fast mobile Reddit reader
 *  Copyright (c) 2015 by Mike Linkovich
 *  www.spacejack.ca
 */
var Freddy = (function(){

var HIDE_DIST = 40  // distance to hide something offscreen
var THEMES = ['light','dark']

function Freddy() {

	/** {Rect} Current known bounding client rect of app container */
	var rcApp = null
	/** {Anim} */
	var anim = null
	/** {Viewer} */
	var viewer = null
	/** {Menu} */
	var menuSort = null
	var menuTheme = null

	var panels = {}

	//  UI Components
	var subGroup = null
	var feedPanel = null
	var article = null
	var panelSet = null

	var prefs = null
	var router = null

	var curFeed = ''

	/**
	 *  Public run method
	 */
	function run() {

		if( $.browser.isFramed ) {
			window.top.location.href = window.location.href
		}

		rcApp = new Rect($('#container').getBoundingClientRect())
		prefs = Prefs()
		//  Check for user prefs saved in cookie
		prefs.load()
		//  Ensure UI is in sync with current settings
		var o = prefs.options
		$('#btn_theme').textContent = o.theme ? $.string.capitalize(o.theme) : 'Default'
		$('#chk_article_images').checked = !!o.article_images
		$('#chk_thumb_images').checked = !!o.thumb_images
		$('#chk_nsfw').checked = !!o.nsfw
		$('#chk_history').checked = !!o.history
		//$('#chk_confirmquit').checked = !!o.confirmquit
		$('#chk_savecookie').checked = !!o.savecookie
		if( o.theme ) setTheme(o.theme)

		console.log((o.history ? "" : "not ")+"using history states")

		//  CSS transform animation helper
		anim = Anim()

		router = Router(
			[
				// 'home' is default route
				{name:'home', rx:/^\/home$/, go:gotoHome},
				{name:'options', rx:/^\/options$/, go:gotoOptions},
				{name:'sidebar', rx:/^\/sidebar$/, go:gotoSidebar},
				{name:'article', rx:/^\/r\/[0-9A-Za-z\-_]+\/comments\/[0-9A-Za-z\-_]+\/[\w\u00C0-\u017F\-]+/, go:gotoArticle},
				{name:'feed', rx:/\/r\/[0-9A-Za-z\-_]+$/, go:gotoFeedUrl},
				{name:'viewer', rx:/^\/viewer$/, go:function(){}}
			],
			{
				defaultRouteName: 'home',
				useHashes: prefs.options.history
			}
		)

		viewer = Viewer({
			rcApp: rcApp,
			anim: anim,
			router: router
		})

		menuSort = Menu({
			anim: anim,
			title: "Sort by",
			items: [
				{id:"hot", title:"Hot"},
				{id:"new", title:"New"},
				{id:"rising", title:"Rising"},
				{id:"controversial", title:"Controversial"},
				{id:"top", title:"Top"}
			],
			onSelect: function(id) {feedPanel.reloadAndRender({order:id, nsfw: o.nsfw})}
		})

		menuTheme = Menu({
			anim: anim,
			title: "Select Theme",
			items: [
				{id:"default", title:"Default"},
				{id:"light", title:"Light"},
				{id:"dark", title:"Dark"}
			],
			onSelect: function(id) {setTheme(id)}
		})

		panels = {
			feed: $('#feed_panel'),
			left: $('#left_panel'),
			right: $('#right_panel'),
			article: $('#article_panel')
		}
		feedPanel = Feed({
			rcApp: rcApp,
			viewer: viewer,
			thumbs: o.thumb_images,
			onSelect: function(permalink) {
				router.go(permalink)
			}
		})
		article = Article({
			elPanel: $('#article_panel'),
			elScroll: $('#article_panel_content'),
			rcApp: rcApp,
			viewer: viewer,
			images: o.article_images,
			onSlideClose: function() {
				router.popUrl()
			}
		})
		subGroup = SubGroup({
			subs: prefs.subs,
			onSelect: function(feed) {
				var url = feed ? '/r/'+feed : ''
				router.go(url)
			},
			onAdd: function(feed) {
				prefs.notifyChange()
				console.log('added sub:', feed)
			},
			onDelete: function(feed) {
				prefs.notifyChange()
				console.log('removed sub:', feed)
			}
		})
		subGroup.render($('#subreddit_list'))

		var feed = ''

		if( o.history ) {
			//  Making use of location.hash
			//  On startup, see if there's a URL
			//  we should go to (feed, article)
			var rawurl = window.location.hash
			var url = router.sanitizeUrl(rawurl)
			if( url ) {
				var route = router.matchRoute(url)
				if( route ) {
					if( route.name === 'feed' ) {
						feed = url.substr(3).replace('/', '')
					} else if( route.name === 'article' ) {
						router.updateHash('')
						router.pushUrl(url)
					} else {
						router.updateHash('')
					}
				} else {
					router.updateHash('')
				}
			}
		}

		feedPanel.loadAndRender(feed)

		//  Init the article panel to just off-screen
		anim.setPos(panels.article, rcApp.width + HIDE_DIST, 0)
		panels.article.style.visibility = 'visible'
		//  3-panel slider
		panelSet = PanelSet({
			rcApp: rcApp,
			elMain: $('#feed_panel'),
			elLeft: $('#left_panel'),
			elRight: $('#right_panel'),
			elScroll: $('#feed_panel_content'),
			onChange: onPanelChange
		})

		if( $.browser.isStandalone ) {
			// Hide message to add to homescreen if already added
			$('#homescreen_note').style.display = 'none'
		}

		console.log("initializing events")

		initHandlers()
	}

	////////////////////////////////////////////////////////////////////
	//   Private Methods

	function initHandlers() {

		// left arrow button (goes to options and back to main)
		$.click( $('#btn_feed_l'), function() {
			var curPanel = panelSet.curPanel()
			if( curPanel === Slider.CENTER ) {
				router.go('/options')
			}
			else if( curPanel === Slider.RIGHT ) {
				//  Closing options - check & save prefs.
				//  Delay until after panel slides
				//  (in case location.hash use was turned on/off)
				setTimeout(savePrefs, 600)
				router.back()
			}
		}, false, 'btn_arrow_press')

		// right arrow button (goes to Sidebar and back to main)
		$.click( $('#btn_feed_r'), function() {
			var curPanel = panelSet.curPanel()
			if( curPanel === Slider.CENTER ) {
				router.go('/sidebar')
			}
			else if( curPanel === Slider.LEFT ) {
				router.back()
			}
		}, false, 'btn_arrow_press')

		// article panel left arrow (closes article)
		$.click(
			$('#btn_article_close'),
			function() {
				router.back()
			},
			false,
			'btn_arrow_press'
		)

		/*$.click( $('#btn_subreddit_add'), function() {
			$("#txt_subreddit_add").blur()
			subGroup.addSub($('#txt_subreddit_add').value)
		})*/
		$('#btn_subreddit_add').onclick = function() {
			try {
				subGroup.addSub($('#txt_subreddit_add').value)
			} catch( e ) {
				//alert(e);
				AlertBox(e)
			}
			this.blur()
		}

		$("#txt_subreddit_add").onkeyup = function (e) {
		    if (e.keyCode === 13) {
				$('#btn_subreddit_add').focus()
		    }
		}

		$('#btn_theme').onclick = function() {
			if( panelSet.curPanel() === Slider.RIGHT )
				menuTheme.toggle()
			this.blur()
		}

		$('#chk_nsfw').onchange = function() {
			prefs.setOption('nsfw', !!this.checked)
		}
		$('#chk_article_images').onchange = function() {
			var val = !!this.checked
			prefs.setOption('article_images', val)
			article.setOptions({images: val})
		}
		$('#chk_thumb_images').onchange = function() {
			var val = !!this.checked
			prefs.setOption('thumb_images', val)
			feedPanel.setOptions({thumbs: val})
		}
		$('#chk_history').onchange = function() {
			prefs.setOption('history', !!this.checked)
		}
		/*$('#chk_confirmquit').onchange = function() {
			prefs.setOption('confirmquit', !!this.checked)
		}*/
		$('#chk_savecookie').onchange = function() {
			prefs.setOption('savecookie', !!this.checked)
		}
		$.click( $('#btn_feed_menu'), function() {
			if( panelSet.curPanel() === 0 )
				menuSort.toggle()
		})

		window.addEventListener('resize', resize)

		console.log("running")
	}

	////////////////////////////////////////////
	//
	//  Controllers
	//
	function gotoHome() {
		gotoFeed('')
	}

	/**
	 *  Go to feed by feed name
	 */
	function gotoFeed( feed ) {
		if( viewer.isOpen() ) {
			viewer.close()
			return
		}

		if( article.isOpen() ) {
			article.close(function(){feedPanel.enable()})
			return
		}

		//  Already loaded?
		if( curFeed === feed ) {
			panelSet.gotoMain()
			return
		}

		//  TODO: Load first then render

		feedPanel.clear()
		// Delay a moment while old content clears
		setTimeout( function(){
			//  Need to slide to feed panel?
			panelSet.gotoMain(function(){
				//  Then load, then render the new feed
				feedPanel.loadAndRender(feed, {nsfw: prefs.options.nsfw})
				curFeed = feed
			})
		}, 100)
	}

	/**
	 *  Go to subreddit or frontpage by URL
	 *  @param {string} url Eg: '/r/programming' or '' for frontpage
	 */
	function gotoFeedUrl( url ) {
		if( !url || url === '/r/' ) gotoFeed('')  // frontpage
		if( url.indexOf('/r/') !== 0 ) throw "Unrecognized feed url: "+url
		//  Get feed name from url
		var feed = url.substr(3)
		if( feed.charAt(feed.length-1) === '/' ) feed = feed.substr(0, feed.length-1)
		if( !feed.match(/^[A-Za-z0-9_\-]+$/) ) throw "Bad feed: '"+feed+"' url: "+url
		gotoFeed(feed)
	}

	/**  Go to options panel */
	function gotoOptions() {
		var curPanel = panelSet.curPanel()
		if( curPanel === Slider.CENTER )
			panelSet.gotoLeft()
		if( article.isOpen() )
			article.close()
	}

	/**  Go to sidebar panel */
	function gotoSidebar() {
		var curPanel = panelSet.curPanel()
		if( curPanel === Slider.CENTER )
			panelSet.gotoRight()
		if( article.isOpen() )
			article.close()
	}

	/**
	 *  Go to article from feed panel click
	 *  @param {string} url Eg: '/r/programming/comments/a1b2c3/article_title/'
	 */
	function gotoArticle( url ) {
		if( viewer.isOpen() ) {
			viewer.close()
			return
		}
		feedPanel.disable()
		article.open(url)
	}

	//  End Controllers /////////////////////////

	/**
	 *  Change the theme by loading a css file
	 */
	function setTheme(theme) {
		theme = theme || null
		if( theme === 'default' ) theme = null
		if( theme && THEMES.indexOf(theme) < 0 ) {
			console.warn('Unrecognized theme:', theme)
			return
		}
		var cssFile = (theme ? theme : 'default') + '.css'
		var el = $('#css_theme')
		if( el ) {
			//  theme <link> element was already added, just change its src attrib
			el.href = 'css/themes/'+cssFile
		} else {
			//  must add a <link> element to load the css file
			document.body.insertAdjacentHTML('beforeend',
				'<link type="text/css" id="css_theme" rel="stylesheet" href="css/themes/'+cssFile+'" media="screen"/>'
			)
		}
		//  try to set the address bar color (sometimes works on some platforms)
		var color = '#333333'
		if( prefs.options.theme === 'light' ) color = '#888888'
		else if( prefs.options.theme === 'dark' ) color = '#222222'
		if( !!(el = $('#meta_theme_color')) )
			el.content = color
		if( !!(el = $('#meta_ios_theme_color')) )
			el.content = color
		el = null
		prefs.setOption('theme', theme)
		$('#btn_theme').textContent = theme ? $.string.capitalize(theme) : 'Default'
	}

	/**
	 *  Called whenever options panel is closed.
	 *  Prefs will only save when changed.
	 */
	function savePrefs() {
		var uh = router.getOption('useHashes') // remember previous hashes setting
		prefs.save()
		router.setOptions({useHashes:prefs.options.history})
		// Was location.hash option turned on/off?
		if( uh && !prefs.options.history ) {
			// History was turned off. Erase history stack..
			window.history.go(-window.history.length)
			// Reset hash to nothing.
			window.location.hash = ''
		} else if( !uh && prefs.options.history ) {
			// History was turned on.
			router.updateHash('')
		}
	}

	/**
	 *  This catches events where the panel was swiped to a new position.
	 *  (as opposed to clicked, which is handled elsewhere)
	 */
	function onPanelChange(cur, prev) {
		if( cur !== prev ) {
			if( prev === Slider.RIGHT ) {
				//  Navigated away from prefs - try saving
				savePrefs()
			}
			//  Since the slide has already "navigated" visually, we
			//  just want to update the router's state without
			//  actually performing routing or redundant animation.
			if( cur === Slider.RIGHT ) {  // main panel is on the right, so options is current panel
				router.updateUrl('/options')
			} else if( cur === Slider.LEFT ) { // main panel is on the left, so sidebar is current
				router.updateUrl('/sidebar')
			} else if( cur === Slider.CENTER ) { // main panel is current
				router.popUrl()  // back to home from options or sidebar
			}
		}
	}

	/**  Called on rezie events */
	function resize() {
		//  Update app Rect. This is referenced in other modules,
		//  so they'll get this update too.
		rcApp.copy($('#container').getBoundingClientRect())
		//  Alert other components of resize
		panelSet.resize()
		article.resize()
	}

	////////////////////////////////////////////////////////////////////
	//  Public interface
	return {
		run: run
	}
}

return Freddy

}());
