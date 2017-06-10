'use strict'

const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, '../public')

const html = fs.readFileSync(src + '/index.html').toString()
const js = fs.readFileSync(src + '/js/freddy.js').toString()
const css = fs.readFileSync(src + '/css/freddy.css').toString()

const dst = path.resolve(__dirname, '../dist')

if (!fs.existsSync(dst)) {
	fs.mkdirSync(dst)
	console.log("Created directory 'dist'")
}

const dist = html.replace(
	'<link rel="stylesheet" type="text/css" href="css/freddy.css"/>',
	`<style>${css}</style>`
).replace(
	'<script src="js/freddy.js"></script>',
	`<script>${js}</script>`
)

fs.writeFileSync(dst + '/index.html', dist, {encoding: 'utf8'})

console.log('Wrote dist/index.html')

process.exit()
