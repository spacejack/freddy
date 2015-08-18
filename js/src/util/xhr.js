/*global $ */

/**  Simple get/post AJAX requests */
$.xhr = (function(){

	var numActiveRequests = 0
	var cacheSize = 0

	var METHODS = ['GET','POST','PUT','DELETE']

	/**
	 *  Send request to server.
	 *  Asynchronous call!
	 *  @param url {string} Url to send request to
	 *  @param opts.data {object} Name/value pairs to send
	 *  @param opts.success(data) {function} Success callback function (will be called on successful response)
	 *  @param opts.error(status) {function} Error callback function (will be called on unsuccessful response)
	 *  @param opts.method {string} 'GET' (default) or 'POST'
	 *  @param opts.sync {boolean} If true do a synchronized call, otherwise async
	 *  @param opts.contentType {string} Request content type (optional, only used for POST)
	 *  @param opts.acceptType {string} Expected response type (optional)
	 *  @return true on success, false on fail
	 */
	function xhr( url, opts ) {
		opts = opts || {}
		var method = opts.method || 'GET'
		method = (METHODS.indexOf(method.toUpperCase()) >= 0) ? method : 'GET'
		var data = opts.data
		var contentType = opts.contentType || 'application/x-www-form-urlencoded' // default post request type
		var acceptType = opts.accept || 'text/plain'  // default response type
		var sync = !!opts.sync
		var successCallback = opts.success
		var errorCallback = opts.error
		opts = null

		var req = new XMLHttpRequest()

		if( req.overrideMimeType ) {
			req.overrideMimeType(acceptType)
		}

		req.onreadystatechange = function() {
			if( req.readyState === 4 ) {
				--numActiveRequests
				if( req.status === 200 ) {
					if( successCallback ) successCallback(req.responseText)
				} else {
					if( errorCallback ) errorCallback(req.status)
				}
			}
		}

		//  Collect & pack the values
		var packed = ''; // "a=some&b=post&c=variables"
		for( var k in data ) if( data.hasOwnProperty(k) ) {
			var v = data[k]
			if( packed.length > 0 )
				packed += '&'
			packed += k + '=' + encodeURIComponent(v)
		}

		numActiveRequests++

		if( method === 'GET' ) {
			if( packed )
				url += '?' + packed
			req.open('GET', url, !sync)
			req.send('')
		} else {
			req.open(method, url, !sync)  // our flag is the opposite
			req.setRequestHeader('Content-Type', contentType)
			req.send(packed)
		}
	}

	xhr.getNumActiveRequests = function getNumActiveRequests() {
		return numActiveRequests
	}
	xhr.getCacheSize = function getCacheSize() {
		return cacheSize
	}
	xhr.setCacheSize = function setCacheSize( cs ) {
		cacheSize = cs
	}

	return xhr

}());
