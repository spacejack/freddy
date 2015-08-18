/*global $ */
/**  Math utils */
$.math = {
	sign: function( s ) {
		return s > 0 ? 1 : s < 0 ? -1 : 0
	},
	clamp: function( n, min, max ) {
		return Math.min(Math.max(n, min), max)
	},
	length2d: function( x, y ) {
		return Math.sqrt(x * x + y * y)
	},
	pmod: function( n, m ) {
		return (n % m + m) % m;
	}
}
