/*global $ */
/*exported Swiper */

// module.exports = function() {
var Swiper = function Swiper() {

	var NUM_PTS = 4  // num points to sample for speed
	//var MAX_AGE = 300 // max age for a sample to be included in swipe

	var index = 0
	var count = 0
	var points = new Array(NUM_PTS)
	;(function(){
		for( var i = 0; i < NUM_PTS; ++i )
			points[i] = {x:0, y:0, t:0}
	}())

	function start( x, y, t ) {
		t = t || Date.now()
		index = 0
		count = 0
		points[index].x = x
		points[index].y = y
		points[index].t = t
		index = 1
		count = 1
	}

	function add( x, y, t ) {
		t = t || Date.now()
		points[index].x = x
		points[index].y = y
		points[index].t = t
		index = (index + 1) % NUM_PTS
		count += 1
	}

	function getVel( v ) {
		v = v || {x:0, y:0}
		v.x = 0
		v.y = 0
		if( count < 1 ) return v
		var n = count > NUM_PTS ? NUM_PTS : count
		var iLast = $.math.pmod(index-1, NUM_PTS)
		var iFirst = $.math.pmod(index-n, NUM_PTS)
		var deltaT = (points[iLast].t - points[iFirst].t) / 1000.0
		var dx = points[iLast].x - points[iFirst].x
		var dy = points[iLast].y - points[iFirst].y
		v.x = dx / deltaT
		v.y = dy / deltaT
		/*
		var deltaT = points[pmod(index-1, NUM_PTS)].t - points[pmod(index-n, NUM_PTS)].t
		for( i = 0; i < n; ++i ) {
			j = pmod(index-1-i, NUM_PTS)
			v.x += points[j].x
			v.y += points[j].y
		}
		*/
		return v
	}

	return {
		start: start,
		add: add,
		getVel: getVel
	}
}
