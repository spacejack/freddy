/*global Anim, Slider */
/*exported PanelSet */

/**
 *  Moves 3 panels with pseudo-parallax.
 *  A Slider is applied to handle the main panel (and its scrollable element) animations.
 *  PanelSet handles the other 2 element animations.
 *  @param opts.maxSlide {number} % of screen width to slide (from 0.0-1.0)
 *  @param opts.rcApp {Rect} A reference to a rectangle which the caller is expected to keep updated.
 *  @param opts.elMain {HTMLElement} Main (centre) panel element
 *  @param opts.elLeft {HTMLElement} Left panel
 *  @param opts.elRight {HTMLElement} Right
 *  @param opts.elScroll {HTMLElement} Scrollable element
 *  @param opts.onChange {function({number})} Called when panel is manually dragged to a new position. Callback gets passed Slider.CENTER, Slider.LEFT or Slider.RIGHT
 */
var PanelSet = function PanelSet( opts ) {

	opts = opts || {}
	/**  Maximum slide as % of distance from centre to edge of screen. */
	var maxSlide = (typeof opts.maxSlide === 'number') ? opts.maxSlide : 0.825
	/**  We keep a reference to a Rect that is updated by caller. Used for resize() calls. */
	var rcApp = opts.rcApp
	/**  The three panel HTMLElements */
	var panels = {
		main: opts.elMain,
		left: opts.elLeft,
		right: opts.elRight
	}
	/**  Callbacks */
	var callbacks = {
		/**  This is only triggered when panel is dragged to a new position. It is not triggered by goto... functions */
		onChange: opts.onChange || null
	}

	var anim = Anim()
	var slider = Slider({
		elPanel: panels.main,
		elScroll: opts.elScroll,
		state: 0,
		xSlideCenter: 0.0,
		xSlideLeft: -maxSlide,
		xSlideRight: maxSlide,
		springDur: 200,
		rcApp: rcApp,
		anim: anim,
		onMove: setSlidePos,
		onChange: setCurPanel
	})
	var curPanel = Slider.CENTER

	opts = null

	//  Functions //////////////////////////////////////////////////////

	/**
	 *  The main (centre) panel movement is handled by Slider,
	 *  but we have to move the side panels relative to its position.
	 */
	function setSlidePos( x ) {
		var xp
		xp = (-rcApp.width * maxSlide + x) / 2.0
		anim.setPos(panels.left, xp, 0)
		xp = (rcApp.width * (2.0 - maxSlide) + x) / 2.0
		anim.setPos(panels.right, xp, 0)
	}

	function setCurPanel(p) {
		var prevPanel = curPanel
		if( prevPanel === p ) return
		curPanel = p;
		if( callbacks.onChange ) callbacks.onChange(curPanel, prevPanel)
	}

	function resize() {
		slider.resize()
	}

	/**
	 *  Go straight to this panel.
	 *  Note: Since this is used by caller, it will not trigger onChange callback.
	 *  Use a callback here if you need to be notified of completion.
	 */
	function gotoMain(complete) {
		slider.go(Slider.CENTER, function(){
			curPanel = Slider.CENTER
			if(complete) complete()
		})
	}

	/**  Go to the left panel (i.e. move slider to the right) */
	function gotoLeft(complete) {
		slider.go(Slider.RIGHT, function(){
			curPanel = Slider.RIGHT
			if(complete) complete()
		})
	}

	/**  Go to the right panel (i.e. move slider to the left) */
	function gotoRight(complete) {
		slider.go(Slider.LEFT, function(){
			curPanel = Slider.LEFT
			if(complete) complete()
		})
	}

	//////////////////////////////////////////////////////////
	//  Public interface
	return {
		setSlidePos: setSlidePos,
		gotoMain: gotoMain,
		gotoLeft: gotoLeft,
		gotoRight: gotoRight,
		resize: resize,
		curPanel: function() { return curPanel }
	}
};
