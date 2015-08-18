"use strict"

var fs = require('fs')
var ug = require('uglify-js')
var CleanCSS = require('clean-css')

function isWhitespace( s ) {
	return /^\s*$/.test(s)
}

var srcDir = '../js/src/'
var dstDir = '../js/'

var cssSrcDir = '../css/'
var cssDstDir = '../css/'

var cssSrcFilename = 'style.css'
var cssMinFilename = 'style.min.css'
var jsMinBasename = 'freddy'
var jsPat = '<script src="js/src/'  // patterns to match
var cssPat = '<link type="text/css" rel="stylesheet" href="css/'+cssSrcFilename+'" media="screen"/>'
var svgPat = '<img src="img/logo.svg" class="logo_svg"/>'

// Was a version param supplied?
var version = null
if( process.argv.length > 2 )
	version = process.argv[2]

// read dev.html
var ht = fs.readFileSync('../dev.html', {encoding:'utf8'})

// find source scripts
var p = 0, p1 = 0, p2 = 0
var srcs = []
var src
while( (p = ht.indexOf(jsPat, p)) !== -1 )
{
	// Find the script filename within the tag
	p1 = p + jsPat.length
	p2 = ht.indexOf('"', p1)
	src = ht.substr(p1, p2-p1)
	console.log('added source: '+src)
	srcs.push(src)
	p = p2
}

if( srcs.length < 1 ) {
	console.error('Error: No script sources found in page')
	return
}

// versioned filename
var vfname = jsMinBasename + (version ? '-' + version : '') + '.js'

//var outFile = tmpDir + vfname;
var distFile = dstDir + vfname

// prepend the path back on the filenames
for( var i = 0, n = srcs.length; i < n; ++i )
	srcs[i] = srcDir + srcs[i]

// Minify!
// Compress, mangle top level names, strip console.* calls, no old IE support.
//var minified = ug.minify(srcs, {mangle:{toplevel:true}, compress:{pure_funcs:['console.log','console.warn','console.error','console.info']}, ie_proof:false});
var minified
try { minified = ug.minify(srcs, {mangle:{toplevel:true}, ie_proof:false}) }
catch(e) { console.log(e); return }
console.log("minified successfully")
// Wrap everything in an IIFE
var packedJs =
	'(function(){' +
	minified.code +
	'}());'
minified = null

//var license = fs.readFileSync('license.txt', {encoding:'utf8'});
//minified =
//	"/*\n" + license + "\n*/\n" + minified.code;

fs.writeFileSync(distFile, packedJs)
console.log("wrote minified js: "+distFile)

var cssSrc = fs.readFileSync(cssSrcDir+cssSrcFilename)
var packedCss = (new CleanCSS()).minify(cssSrc).styles
packedCss = packedCss.replace(/\}/g, '}\n')
fs.writeFileSync(cssSrcDir+cssMinFilename, packedCss)
console.log('wrote minified css: '+cssSrcDir+cssMinFilename)

//  inline the SVG file
var svgData = ''+fs.readFileSync('../img/logo.svg')
svgData = svgData.substr(svgData.indexOf('<svg')).trim()
svgData = svgData.replace('<svg', '<svg class="logo_svg"')

//////////////////////////////////////////////////////////////////////
// Now generate page from dev.html
ht = ht.trim()
// strip windows newlines
ht = ht.replace(/\r\n/g,"\n")

// build a filtered copy of the page
var htpub = ""
// remove all <script> tags and add a single replacement
var lines = ht.split("\n")
var ln
for( var i = 0, n = lines.length; i < n; ++i ) {
	ln = lines[i]
	if( isWhitespace(ln) ) continue
	if( ln.indexOf(jsPat) >= 0 ) {
		//  omit all <script> tags
	}
	else if( ln.indexOf(cssPat) >= 0 ) {
		//  swap css link for our packed css style
		htpub += '<style>\n' + packedCss + '\n</style>\n'
	}
	else if( ln.indexOf(svgPat) >= 0 ) {
		//  swap <img> element with inline SVG
		htpub += ln.replace(svgPat, svgData)
	}
	else if( ln.indexOf('</body>') >= 0 ) {
		htpub += '<script>\n' + packedJs + '\n</script>\n</body>\n'
	}
	else {
		htpub += ln+"\n"
	}
}

// write index.html...
fs.writeFileSync('../index.html', htpub)

console.log('wrote: ../index.html')
