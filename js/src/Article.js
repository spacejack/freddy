/*global $, Anim, Slider */
/*exported Article */

var Article = (function(){

var CACHE_MAX_AGE = 60 * 1000  // 1 min
var FADEIN_DUR = 300  // 1/3 sec
var IMG_FADE_DUR = 200
var IMG_MAX_HEIGHT = 133
var IMG_MAX_WIDTH = 200

/**
 *  Loads, renders & sets up event handlers for articles & comments
 *  @param {Rect} opts.rcApp Rect reference, kept updated by caller.
 *  @param {Viewer} opts.viewer
 *  @param {function} opts.onSlideClose Called when user slides/drags Article closed
 *  @param {boolean} images If true, render article thumb image with fullscreen viewer launcher
 */
function Article( opts ) {

	opts = opts || {}
	var elPanel = opts.elPanel
	var elScroll = opts.elScroll
	var rcApp = opts.rcApp
	var anim = Anim()
	var viewer = opts.viewer
	var callbacks = {
		onSlideClose: opts.onSlideClose
	}
	var isOpen = false
	var articleCache = Object.create(null)
	var protocol = window.location.protocol.indexOf('https') >= 0 ? 'https' : 'http'
	var options = {
		images: !!opts.images
	}
	opts = null

	var slider = Slider({
		elPanel: elPanel,
		elScroll: elScroll,
		state: Slider.RIGHT,
		xSlideCenter: 0.0,
		xSlideLeft: 0.0,
		xSlideRight: 1.0,
		hideDistRight: 40,  // article should sit off stage so shadow doesn't appear
		springDur: 300,
		rcApp: rcApp,
		anim: anim,
		onMove: null,
		onChange: function(s) {
			var oldOpen = isOpen
			// Article is open if the article slider is in the center position
			isOpen = (s === Slider.CENTER)
			if( !isOpen && (oldOpen !== isOpen) && callbacks.onSlideClose ) {
				callbacks.onSlideClose()
			}
		}
	})

	////////////////////////////////////////////////////////////////////

	/**  Some options can be changed after instantiation */
	function setOptions(o) {
		options.images = !!o.images
	}

	/**
	 *  Recursively build comments HTML element tree
	 */
	function buildCommentTreeHtml( cdata, tNow ) {
		if( !cdata || !cdata.author ) return ''
		var i, n, children
		var html =
			'<div class="article_comment_block">' +
				'<div class="article_comment_head">' +
					'<b>'+cdata.author+'</b> ' +
					cdata.score + ' points ' +
					$.date.toAgeString(+cdata.created_utc, tNow) +
					(cdata.edited ? '*' : '') +
				'</div>' +
				'<div class="article_comment_body">' +
					$.html.prep(cdata.body_html) +
				'</div>'

		if( cdata.replies && cdata.replies.data && cdata.replies.data.children ) {
			children = cdata.replies.data.children
			n = children.length
			for( i = 0; i < n; ++i ) {
				html += buildCommentTreeHtml(children[i].data, tNow)
			}
		}

		html += '</div>'

		return html
	}

	/**
	 *  Remove expired articles from cache
	 */
	function cleanCache() {
		var t = Date.now()
		for( var k in articleCache ) {
			if( t - articleCache[k].time > CACHE_MAX_AGE ) {
				delete articleCache[k]
			}
		}
	}

	/**
	 *  Load article, parse JSON. Passes parsed data to complete callback.
	 */
	function load( url, complete, error ) {
		cleanCache()
		if( articleCache[url] && Date.now() - articleCache[url].time < 1000 * 60 ) {
			console.log('using cached article')
			if( complete ) complete(articleCache[url].data)
		}
		$.xhr( protocol+'://www.reddit.com' + url + '.json', {
			success: function(src) {
				var data
				try {
					data = JSON.parse(src)
				}
				catch( e ) {
					if( error ) error('Failed to parse json feed: '+e)
					return
				}
				articleCache[url] = {
					time: Date.now(),
					data: data
				}
				if( complete ) complete(data)
			},
			error: function(e) {
				if( error ) error('Failed to load json feed: '+e)
			},
			accept: 'application/json'
		})
	}

	/**  Convert image pixel size to ems */
	function pxToEm( px ) {
		// TODO: Calculate scale dynamically. Currently hard-coded to 18px=1em
		// round to 3 decimal places
		return Math.round(px * 1000 / 18) / 1000;
	}

	/**
	 *  Build article thumbnail image
	 *  @param {Object} article Parsed Reddit article JSON data
	 */
	function makeImageHtml( article ) {
		var html, url, fullUrl,
			imgs, img, num,
			imgThumb, imgFull,
			width = IMG_MAX_WIDTH,
			height = IMG_MAX_HEIGHT,
			fullWidth, fullHeight,
			pw, ph,
			ew, eh

		if( !options.images ) return null

		//  Does it have preview images?
		if( article.preview && !!(imgs = article.preview.images) && imgs.length > 0 ) {
			img = imgs[0]
			if( !!(imgs = img.resolutions) && (num = imgs.length) > 0 ) {
				imgThumb = viewer.selectImgSize(imgs,
					IMG_MAX_WIDTH * $.browser.pixelRatio, IMG_MAX_HEIGHT * $.browser.pixelratio)
				imgFull = viewer.selectImgSize(imgs,
					$.browser.screenSize.width, $.browser.screenSize.height)
				width = imgFull.width
				height = imgFull.height
				fullWidth = imgFull.width
				fullHeight = imgFull.height
				url = imgThumb.url
				fullUrl = imgFull.url
			}
		}
		if( !url ) {
			//  No preview... thumbnail?
			if( article.thumbnail ) {
				// Use thumbnail
				url = article.thumbnail
				fullUrl = article.thumbnail
				fullWidth = width
				fullHeight = height
			}
			else {
				// no image
				return null
			}
		}

		//  Don't display self img links
		//  TODO: Use img from reddit?
		if( url.indexOf('http://') < 0 && url.indexOf('https://') < 0 )
			return null

		if( $.browser.isSecure ) {
			//  Ensure on https
			url = article.thumbnail
			url = url.replace('http://', 'https://')
			fullUrl = fullUrl.replace('http://', 'https://')
		}
		pw = Math.min(Math.round((width / height) * IMG_MAX_HEIGHT), IMG_MAX_WIDTH)
		ph = IMG_MAX_HEIGHT
		ew = pxToEm(pw)+'em'
		eh = pxToEm(ph)+'em'

		html = '<img id="article_image_thumb" src="' + url + '"' +
			' class="article_image_img" touch-action="none"' +
			' style="width:'+ew+';height:'+eh+';opacity:0"/>'

		return {html:html, url:fullUrl, width:fullWidth, height:fullHeight}
	}

	/**
	 *  Render article and comments
	 */
	function render( data, complete ) {
		$('#article_panel_content').style.opacity = '0'

		var article = data[0].data.children[0].data
		var isSelfPost = !!article.is_self

		//  Article image
		var img = makeImageHtml(article)
		if( img ) {
			$('#article_image_block').innerHTML = img.html
			$.click( $('#article_image_thumb'), function() {
				viewer.open(img.url, img.width, img.height)
			})
		}

		//  Article title
		var html = ''
		if( article.url && !isSelfPost )
			html = '<a href="'+article.url+'" target="_blank">' + article.title + '</a>'
		else
			html = article.title
		$('#article_title').innerHTML = html

		//  Article meta
		var tNow = Math.round(Date.now() / 1000)
		var subr = article.subreddit ? '/r/'+article.subreddit : ''
		$('#article_info').innerHTML = article.domain + ' [<b>+' + article.score + '</b>] <b>'+subr+'</b> '+$.date.toAgeString(+article.created_utc, tNow)+' by ' + article.author

		//  Article body
		if( article.selftext_html )
			$('#article_body').innerHTML = '<p style="font-size:0.1em">&nbsp;</p>' + $.html.prep(article.selftext_html)
		else
			$('#article_body').innerHTML = ''

		//  Comments
		var comments = data[1].data.children
		var cd, i, n = comments.length
		html = ''
		//  Iterate through top-level comments, build a tree for each.
		for( i = 0; i < n; ++i ) {
			cd = comments[i].data
			html += buildCommentTreeHtml(comments[i].data, tNow)
		}
		$('#article_comments').innerHTML = html

		anim.fadeIn($('#article_panel_content'), FADEIN_DUR, complete)

		var elImg = $('#article_image_thumb')
		if( elImg ) {
			if( elImg.complete ) {
				anim.fadeIn(elImg, IMG_FADE_DUR)
			} else {
				elImg.onload = function(){anim.fadeIn(elImg, IMG_FADE_DUR)}
			}
		}
	}

	/**
	 *  Perform load then render
	 */
	function loadAndRender( url ) {
		$('#article_loading').style.display = 'block'
		load( url, function(data) {
			// Article loaded, now render.
			// But delay the render so final panel position is drawn first,
			// otherwise we'll see stutter on final frame of slide when the
			// article is cached or loads really fast.
			window.setTimeout(
				function(){
					$('#article_loading').style.display = 'none'
					render(data)
				},
				10 // ms
			)
		})
	}

	function clear() {
		$('#article_title').innerHTML = ''
		$('#article_info').innerHTML = ''
		$('#article_image_block').innerHTML = ''
		$('#article_body').innerHTML = ''
		$('#article_comments').innerHTML = ''
	}

	/**  Open Article panel, load & render content */
	function open( url, complete ) {
		if( isOpen ) {
			console.warn('article already open')
			return
		}
		$('#article_panel_content').style.opacity = '0'
		clear()
		slider.go(Slider.CENTER, function(){
			isOpen = true
			loadAndRender(url)
			if(complete) complete()
		})
	}

	/**  Close article panel */
	function close( complete ) {
		if( !isOpen ) {
			console.warn('article already closed')
			return
		}
		viewer.close()
		slider.go(Slider.RIGHT, function(){
			isOpen = false
			if(complete) complete()
		})
	}

	/**  Handle resize event */
	function resize() {
		slider.resize()
		if( viewer.isOpen() ) {
			viewer.resize()
		}
	}

	//////////////////////////////////////////////////////////
	//  Public interface
	return {
		load: load,
		render: render,
		clear: clear,
		loadAndRender: loadAndRender,
		open: open,
		close: close,
		isOpen: function(){return isOpen},
		resize: resize,
		setOptions: setOptions
	}
}

return Article

}());
