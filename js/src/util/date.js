/* global $ */
/**  Date utils */
$.date = (function(){

	var MINUTE = 60
	var HOUR = 60 * 60
	var DAY = 60 * 60 * 24
	var MONTH = 60 * 60 * 24 * 12
	var YEAR = 60 * 60 * 24 * 365

	return {
		/**
		 *  Casual english for age of post.
		 *  Not super accurate (no DST, leap years, approx. months)
		 *  @param tStart Start time (unix timestap UTC )
		 *  @param tEnd End time
		 */
		toAgeString: function( tStart, tEnd ) {
			var t = tEnd - tStart
			var str = ''
			var n, tstr

			if( t < MINUTE ) {
				str = 'just now'
			}
			else {
				if( t < HOUR ) {
					n = Math.round(t / MINUTE)
					tstr = 'minute'
				}
				else if( t < DAY ) {
					n = Math.round(t / HOUR)
					tstr = 'hour'
				}
				else if( t < MONTH ) {
					n = Math.round(t / DAY)
					tstr = 'day'
				}
				else if( t < YEAR ) {
					n = Math.round(t / MONTH)
					tstr = 'month'
				}
				else {
					n = Math.round(t / YEAR)
					tstr = 'year'
				}
				if( n > 1 ) tstr += 's'
				str = n + ' ' + tstr + ' ago'
			}
			return str;
		}
	}

}());
