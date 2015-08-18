/*exported Anim */

var Anim = (function(){

var transformStylePrefix
var transformStyleName  // Full CSS style name used by this browser (includes prefix, dashes)

/**
 *  Determine the name of css transform style this browser uses.
 *  Older browsers may use beta prefixes.
 *  This only needs to get called once ever to initialize
 *  transformStyleName, TransformStylePrefix which are shared
 *  by all instances of Anim.
 */
function getTansformStylePrefix() {

	function getStyleAttrLc(s) {
		return (!!s && typeof s === 'string') ? s.toLowerCase() : ''
	}

	var prefix = ''  // empty prefix if current standard support
	var t = 'translate3d(100px,20px,0px)'  // the transform we'll use to test
	var el = document.createElement('div') // Make a test element

	//  Check support for current standard first
	el.style.transform = t
	var styleAttrLc = getStyleAttrLc(el.getAttribute('style'))
	if( styleAttrLc.indexOf('transform') === 0 )
		return prefix  // current, yay.

	//  Try beta names
	el.style.MozTransform = t  // firefox
	el.style.webkitTransform = t  // webkit/chrome
	el.style.msTransform = t  // IE
	styleAttrLc = getStyleAttrLc(el.getAttribute('style'))
	el = null

	console.log('testing for beta style attribute in: '+styleAttrLc)

	//  See which one worked, if any...
	if( styleAttrLc.indexOf('moz') !== -1 )
		prefix = 'moz'
	else if( styleAttrLc.indexOf('webkit') !== -1 )
		prefix = 'webkit'
	else if( styleAttrLc.indexOf('ms') !== -1 )
		prefix = 'ms'
	else
		prefix = null  // couldn't find transform style
	return prefix
}

/**
 *  Animation mini library.
 *  Convenient functions to set element positions or fade them
 *  using accelerated transform & opacity styles.
 */
function Anim() {

	//  Determine the name of css transform style this browser uses.
	//  Older browsers may use beta prefixes.
	//  (Only need to do this once.)
	if( !transformStyleName ) {
		transformStyleName = 'transform'
		transformStylePrefix = getTansformStylePrefix()
		if( transformStylePrefix === null ) {
			console.warn("Browser does not appear to support CSS transform styles.")
			transformStylePrefix = ''
		}
		else if( transformStylePrefix.length > 0 ) {
			// Use a prefixed/beta version
			transformStyleName = '-' + transformStylePrefix + '-transform'
		}
		// else we're using official 'transform' style
		console.log("using css transform style name: '"+transformStyleName+"'")
	}

	//////////////////////////////////////////////////////////

	/**
	 *  Set position of element using 3d transform style
	 */
	function setPos( el, x, y ) {
		el.style[transformStyleName] = 'translate3d('+x+'px,'+y+'px,0px)'
	}

	/**
	 *  Go from o0 to o1 opacity in dur milliseconds.
	 *  Optional callback when done.
	 */
	function fade( el, o0, o1, dur, complete ) {
		var startT = Date.now();
		el.style.opacity = o0
		function fadeLoop() {
			var t = Date.now() - startT
			if( t >= dur ) {
				el.style.opacity = o1
				el = null;
				if( complete ) complete()
			}
			else {
				el.style.opacity = o0 + t/dur * (o1 - o0)
				requestAnimationFrame(fadeLoop)
			}
		}
		requestAnimationFrame(fadeLoop)
	}

	/**
	 *  Go from 0 opacity to 1 in dur milliseconds.
	 *  Optional callback when done.
	 */
	function fadeIn( el, dur, complete ) {
		fade( el, 0, 1, dur, complete )
	}

	function fadeOut( el, dur, complete ) {
		fade( el, 1, 0, dur, complete )
	}

	return {
		setPos: setPos,
		fade: fade,
		fadeIn: fadeIn,
		fadeOut: fadeOut,
		transformStyleName: transformStyleName,  // Full CSS style name used by this browser (includes prefix, dashes)
		transformStylePrefix: transformStylePrefix
	}
}

return Anim;

}());
