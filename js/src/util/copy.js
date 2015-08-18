/*global $ */

/**  Make a shallow copy of obj */
$.copy = function( src, dst ) {
	dst = dst || {}
	for( var k in src ) if( src.hasOwnProperty(k) ) {
		dst[k] = src[k]
	}
	return dst
}
