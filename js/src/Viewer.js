/*global $ */
/*exported Viewer */

var Viewer = (function(){

var FADEIN_DUR = 200
var IMG_FADEIN_DUR = 200
var FADEOUT_DUR = 150

/** Viewer is modal so only one can be open at any time */
var isOpen = false
/** All viewer instances re-use the same elements */
var elContainer, elBg

/**
 *  @param w,h - rect to fit
 *  @param wc, hc - container rect to fit into
 *  @return {w,h} Size that fits
 */
function fitRc( w, h, wc, hc ) {
	var s = 1.0
	if( h < hc && w < wc ) {
		// must enlarge
		h *= wc / w
		w = wc
	}
	if( h > hc ) {
		// must shrink height
		s = hc / h
		w *= s
		h = hc
	}
	if( w > wc ) {
		// must shrink width
		s = wc / w
		h *= s
		w = wc
	}
	return {w:Math.round(w), h:Math.round(h)}
}

/**
 *  Create a viewer instance
 *  @param {Router} opts.router
 *  @param {Rect} opts.rcApp Rect describiting window size that caller keeps up to date
 *  @param {Anim} opts.anim Anim instance to use (we should probably create our own instead)
 */
function Viewer( opts ) {

	opts = opts || {}
	var router = opts.router
	var rcApp = opts.rcApp
	var anim = opts.anim
	var curUrl = ''
	var imgSize = {width:0, height:0}
	opts = null

	//  Make sure these are initialized at least once
	elContainer = elContainer || $('#viewer_content')
	elBg = elBg || $('#viewer_bg')

	function onClick(e) {
		if( !isOpen ) return
		e.stopPropagation()
		e.preventDefault()
		// Go back in history without triggering route action..
		router.popUrl()
		// .. because we do that now
		close()
	}

	//  Clicks/touches on viewer should close it
	var pointer = $.click(elContainer, onClick)

	/**
	 *  Given a list of images with sizes, select the
	 *  best fit for device screen size
	 */
	function selectImgSize( imgs, w, h ) {
		var i, n, img
		if( !imgs || imgs.length < 1 ) return null
		for( i = 0, n = imgs.length; i < n; ++i ) {
			img = imgs[i]
			if( img.width >= w || img.height >= h ) {
				return img
			}
		}
		return imgs[n-1]
	}

	/**
	 *  Handle resize event - resize to fit container via javascript.
	 *  TODO: is there no way to do this in CSS?
	 */
	function resize() {
		if( !isOpen ) return
		var el = $('#image_viewer_img')
		if( !el ) return
		var size = fitRc(imgSize.width, imgSize.height, rcApp.width, rcApp.height)
		el.style.width = size.w+'px'
		el.style.height = size.h+'px'
	}

	function open(url, w, h) {
		var size = fitRc(w, h, rcApp.width, rcApp.height)
		var el = elContainer
		el.innerHTML =
			'<img id="image_viewer_img" src="' + url + '"' +
			' style="width:'+size.w+'px;height:'+size.h+'px;opacity:0;cursor:pointer"/>'
		var elImg = $('#image_viewer_img')
		if( elImg.complete ) {
			anim.fadeIn(elImg, FADEIN_DUR)
		} else {
			elImg.onload = function(){anim.fadeIn(elImg, IMG_FADEIN_DUR)}
		}
		isOpen = true
		curUrl = url
		imgSize.width = w
		imgSize.height = h
		elBg.style.display = 'block'
		elBg.style.opacity = 0
		anim.fadeIn(elBg, 200)

		router.updateUrl('/viewer')
	}

	function close() {
		/*if( pointer ) {
			pointer.remove()
			pointer = null
		}*/
		if( !isOpen ) return
		anim.fadeOut(elBg, FADEOUT_DUR, function() {
			elBg.style.display = 'none'
			elContainer.innerHTML = ''
			isOpen = false
		})
	}

	return {
		open: open,
		close: close,
		resize: resize,
		isOpen: function(){return isOpen},
		curUrl: function(){return curUrl},
		selectImgSize: selectImgSize,
		fitRc: fitRc
	}
}

return Viewer

}());
