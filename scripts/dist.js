'use strict'

const fs = require('fs-extra')
const path = require('path')

const src = path.resolve(__dirname, '../public')

const html = fs.readFileSync(src + '/index.html').toString()
const js = fs.readFileSync(src + '/freddy.js').toString()
const css = fs.readFileSync(src + '/freddy.css').toString()

const dst = path.resolve(__dirname, '../dist')

if (!fs.existsSync(dst)) {
	fs.mkdirSync(dst)
	console.log(`Created directory '${dst}'`)
}
if (!fs.existsSync(dst + '/img')) {
	fs.mkdirSync(dst + '/img')
	console.log(`Created directory '${dst}/img'`)
}
if (!fs.existsSync(dst + '/themes')) {
	fs.mkdirSync(dst + '/themes')
	console.log(`Created directory '${dst}/themes'`)
}

const dist = html.replace(
	'<link rel="stylesheet" type="text/css" href="freddy.css"/>',
	`<style>${css}</style>`
).replace(
	'<script src="freddy.js"></script>',
	`<script>${js}</script>`
)

fs.writeFileSync(dst + '/index.html', dist, {encoding: 'utf8'})

console.log('Wrote index.html')

fs.copySync(src + '/img/icon.png', dst + '/img/icon.png')

console.log('Copied icon.png')

fs.copySync(src + '/themes/dark.css', dst + '/themes/dark.css')
fs.copySync(src + '/themes/light.css', dst + '/themes/light.css')

console.log('Copied themes')

process.exit()
