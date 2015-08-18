/*global $ */
/*exported Pointer */

//  A unifed input event handler.
//  To work with mouse and/or touch inputs.
//  Prevents 'doubled' events (eg. browsers emit both touch & mouse events on mobile)
//  Allows for cancelled clicks (pointer moves past a threshold during click)

$.pointer = (function(){

//  Device types
var NONE    = 0
var MOUSE   = 1
var TOUCH   = 2
var STYLUS  = 4
var POINTER = MOUSE | TOUCH | STYLUS

var DEVICES = ['none','mouse','touch']

var DEBOUNCE_DELAY = 200  // minimum time between touch/mouse change (to ignore echoed events)
var CLICK_MOVE_THRESHOLD = 16  // max movement before click is cancelled

// Global (among pointer instances) current inputDevice state
var inputDevice = NONE

var usingPointerAPI = !!window.navigator.msPointerEnabled
if( usingPointerAPI ) {
	console.log("using Pointer Events API")
}

/**
 *  @param el Element to attach listeners to
 *  @param opts[onPress] function( x, y, device, event )
 *  @param opts[onMove]
 *  @param opts[onRelease]
 *  @param opts[onCancel]
 *  @param opts[onClick]
 *  @param opts[onCancelClick] Called when press may have been a click but is no longer a candidate (eg moved too far.)
 *  @param opts[pressClassStr] {string} CSS className string to append while pressed (optional)
 */
function pointer( el, opts ) {

	opts = opts || {}
	var capture = opts.capture || {}
	var classStr = el.className  // remember the unpressed name
	var isPressed = false
	var startPos = {x:0, y:0}
	var curPos = {x:0, y:0}
	var clickCancelled = false

	function press( x, y, e, dev ) {
		if( isPressed || (inputDevice !== NONE && inputDevice !== dev) ) {
			console.log("cancelling "+DEVICES[dev]+" press")
			e.preventDefault()
			e.stopPropagation()
			return false
		}
		startPos.x = curPos.x = x
		startPos.y = curPos.y = y
		isPressed = true
		clickCancelled = false
		inputDevice = dev
		if(opts.pressClassStr) el.className = classStr+' '+opts.pressClassStr
		if(opts.onPress) opts.onPress(x, y, e, dev)
		return true
	}

	// Debounce. (don't reset input device for a short delay to avoid doubles)
	// TODO: This has potential problems for multiple elements (nearly) simultaneously clicked
	function debounce() {
		window.setTimeout( function(){if(!isPressed) inputDevice = NONE}, DEBOUNCE_DELAY )
	}

	function unpress( x, y, e, dev ) {
		if( !isPressed ) {
			if( dev !== inputDevice ) {
				e.stopPropagation()
			}
			return false
		}
		curPos.x = x
		curPos.y = y
		isPressed = false
		if(opts.pressClassStr) el.className = classStr
		debounce()
		return true
	}

	function move( x, y, e, dev ) {
		if( !isPressed ) return false
		if( dev !== inputDevice ) {
			//e.preventDefault()
			e.stopPropagation()
			return false
		}
		curPos.x = x
		curPos.y = y
		var dist = $.math.length2d(x-startPos.x, y-startPos.y)
		if( dist > CLICK_MOVE_THRESHOLD )
			cancelClick()
		if(opts.onMove) opts.onMove(x, y, e, dev)
		return true
	}

	function cancelClick() {
		clickCancelled = true
		if(opts.pressClassStr) el.className = classStr
		if(opts.onCancelClick) opts.onCancelClick()
	}

	function release( x, y, e, dev ) {
		if( unpress(x, y, e, dev) ) {
			if(opts.onRelease) opts.onRelease(x, y, e, dev)
			if(!clickCancelled && opts.onClick) opts.onClick(e)
			return true
		}
		return false
	}

	function cancel( x, y, e, dev ) {
		if( unpress(x, y, e, dev) ) {
			if(opts.onCancel) opts.onCancel(x, y, e, dev)
			return true
		}
		return false
	}

	function remove() {
		if( usingPointerAPI ) {
			el.removeEventListener('MSPointerStart', onPointerDown, !!capture.press)
			el.removeEventListener('MSPointerMove', onPointerMove, !!capture.move)
			el.removeEventListener('MSPointerEnd', onPointerUp, !!capture.release)
			el.removeEventListener('MSPointerCancel', onPointerCancel, !!capture.cancel)
			el.removeEventListener('MSPointerOut', onPointerCancel, !!capture.cancel)
		}
		else {
			el.removeEventListener('touchstart', onTouchStart, !!capture.press)
			el.removeEventListener('touchmove', onTouchMove, !!capture.move)
			el.removeEventListener('touchend', onTouchEnd, !!capture.release)
			el.removeEventListener('touchcancel', onTouchCancel, !!capture.cancel)

			if( !$.browser.isMobile.iOS() ) {
				el.removeEventListener('mousedown', onMouseDown, !!capture.press)
				el.removeEventListener('mousemove', onMouseMove, !!capture.move)
				el.removeEventListener('mouseup', onMouseUp, !!capture.release)
			}
		}
	}

	function onTouchStart(e) {
		press(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e, TOUCH)
	}
	function onTouchMove(e) {
		move(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e, TOUCH)
	}
	function onTouchEnd(e) {
		release(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e, TOUCH)
	}
	function onTouchCancel(e) {
		cancel(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e, TOUCH)
	}

	function onMouseDown(e) {
		press(e.clientX, e.clientY, e, MOUSE)
	}
	function onMouseMove(e) {
		move(e.clientX, e.clientY, e, MOUSE)
	}
	function onMouseUp(e) {
		release(e.clientX, e.clientY, e, MOUSE)
	}

	function onPointerDown(e) {
		press(e.clientX, e.clientY, e, POINTER)
	}
	function onPointerMove(e) {
		move(e.clientX, e.clientY, e, POINTER)
	}
	function onPointerUp(e) {
		release(e.clientX, e.clientY, e, POINTER)
	}
	function onPointerCancel(e) {
		cancel(e.clientX, e.clientY, e, POINTER)
	}

	//  Try for Pointer API first
	if( usingPointerAPI ) {
		//if( el.style.indexOf('touch-action') < 0 )
		//	console.warn("attaching pointer listeners to element[id='"+el.id+"'] without 'touch-action' style")
		el.addEventListener('MSPointerStart', onPointerDown, !!capture.press)
		el.addEventListener('MSPointerMove', onPointerMove, !!capture.move)
		el.addEventListener('MSPointerEnd', onPointerUp, !!capture.release)
		el.addEventListener('MSPointerCancel', onPointerCancel, !!capture.cancel)
		el.addEventListener('MSPointerOut', onPointerCancel, !!capture.cancel)
	}
	else {
		el.addEventListener('touchstart', onTouchStart, !!capture.press)
		el.addEventListener('touchmove', onTouchMove, !!capture.move)
		el.addEventListener('touchend', onTouchEnd, !!capture.release)
		el.addEventListener('touchcancel', onTouchCancel, !!capture.cancel)

		// NOTE: iOS hard-coded to touch because no platform support for mouse
		// so we can ignore iOS's weird mouse event noise.
		// We will listen to mice on other platforms.
		if( !$.browser.isMobile.iOS() ) {
			el.addEventListener('mousedown', onMouseDown, !!capture.press)
			el.addEventListener('mousemove', onMouseMove, !!capture.move)
			el.addEventListener('mouseup', onMouseUp, !!capture.release)
		}
	}

	return {
		isPressed: function(){return isPressed},
		inputDevice: function(){return inputDevice},
		startPos: function(){return {x:startPos.x, y:startPos.y}},
		curPos: function(){return {x:curPos.x, y:curPos.y}},
		cancelClick: cancelClick,
		clickCancelled: function(){return clickCancelled},
		remove: remove,
		usingPointerAPI: usingPointerAPI
	}
}

return pointer

}());

$.click = function( el, onClick, useCapture, pressClassStr ) {
	return $.pointer( el, {
		onClick: onClick,
		capture: {press:useCapture, release:useCapture, move:useCapture},
		pressClassStr: pressClassStr
	})
};
