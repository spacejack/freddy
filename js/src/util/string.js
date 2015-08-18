/*global $ */

/**  String utils */
$.string = (function(){

	function isWhitespace( s ) {
		return /^\s+$/.test(s)
	}

	/**  Capitalize the first letter of a string */
	function capitalize( s ) {
		if( !s || typeof s !== 'string' || s.length < 1 ) return ''
		return s.charAt(0).toUpperCase() + s.substr(1)
	}

	/**  Case-Insensitive EQuality */
	function cieq( s1, s2 ) {
		return s1.toUpperCase() === s2.toUpperCase()
	}

	/**
	 *  Joins path segments.  Preserves initial "/" and resolves ".." and "."
	 *  Does not support using ".." to go above/outside the root.
	 *  This means that join("foo", "../../bar") will not resolve to "../bar"
	 *  @param path1, path2 [, path3 [, path4]] etc.
	 */
	function joinPaths() {
		var i, n
		var parts = [], newParts = []

		// Split the inputs into a list of path commands.
		for( i = 0, n = arguments.length; i < n; i++ ) {
			parts = parts.concat(arguments[i].split("/"))
		}

		// Interpret the path commands to get the new resolved path.
		newParts = [];
		for( i = 0, n = parts.length; i < n; i++ ) {
			var part = parts[i]
			// Remove leading and trailing slashes
			// Also remove "." segments
			if( !part || part === "." ) continue
			// Interpret ".." to pop the last segment
			if( part === ".." ) newParts.pop()
			// Push new path segments.
			else newParts.push(part)
		}
		// Preserve the initial slash if there was one.
		if( parts[0] === "" ) newParts.unshift("")
		// Turn back into a single string path.
		return newParts.join("/") || (newParts.length ? "/" : ".")
	}

	// A simple function to get the dirname of a path
	// Trailing slashes are ignored. Leading slash is preserved.
	function dirName( path ) {
		return joinPaths(path, "..")
	}

	return {
		cieq: cieq,
		capitalize: capitalize,
		isWhitespace: isWhitespace,
		joinPaths: joinPaths,
		dirName: dirName
	}

}());
