/*global $, Anim */
/*exported Feed */

/**
 *  Loads & renders list of articles in a subreddit
 */
var Feed = (function(){

var FEED_URL = $.browser.protocol+'//www.reddit.com/'
var SORT_ORDERS = [
	'hot', 'new', 'rising', 'controversial', 'top'
]
var IMG_FADEIN_DUR = 200

function Feed( opts ) {

	opts = opts || {}
	/** in dev mode, load cached file locally to avoid hitting reddit every reload/test */
	var isLocal = $.browser.domainIsLocal()
	/**  Current feed name, eg "programming" */
	var curFeed = ''
	/**  Current sort order (one of SORT_ORDERS) */
	var curOrder = ''
	var callbacks = {
		onSelect: opts.onSelect
	}
	var anim = Anim()
	var viewer = opts.viewer
	var options = {
		thumbs: !!opts.thumbs
	}
	opts = null
	var disabled = false
	var loadMorePointer = null

	function setOptions( o ) {
		options.thumbs = !!o.thumbs
	}

	function disable() {
		if( disabled ) return
		$('#feed_panel').disabled = true
		disabled = true
	}

	function enable() {
		if( !disabled ) return
		$('#feed_panel').disabled = false
		disabled = false
	}

	/**  Attach onSelect callback to element */
	function attachItemClickHandler( el, pressClass ) {
		if( !el ) return
		if( el.getAttribute('data-permalink') ) {
			$.click(el, function() {
				if(callbacks.onSelect) callbacks.onSelect(el.getAttribute('data-permalink'))
			}, false, pressClass)
		}
	}

	/**  Set the 'load more' click handler */
	function attachLoadMoreClickHandler( el, subName, after, opts ) {
		// Remove previous one if it was attached
		if(loadMorePointer) loadMorePointer.remove()
		// Attach new click handler. Hold on to returned Pointer so we can remove it later.
		loadMorePointer = $.click(el, function() {
			//e.stopPropagation()
			el.innerHTML = 'loading...'
			loadMore(
				subName, after,
				function(data){renderMore(subName, data, opts)}
			)
		})
	}

	/**  Setup image thumbnail fade-in on load, and click handler */
	function setupThumb( el ) {
		//  fade-in on load
		if( el.complete ) {
			anim.fadeIn(el, 200)
		} else {
			el.onload = function(){anim.fadeIn(el, 200)}
		}
		//  open fullscreen viewer on click
		var url = el.getAttribute('data-url')
		if( url ) {
			$.click(el, function(){
				viewer.open(url, +el.getAttribute('data-width'), +el.getAttribute('data-height'))
			})
		}
	}

	var numLoads = 0

	/**  Load articles for a subreddit */
	function load( feed, complete, completeMeta, error ) {
		numLoads++
		var url = (!isLocal || numLoads > 1 || feed) ?
		 	FEED_URL + (feed ? 'r/'+feed : '') + '.json' :
			'data/frontpage.json'
		curFeed = feed
		curOrder = ''

		$.xhr( url, {
			success: function(src) {
				var data
				try {
					data = JSON.parse(src)
				} catch( e ) {
					if( error ) error('Failed to parse json feed/about: '+e)
					return
				}
				if( feed && !$.string.cieq(feed, 'frontpage') && !$.string.cieq(feed, 'all') ) {
					// Load Sidebar content (except for frontpage or all because they don't exist)
					loadMeta(feed, completeMeta, error)
				}
				else {
					// Default sidebar content (empty..?)
					if(completeMeta) completeMeta()
				}
				if( complete ) complete(data)
			},
			error: function(e) {
				if( error ) error('Failed to load json feed/about: '+e)
			},
			accept: 'application/json'
		})
	}

	/**  Reload the current feed using the specified order */
	function reload( order, complete, error ) {
		var url = FEED_URL + (curFeed ? 'r/'+curFeed : '') + (order ? '/'+order : '') + '.json'
		curOrder = order
		$.xhr( url, {
			success: function(src) {
				var data
				try {
					data = JSON.parse(src)
				} catch( e ) {
					if( error ) error('Failed to parse reloaded json feed: '+e)
					return
				}
				if( complete ) complete(data)
			},
			error: function(e) {
				if( error ) error('Failed to reload json feed: '+e)
			},
			accept: 'application/json'
		})
	}

	/**  Load additional articles for the current feed/order */
	function loadMore( feed, after, complete, error ) {
		var url = FEED_URL + (feed ? 'r/'+feed : '') + (curOrder ? '/'+curOrder : '') + '.json?after=' + after
		$.xhr( url, {
			success: function(src) {
				var data
				try {
					data = JSON.parse(src)
				} catch( e ) {
					if( error ) error('Failed to parse json feed/about: '+e)
					return
				}
				if( complete ) complete(data)
			},
			error: function(e) {
				if( error ) error('Failed to load json feed/about: '+e)
			},
			accept: 'application/json'
		})
	}

	/**  Load sidebar content for this subreddit */
	function loadMeta( feed, complete, error ) {
		var url = (!isLocal || numLoads > 1) ?
		 	FEED_URL + (feed ? 'r/'+feed+'/' : '') + 'about.json' :
			'data/about.json'
		$.xhr( url, {
			success: function(src) {
				var data
				try {
					data = JSON.parse(src)
				} catch( e ) {
					if( error ) error('Failed to parse json feed: '+e)
					return
				}
				if( complete ) complete(data)
			},
			error: function(e) {
				if( error ) error('Failed to load json feed: '+e)
			},
			accept: 'application/json'
		})
	}

	function makeItemThumb( item ) {
		var imgs, img, num,
			imgFull, fullWidth = 0, fullHeight = 0, fullUrl = ''
		if( !item || !item.thumbnail ) return ''
		var url = item.thumbnail
		if( url.indexOf('http://') < 0 && url.indexOf('https://') < 0 )
			return ''
		if( $.browser.isSecure ) {
			url = url.replace('http://', 'https://')
		}

		//  Does it have preview images?
		if( item.preview && !!(imgs = item.preview.images) && imgs.length > 0 ) {
			img = imgs[0]
			if( !!(imgs = img.resolutions) && (num = imgs.length) > 0 ) {
				imgFull = viewer.selectImgSize(imgs,
					$.browser.screenSize.width, $.browser.screenSize.height)
				fullWidth = +imgFull.width
				fullHeight = +imgFull.height
				fullUrl = imgFull.url
				if( url.indexOf('http://') < 0 && url.indexOf('https://') < 0 ) {
					fullUrl = ''
				} else if( $.browser.isSecure ) {
					fullUrl = fullUrl.replace('http://', 'https://')
				}
			}
		}

		var html = '<img id="item_thumb_'+item.id+'" src="'+url+'" class="item_thumb" style="opacity:0" data-url="'+fullUrl+'" data-width="'+fullWidth+'" data-height="'+fullHeight+'"/>'
		return html
	}

	function renderItem( item, curTime ) {
		var isSelfPost = !!item.is_self
		var id = item.id
		var thumbHtml = options.thumbs ? makeItemThumb(item) : ''
		var html =
			'<div id="item_'+id+'" class="item">' +
				'<div class="item_left">' +
					thumbHtml +
					(isSelfPost ?
					'<p id="item_head_'+id+'" class="item_title" data-permalink="'+item.permalink+'" data-url="'+item.url+'" touch-action="none">' + item.title + '</p>' :
					'<p id="item_head_'+id+'" class="item_title"><a href="'+item.url+'" target="_blank">' + item.title + '</a></p>'
					) +
					'<p class="item_details">' +
						'(' + item.domain + ') ' +
						item.score + ' points' +
						" by " + item.author +
						" in " + item.subreddit +
						" " + $.date.toAgeString(+item.created_utc, curTime) +
					'</p>' +
				'</div>' +
				'<div id="article_link_'+id+'" data-permalink="'+item.permalink+'" class="item_right">' +
					'<p id="article_link_c_'+id+'">&ldquo;' + item.num_comments + '&rdquo;</p>' +
				'</div>' +
			'</div>'
		return html
	}

	function renderItemList( items, opts ) {
		opts = opts || {}
		var item //, items = data.data.children
		var i, num = items.length
		var html = ''
		var curTime = Math.round(Date.now() / 1000)

		for( i = 0; i < num; ++i ) {
			item = items[i].data
			if( item.over_18 && !opts.nsfw ) {
				continue
			}
			if( !!$('#item_'+item.id) ) {
				continue  // already rendered from a previous load
			}
			html += renderItem( item, curTime )
		}

		return html
	}

	/**  Render currently loaded feed */
	function render( subName, data, opts ) {
		opts = opts || {}
		var el = $('#feed_panel_content')
		var items = data.data.children
		var num = items.length
		var id = 0, i

		var html =
			'<div id="items" style="opacity:0" data-feed="'+subName+'">' +
				renderItemList(data.data.children, opts)
		if( data.data.after ) {
			html +=
				'<div id="feed_loadmore_block" class="feed_loadmore_block">' +
					'load more articles...' +
				'</div>'
		}
		html += '</div>'

		el.innerHTML = html

		// attach click handlers
		for( i = 0; i < num; ++i ) {
			id = items[i].data.id
			attachItemClickHandler($('#item_head_'+id), 'item_left_press')
			attachItemClickHandler($('#article_link_'+id), 'item_right_press')
		}

		// attach load more click handler
		if( !!(el = $('#feed_loadmore_block')) ) {
			attachLoadMoreClickHandler(el, subName, data.data.after, opts )
		}

		// setup thumbnails
		if( options.thumbs ) {
			for( i = 0; i < num; ++i ) {
				id = items[i].data.id
				if( !!(el = $('#item_thumb_'+id)) )
				setupThumb(el)
			}
			el = null
		}

		anim.fadeIn($('#items'), 400, opts.complete)
	}

	/**
	 *  Append-render another page of items from this feed
	 */
	function renderMore( subName, data, opts ) {
		var el, elImg

		//  We want to insert just in front of the 'load more' button
		if( !(el = $('#feed_loadmore_block')) ) {
			console.warn("Couldn't find feed_loadmore_block element")
			return
		}
		var html = renderItemList(data.data.children, opts)
		el.insertAdjacentHTML('beforebegin', html)

		// attach click handlers
		var items = data.data.children
		var i, id, num = items.length

		for( i = 0; i < num; ++i ) {
			id = items[i].data.id
			attachItemClickHandler($('#item_head_'+id))
			attachItemClickHandler($('#article_link_'+id))
		}

		// setup thumbnails
		if( options.thumbs ) {
			for( i = 0; i < num; ++i ) {
				id = items[i].data.id
				if( !!(elImg = $('#item_thumb_'+id)) )
				setupThumb(elImg)
			}
			elImg = null
		}

		// attach load more click handler
		if( data.data.after ) {
			attachLoadMoreClickHandler(el, subName, data.data.after, opts)
			el.innerHTML = 'load more articles...'
		}
		else {
			// TODO: disable click handler
			el.style.display = 'none'
		}
	}

	/**  Render sidebar content */
	function renderMeta( jdata ) {
		var info = (jdata && jdata.data) ? jdata.data : {}
		var html = ''
		if( typeof info.subscribers === 'number' )
			html += '<p>Subscribers: '+(info.subscribers || '')+'</p>'
		html += $.html.prep(info.description_html || '')
		$('#feed_meta_name').innerHTML = info.title || ''
		$('#feed_meta_body').innerHTML = html
	}

	function clear( feed ) {
		var feedTitle = feed ? '/r/'+feed : 'Frontpage'
		$('#feed_title_text').innerHTML = feedTitle
		$('#feed_panel_content').innerHTML = ''
	}

	function loadAndRender( feed, opts ) {
		opts = opts || {}
		var feedTitle = feed ? '/r/'+feed : 'Frontpage'
		$('#feed_title_text').innerHTML = feedTitle
		$('#feed_panel_content').innerHTML =
			'<br/><div class="loading_message">loading...</div>'
		load(
			feed,
			function(data) {
				render(feed, data, {nsfw: opts.nsfw})
				if( opts.complete ) opts.complete()
			},
			function(data) {
				renderMeta(data)
				if( opts.completeMeta ) opts.completeMeta()
			}
		)
	}

	function reloadAndRender( opts ) {
		var order = opts.order
		if( SORT_ORDERS.indexOf(order) < 0 || order === 'hot' ) order = ''
		$('#feed_panel_content').innerHTML =
			'<br/><div class="loading_message">loading...</div>'
		reload(
			order,
			function(data) {
				render(curFeed, data, {nsfw: opts.nsfw})
				if( opts.complete ) opts.complete()
			}
		)
	}

	//////////////////////////////////////////////////////////
	//  Public interface
	return {
		clear: clear,
		load: load,
		render: render,
		loadAndRender: loadAndRender,
		reloadAndRender: reloadAndRender,
		setOptions: setOptions,
		disable: disable,
		enable: enable
	}
}

return Feed

}());
