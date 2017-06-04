import * as m from 'mithril'
import * as stream from 'mithril/stream'
import {REDDIT_BASE_URL} from './reddit'
import {screenSize} from '../lib/browser'
import {prepEscapedHtml} from '../lib/html'

export const itemList = stream<ItemList|undefined>()
export const about = stream<About|undefined>()
export const order = stream('')
export const title = stream<string>()
export const subreddit = stream<string>()
export const sortby = stream<string|undefined>()

export interface ItemImage {
	url: string
	width: number
	height: number
}

export interface Item {
	id: string
	title: string
	url: string
	permalink: string
	author: string
	subreddit: string
	is_self: boolean
	domain: string
	score: number
	created_utc: number
	num_comments: number
	over_18: boolean
	thumbnail: string
	image: ItemImage | undefined
}

export interface ItemList {
	items: Item[]
	before: string
	after: string
}

export interface About {
	display_name: string
	body: m.Children
	subscribers?: number
}

function parseItem (ri: Reddit.Item) {
	const item: Item = {
		id: ri.id,
		title: ri.title,
		url: ri.url,
		permalink: ri.permalink,
		author: ri.author,
		subreddit: ri.subreddit,
		is_self: ri.is_self,
		domain: ri.domain,
		score: ri.score,
		created_utc: ri.created_utc,
		num_comments: ri.num_comments,
		over_18: ri.over_18,
		thumbnail: (ri.thumbnail && ri.thumbnail.startsWith('https://'))
			? ri.thumbnail : '',
		image: getItemImage(ri)
	}
	return item
}

function parseItemList (json: string) {
	const data = JSON.parse(json) as Reddit.Feed
	const ris = data.data.children
	const itemList: ItemList = {
		items: ris.map(r => parseItem(r.data)),
		before: data.data.before,
		after: data.data.after
	}
	return itemList
}

function parseAbout (json: string) {
	const data = JSON.parse(json) as Reddit.AboutSummary
	const ra = data.data
	const about: About = {
		display_name: ra.display_name,
		body: m.trust(prepEscapedHtml(ra.description_html)),
		subscribers: ra.subscribers
	}
	return about
}

/** Given an Item find the best image url to use (otherwise returns undefined) */
export function getItemImage(item: Reddit.Item): ItemImage | undefined {
	if (!item.preview || !item.preview.images || item.preview.images.length < 1) {
		return undefined
	}
	const imgs = item.preview.images[0].resolutions
	if (!imgs || imgs.length < 1) undefined
	const image = selectImgSize(imgs, screenSize.width, screenSize.height)
	return image
		? {
			url: image.url, width: image.width, height: image.height
		}
		: undefined
}

/**
 *  Given a list of images with sizes, select the
 *  best fit for device screen size
 */
function selectImgSize<T extends {width: number, height: number}> (
	imgs: T[], w: number, h: number
) : T | undefined {
	const n = imgs.length
	for (let i = 0; i < n; ++i) {
		const img = imgs[i]
		if (img.width >= w || img.height >= h) return img
	}
	return imgs[n - 1]
}

/**
 * Load a subreddit feed. If a promise is supplied, the JSON parsing
 * and stream update will be deferred until it resolves.
 */
export function load (sub: string, ord?: string, p?: Promise<any>) {
	if (subreddit() === sub && sortby() === ord) {
		// This is current, don't reload.
		return
	}
	subreddit(sub)
	sortby(ord)
	title((sub.toLowerCase() === 'frontpage') ?
		'Frontpage' : '/r/' + sub)
	itemList(undefined)
	about(undefined)
	// fetch data from reddit
	const urls = makeSubredditUrls(sub, ord)
	order(ord && ord !== 'hot' ? ord : '')

	m.request({
		url: urls.feed,
		method: 'GET',
		extract: xhr => xhr.responseText,
		background: true
	}).then(json => {
		// If we were given a promise, then we should
		// wait for it to complete before parsing and
		// updating the stream.
		if (p) {
			p.then(() => {
				itemList(parseItemList(json))
				m.redraw()
			})
		} else {
			itemList(parseItemList(json))
			m.redraw()
		}
	})

	if (urls.about) {
		m.request({
			url: urls.about,
			method: 'GET',
			extract: xhr => xhr.responseText,
			background: true
		}).then(json => {
			// Wait for promise?
			if (p) {
				p.then(() => {
					about(parseAbout(json))
					m.redraw()
				})
			} else {
				about(parseAbout(json))
				m.redraw()
			}
		})
	}
}

export function loadMore (after: string) {
	if (!itemList()) {
		console.warn("No feed loaded yet")
		return
	}
	if (!after) {
		console.warn("No after token")
		return
	}
	let url = (subreddit().toLowerCase() === 'frontpage') ?
		REDDIT_BASE_URL + '/' + (order() ? order() : '') + '.json' :
		REDDIT_BASE_URL + '/r/' + subreddit() + (order() ? '/' + order() : '') + '.json'
	url += '?after=' + after
	m.request<Reddit.Feed>({url, method: 'GET'}).then(appendData)
}

function appendData (data: Reddit.Feed) {
	// Add items that weren't already in the previous list of items
	const l = itemList()
	if (!l) throw new Error("Cannot appendData - no existing list")
	const listOld = l.items
	const listNew = data.data.children
	for (let i = 0; i < listNew.length; ++i) {
		const newItem = listNew[i]
		if (!listOld.find(oldItem => oldItem.id === newItem.data.id)) {
			listOld.push(parseItem(newItem.data))
		}
	}
	// Update the 'after' token
	l.after = data.data.after
	itemList(l)
}

/**
 * Given a subreddit name, construct Reddit API URLs
 */
function makeSubredditUrls (subreddit: string, ord?: string) {
	const urls = {
		feed: undefined as any as string,
		about: undefined as string | undefined
	}
	if (subreddit.toLowerCase() === 'frontpage') {
		urls.feed = REDDIT_BASE_URL + '/' + (ord ? ord : '') + '.json'
	} else {
		urls.feed = REDDIT_BASE_URL + '/r/' + subreddit + (ord ? '/' + ord : '') + '.json'
		urls.about = REDDIT_BASE_URL + '/r/' + subreddit + '/about.json'
	}
	return urls
}
