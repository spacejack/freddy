/*global $, ConfirmBox */
/*exported SubGroup */

var SubGroup = (function(){

var MAX_SUB_LENGTH = 40  // what is the max..??
var SUB_RX = /[^0-9A-Za-z_]/

function validateSubName( sub ) {
	if( !sub || typeof sub !== 'string' ) return false
	var s = sub.trim()
	if( s.length < 1 || s.length > MAX_SUB_LENGTH ) return false
	if( s.match(SUB_RX) ) return false
	return s
}

/**  Manages, sorts and renders a group of subs */
function SubGroup(opts) {

	var subs = null
	var callbacks = {onSelect:null, onAdd:null, onDelete:null}

	init(opts)
	opts = null

	function init(opts) {
		opts = opts || {}
		subs = opts.subs
		callbacks.onSelect = opts.onSelect
		callbacks.onAdd = opts.onAdd
		callbacks.onDelete = opts.onDelete
	}

	/**  Handler for when a subreddit is clicked */
	function attachSubClickHandler( el ) {
		$.click(el, function() {
			if(callbacks.onSelect) callbacks.onSelect(el.getAttribute('data-feed'))
		}, false, 'subreddit_item_press')
	}

	/**  Used to assign callbacks in a loop */
	function attachSubDeleteHandler( el ) {
		$.click(el,
			function(e) {
				e.stopPropagation()
				// The parent element of the delete button is this sub's
				// container element which we will delete. It also has
				// data attribs we need to use...
				var el2 = $('#subreddit_item_'+el.getAttribute('data-sub'))
				if( !el2 || !el2.parentNode ) {
					console.warn('sub delete button had no parent element')
					return
				}
				var subName = el2.getAttribute('data-feed')
				ConfirmBox("Are you sure you want to delete the subreddit "+subName+"?", function(ok) {
					if( !ok ) return
					console.log('removing ', subName)
					deleteSub(subName)
					if( callbacks.onDelete ) callbacks.onDelete(subName)
					el2 = null
					el = null
				})
			},
			false,
			'subreddit_item_delete_press'
		)
	}

	function renderSub( sub ) {
		var str =
			'<div id="subreddit_item_'+sub+'" class="subreddit_item" data-feed="'+sub+'">' +
				'<div class="subreddit_item_text">/r/' + sub + '</div>' +
				'<div class="subreddit_item_delete" data-sub="'+sub+'" id="btn_delete_subreddit_'+sub+'">-</div><br clear="all">' +
			'</div>'
		return str
	}

	/**
	 *  Render list of subreddits, attache event handlers
	 */
	function render( elContainer ) {
		//  Always render this by default
		var str = '<div id="subreddit_item_Frontpage" class="subreddit_item" data-feed="">Frontpage</div>'
		var el, sub
		for( var i = 0, n = subs.length; i < n; ++i ) {
			sub = subs[i]
			str += renderSub(sub)
		}
		elContainer.innerHTML = str
		//  Attach click handlers to each item
		for( i = 0; i <= n; ++i ) {
			sub = (i > 0) ? subs[i-1] : 'Frontpage'
			attachSubClickHandler($('#subreddit_item_'+sub))
			if( !!(el = $('#btn_delete_subreddit_'+sub)) )
				attachSubDeleteHandler(el)
		}
	}

	function subExists( sub ) {
		if( !validateSubName(sub) ) return false
		sub = sub.toLowerCase()
		for( var i = 0, n = subs.length; i < n; ++i )
			if( sub === subs[i].toLowerCase() )
				return true
		return false
	}

	/**  Add a subreddit */
	function addSub( sub ) {
		var i, n
		var subLc, sub2Lc
		var html = ''
		var el

		if( !(sub = validateSubName(sub)) )
			throw "Invalid subreddit"

		//  Sort-insert into list
		subLc = sub.toLowerCase()
		for( i = 0, n = subs.length; i < n; ++i ) {
			sub2Lc = subs[i].toLowerCase()
			if( subLc === subs[i].toLowerCase() ) {
				throw "The sub "+sub+" was already added"
			}
			if( subLc < sub2Lc ) {
				break
			}
		}
		subs.splice(i, 0, sub)

		html = renderSub(sub)

		//  Insert into page after the item above it
		//  (Inserts after 'frontpage' if first)
		var subPrev = i > 0 ? subs[i-1] : 'Frontpage'
		$('#subreddit_item_'+subPrev).insertAdjacentHTML('afterend', html)
		//  Get this new element
		el = $('#subreddit_item_'+sub)
		//  Attach handlers to it
		attachSubClickHandler(el)
		attachSubDeleteHandler($('#btn_delete_subreddit_'+sub))

		//  Clear the 'Add' text input
		$('#txt_subreddit_add').value = ''

		//  Ensure it's in view
		var elc = $('#left_panel_content')
		var rcc = elc.getBoundingClientRect()
		var rci = el.getBoundingClientRect()
		var sy = elc.scrollTop
		console.log('scrollTop = '+sy)
		if( rci.top < rcc.top ) {
			// too high
			sy = Math.max(sy - (rcc.top - rci.top) - 10, 0)
			elc.scrollTop = Math.round(sy)
			console.log('scrolled to '+sy)
		}

		if( callbacks.onAdd ) callbacks.onAdd(sub)

		return true
	}

	function deleteSub( sub ) {
		if( !sub ) return
		//  Find in subs, regardless of case
		for( var i = 0, n = subs.length; i < n; ++i ) {
			if( subs[i].toLowerCase() === sub.toLowerCase() ) {
				// Remove from our array
				subs.splice(i, 1)
				break
			}
		}
		//  Find in doc, remove
		var el = $('#subreddit_item_'+sub)
		if( el ) {
			el.parentNode.removeChild(el)
		}
		if( callbacks.onDelete ) callbacks.onDelete(sub)
	}

	/**
	 *  Public interface
	 */
	return {
		render: render,
		subExists: subExists,
		addSub: addSub,
		deleteSub: deleteSub,
		subs: subs  // returns a reference to our array of subs
	}
}

return SubGroup

}());
