var CACHE_NAME = 'freddy-cache-v0.1'
var URLS = [
	'/',
	'/css/freddy.css',
	'/js/freddy.js',
	'/js/polyfill.js',
	'/img/logo.svg'
]

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache.addAll(URLS)
		})
	)
})

self.addEventListener('fetch', function(event) {
	// caches.has(CACHE_NAME).then(function(exists) { // use specific cache?
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response ? response : fetch(event.request)
		})
	)
})

// Prefetch example:
// https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/prefetch/service-worker.js
