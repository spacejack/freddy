/*exported $ */

//  This is our single, global 'use strict'
//  (which will be wrapped into the outermost IIFE on build)
'use strict'

var $ = (function(){

/**
 *  getElement/querySelector
 */
function $(s) {
	var el = null
	if( s ) {
		if( s.charAt(0) === '#' ) {
			el = document.getElementById(s.substr(1))
		}
		else {
			el = document.querySelectorAll(s)
		}
	}
	return el
}

return $

}());

/**
 *  RAF polyfill
 */
(function() {
    var lastTime = 0
    var vendors = ['ms', 'moz', 'webkit', 'o']
    for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame']
    }

    if( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function(callback) {
            var currTime = Date().now
            var timeToCall = Math.max(0, 16 - (currTime - lastTime))
            var id = window.setTimeout(function(){callback(currTime + timeToCall)}, timeToCall)
            lastTime = currTime + timeToCall
            return id
        }
	}

    if( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function(id) {clearTimeout(id)}
	}

}());
