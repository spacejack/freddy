/*global $, Swiper */
/*exported Slider */

var Slider = (function(){

//  Up to 3 possible resting positions */
var LEFT   = -1
var CENTER =  0
var RIGHT  =  1

var DEFAULT_SLIDE_THRESHOLD = 20
var DEFAULT_SPRING_DUR = 300
var MIN_SPRING_DUR = 50

/**
 *  A slider is an element that has a center position and a
 *  left and/or right position which it can slide/spring to.
 *  It may also contain a scrollable element which must be negotiated
 *  with to determine who is responding to drags.
 */
function Slider( opts ) {

	var elPanel = opts.elPanel  // The element that can be grabbed and slide
	var elScroll = opts.elScroll  // An element that can be scrolled & needs to work with sliding parent
	var curState = opts.state || CENTER  // current resting state (LEFT,RIGHT,CENTER)
	var slideThreshold = opts.slideThreshold || DEFAULT_SLIDE_THRESHOLD  // X distance required before slide initiated
	var xSlideCenter = (typeof opts.xSlideCenter === 'number') ? opts.xSlideCenter : 0.0  // center position (1.0 = width of browser)
	var xSlideLeft = (typeof opts.xSlideLeft === 'number') ? opts.xSlideLeft : -1.0  // left position (use center value if can't go left)
	var xSlideRight = (typeof opts.xSlideRight === 'number') ? opts.xSlideRight : 1.0  // right position (use center value if can't go right)
	var hideDistLeft = opts.hideDistLeft || 0   // distance to hide when resting in left position
	var hideDistRight = opts.hideDistRight || 0  // distance to hide right
	var springDur = (typeof opts.springDur === 'number') ? opts.springDur : DEFAULT_SPRING_DUR  // how long 'spring' animation takes (ms)
	var rcApp = opts.rcApp  // a live reference to the app's current Rect
	var anim = opts.anim    // instance of Anim module to use
	var callbacks = {
		onMove: opts.onMove,
		onChange: opts.onChange
	}
	opts = null  // don't need this reference anymore

	var canGoLeft = (xSlideLeft < xSlideCenter)
	var canGoRight = (xSlideRight > xSlideCenter)
	var isPressed = false
	var isScrolling = false
	var isSliding = false
	var slideCancelled = false
	var touchStart = {x:0, y:0}
	var isSpringing = false
	var swiper = Swiper()

	$.pointer(elPanel, {
		onPress: onPointerPress,
		onMove: onPointerMove,
		onRelease: onPointerRelease
	})

	elScroll.onscroll = function() {
		isScrolling = true
		slideCancelled = true
		isSliding = false
	}

	//  Functions ////////////////////////////////////////////

	function setSlidePos( x ) {
		anim.setPos(elPanel, x, 0)
		if(callbacks.onMove) callbacks.onMove(x)
	}

	/**  Spring from start to end position */
	function springFromTo( x0, x1, dur, complete ) {
		var startT = Date.now()
		var dist = x1 - x0
		isSpringing = true
		function spring() {
			var t = Date.now() - startT
			var x
			var s
			if( t >= dur ) {
				setSlidePos(x1)
				isSpringing = false
				if( complete ) complete()
			}
			else {
				s = Math.pow(t/dur, 0.4)
				x = x0 + s * dist
				setSlidePos(x)
				requestAnimationFrame(spring)
			}
		}
		requestAnimationFrame(spring)
	}

	function onPointerPress( px, py, event ) {
		event.stopPropagation()
		if( isSpringing ) {
			event.preventDefault()
			return
		}
		isPressed = true
		isScrolling = false
		isSliding = false
		slideCancelled = false
		touchStart.x = px
		touchStart.y = py
		swiper.start( px, py )
		return false
	}

	function onPointerMove( px, py, event ) {
		event.stopPropagation()
		if( isSpringing ) {
			event.preventDefault()  // prevent scrolling while spinging
			return false
		}
		if( !isPressed ) return
		swiper.add( px, py )
		if( slideCancelled ) return
		var xt = px
		var x = xt - touchStart.x
		if( !isScrolling ) {
			if( !isSliding ) {
				if( Math.abs(xt - touchStart.x) < slideThreshold )
					return
				else isSliding = true
			}
			if( curState === RIGHT )
				x += rcApp.width * xSlideRight
			else if( curState === LEFT )
				x += rcApp.width * xSlideLeft
			x = $.math.clamp(x, rcApp.width * xSlideLeft, rcApp.width * xSlideRight)
			setSlidePos(x)
		}
		if( isSliding ) {
			event.preventDefault()  // prevent scrolling while sliding
		}
		return false
	}

	/**
	 *  Pointer released - perform any detected swipe action,
	 *  Send panels toward resting position.
	 */
	function onPointerRelease( px, py, event ) {
		if( isSpringing ) {
			event.preventDefault()
			event.stopPropagation()
			return
		}
		if( isSliding ) {
			var swipeVel = swiper.getVel()
			console.log("swipe vel:", swipeVel.x)
			var dx = px - touchStart.x  // total X dragged
			// clamp to max range
			dx = $.math.clamp(dx, xSlideLeft * rcApp.width, xSlideRight * rcApp.width)
			var x0 = dx
			var x1 = 0
			var dur

			if( curState === RIGHT )
				x0 = dx + rcApp.width * xSlideRight
			else if( curState === LEFT )
				x0 = dx + rcApp.width * xSlideLeft

			var destState = CENTER

			if( dx < -rcApp.width / 2.0 + (-0.1 * swipeVel.x) ) {
				if( curState === CENTER || curState === LEFT ) {
					destState = LEFT
				} else {
					destState = CENTER
				}
			}
			else if( dx > rcApp.width / 2.0 -(0.1 * swipeVel.x) ) {
				if( curState === CENTER || curState === RIGHT ) {
					destState = RIGHT
				} else {
					destState = CENTER
				}
			}
			else {
				destState = curState
			}

			if( destState === CENTER )
				x1 = xSlideCenter
			else if( destState === RIGHT )
				x1 = rcApp.width * xSlideRight
			else if( destState === LEFT )
				x1 = rcApp.width * xSlideLeft

			//  Spring to destination panel from current panel.
			//  Duration is adjusted by speed of swipe.
			dur = Math.max(Math.floor(springDur*1.5) - Math.abs(swipeVel.x) * 0.1, MIN_SPRING_DUR)
			springFromTo( x0, x1, dur, function() {
				curState = destState
				if(callbacks.onChange) callbacks.onChange(curState)
			})
		}
		isPressed = false
		isSliding = false
		slideCancelled = false
		isScrolling = false
	}

	/**  Internally used. Expects sanitized input */
	function goSpring( dest, x0, x1, dur, complete ) {
		springFromTo( x0, x1, dur, function(){
			curState = dest
			if(complete) complete()
		})
	}

	/**
	 *  @param {number} dest LEFT, CENTER or RIGHT
	 *  @param {function} complete Callback called when animation done
	 */
	function go( dest, complete ) {
		if( isSpringing ) return false
		if( curState === dest ) {
			if(complete) complete()
			return true
		}
		if( dest === LEFT ) {
			if(!canGoLeft || curState !== CENTER) return false
			goSpring( dest, xSlideCenter * rcApp.width, xSlideLeft * rcApp.width, springDur, complete )
		}
		else if( dest === RIGHT ) {
			if(!canGoRight || curState !== CENTER) return false
			goSpring( dest, xSlideCenter * rcApp.width, xSlideRight * rcApp.width, springDur, complete )
		}
		else {
			if( curState === LEFT ) {
				goSpring( dest, xSlideLeft * rcApp.width, xSlideCenter * rcApp.width, springDur, complete )
			} else if( curState === RIGHT ) {
				goSpring( dest, xSlideRight * rcApp.width, xSlideCenter * rcApp.width, springDur, complete )
			} else {
				return false
			}
		}
		return true
	}

	function resize() {
		if( curState === CENTER ) {
			setSlidePos(rcApp.width * xSlideCenter)
		} else if( curState === LEFT ) {
			setSlidePos(rcApp.width * xSlideLeft - hideDistLeft)
		} else if( curState === RIGHT ) {
			setSlidePos(rcApp.width * xSlideRight + hideDistRight)
		}
	}

	//////////////////////////////////////////////////////////
	//  Public interface
	return {
		resize: resize,
		go: go
	}

}

//  Export these constants
Slider.LEFT   = LEFT
Slider.CENTER = CENTER
Slider.RIGHT  = RIGHT

return Slider

}());

/*
//  Prevent pull to refresh on chrome
window.addEventListener('load', function() {
  var preventPullToRefreshCheckbox = document.getElementById('preventPullToRefresh');
  var preventOverscrollGlowCheckbox = document.getElementById("preventOverscrollGlow");
  var preventScrollCheckbox = document.getElementById("preventScroll");

  var maybePreventPullToRefresh = false;
  var lastTouchY = 0;
  var touchstartHandler = function(e) {
    if (e.touches.length != 1) return;
    lastTouchY = e.touches[0].clientY;
    // Pull-to-refresh will only trigger if the scroll begins when the
    // document's Y offset is zero.
    maybePreventPullToRefresh =
        preventPullToRefreshCheckbox.checked &&
        window.pageYOffset == 0;
  }

  var touchmoveHandler = function(e) {
    var touchY = e.touches[0].clientY;
    var touchYDelta = touchY - lastTouchY;
    lastTouchY = touchY;

    if (maybePreventPullToRefresh) {
      // To suppress pull-to-refresh it is sufficient to preventDefault the
      // first overscrolling touchmove.
      maybePreventPullToRefresh = false;
      if (touchYDelta > 0) {
        e.preventDefault();
        return;
      }
    }

    if (preventScrollCheckbox.checked) {
      e.preventDefault();
      return;
    }

    if (preventOverscrollGlowCheckbox.checked) {
      if (window.pageYOffset == 0 && touchYDelta > 0) {
        e.preventDefault();
        return;
      }
    }
  }

  document.addEventListener('touchstart', touchstartHandler, false);
  document.addEventListener('touchmove', touchmoveHandler, false);
});
*/
