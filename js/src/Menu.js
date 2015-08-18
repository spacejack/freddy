/*global $, Anim */
/*exported Menu, AlertBox, ConfirmBox */

/**
 *  A full-screen modal menu
 */
var Menu = function Menu( opts ) {

	var pointer
	var anim = opts.anim
	var items = opts.items
	var isOpen = false
	var elMenuBg = $('#menu_bg')
	var callbacks = {
		onSelect: opts.onSelect,
		onCancel: opts.onCancel,
		onClose: opts.onClose
	}
	var content = {
		title: opts.title,
		text: opts.text
	}
	opts = null

	//  Functions ///////////////////////

	function setItems( itms ) {
		items = itms
	}

	function attachItemClick( el, item ) {
		$.click(el, function(e){
			if( item.onclick) item.onclick(e)
			close()
			if( callbacks.onSelect ) callbacks.onSelect(item.id)
		})
	}

	function render() {
		var html = '<div class="menu_block">'
		if( content.title ) {
			html += '<div class="menu_title">'+content.title+'</div>'
		}
		if( content.text ) {
			html += '<div class="menu_text">'+content.text+'</div>'
		}
		html += '<div class="menu_items">'
		var i, n = items.length
		for( i = 0; i < n; ++i ) {
			html += '<div id="menu_item_'+items[i].id+'" class="menu_item" touch-action="none">'+items[i].title+'</div>'
		}
		html += '</div>' // end menu_items
		html += '</div>' // end menu_block

		$('#menu_content').innerHTML = html

		for( i = 0; i < n; ++i ) {
			attachItemClick($('#menu_item_'+items[i].id), items[i])
		}
	}

	function clear() {
		$('#menu_content').innerHTML = ''
	}

	function open() {
		if( isOpen ) return false
		isOpen = true
		render()
		pointer = $.click( elMenuBg, function() {
			close()
			if( callbacks.onCancel ) callbacks.onCancel()
		})
		elMenuBg.style.opacity = 0
		elMenuBg.style.display = 'inline-block'
		anim.fadeIn(elMenuBg, 80)
		return true
	}

	function close() {
		if( !isOpen ) return false
		pointer.remove()
		pointer = null
		anim.fadeOut(elMenuBg, 80, function() {
			elMenuBg.style.display = 'none'
			clear()
			isOpen = false
			if( callbacks.onClose ) callbacks.onClose()
		})
		return true
	}

	function toggle() {
		if(isOpen) close()
		else open()
	}

	/**
	 *  Release menu resources, remove event listeners.
	 *  This would only be needed if menu didn't close itself.
	 */
	function release() {
		pointer.remove()
		elMenuBg = null
		callbacks = {}
		content = {}
	}

	//  Public interface ////////////////////////////////

	return {
		open: open,
		close: close,
		toggle: toggle,
		render: render,
		setItems: setItems,
		release: release
	}
}

/**  Convenience function for alert messagebox */
var AlertBox = function AlertBox( msg, onClose ) {
	var anim = Anim()
	function close() {
		m = null
		anim = null
		if(onClose) onClose(true)
	}
	var m = Menu({
		anim: anim,
		title: msg,
		text: '&nbsp;',
		items: [{id:"ok", title:"Okay"}],
		onSelect: close,
		onCancel: close
	})
	m.open()
}

/**  Convenience function for confirm messagebox */
var ConfirmBox = function ConfirmBox( msg, onClose ) {
	var anim = Anim()
	function close(ok) {
		m = null
		anim = null
		if(onClose) onClose(ok)
	}
	var m = Menu({
		anim: anim,
		title: msg,
		text: '&nbsp;',
		items: [{id:"ok", title:"Okay"},{id:"cancel", title:"Cancel"}],
		onSelect: function(s) { close(s==='ok') },
		onCancel: function() { close(false) }
	})
	m.open()
};

/*
// One-time listener example
//
$('a#menu-link').on('click', function(e) {
    e.preventDefault()
    $('#menu').toggleClass('open')
    $(document).one('click', function closeMenu (e){
        if($('#menu').has(e.target).length === 0){
            $('#menu').removeClass('open')
        } else {
            $(document).one('click', closeMenu)
        }
    })
})
*/
