import * as m from 'mithril'
import * as stream from 'mithril/stream'
import {isSecure} from '../lib/browser'
import {prepEscapedHtml} from '../lib/html'
import {roundFrac} from '../lib/math'
import {Item, getItemImage} from './feed'
import {REDDIT_BASE_URL} from './reddit'

export const THUMB_MAX_HEIGHT = 133
export const THUMB_MAX_WIDTH = 200

export interface Thumb {
	url: string
	width: string // In ems. Eg: '1em'
	height: string
}

export interface Article extends Item {
	body: m.Children
	upvote_ratio: number
	thumb?: Thumb
	comments: Comment[]
}

export interface Comment {
	author: string
	body: m.Children
	score: number
	created_utc: number
	edited: boolean
	gilded: number
	controversiality: number
	replies: Comment[]
}

let currentUrl: string

// Parse Reddit data into our view model
function parseArticle (json: any) {
	const data = JSON.parse(json) as Reddit.ArticleData
	const ra = data[0].data.children[0].data // article content
	const rcs = data[1].data.children // comments
	const a: Article = {
		id: ra.id,
		title: ra.title,
		url: ra.url,
		permalink: ra.permalink,
		author: ra.author,
		subreddit: ra.subreddit,
		is_self: ra.is_self,
		body: ra.selftext_html ?
			m.trust(prepEscapedHtml(ra.selftext_html)) : undefined,
		domain: ra.domain,
		score: ra.score,
		created_utc: ra.created_utc,
		num_comments: ra.num_comments,
		over_18: ra.over_18,
		thumbnail: ra.thumbnail,
		image: getItemImage(ra),
		upvote_ratio: ra.upvote_ratio,
		thumb: parseThumb(ra),
		comments: rcs.map(rc => parseComment(rc.data))
	}
	return a
}

function parseThumb (data: Reddit.Article): Thumb | undefined {
	let thumbUrl: string
	let imgs: any[]
	let width = THUMB_MAX_WIDTH, height = THUMB_MAX_HEIGHT

	// Does it have a thumbnail image?
	if (data.is_self || !data.thumbnail || data.thumbnail === 'self') {
		return undefined
	}

	thumbUrl = data.thumbnail
	if (thumbUrl.indexOf('http://') < 0 && thumbUrl.indexOf('https://') < 0) {
		return undefined
	}

	// Does it have preview images?
	if (data.preview && !!(imgs = data.preview.images) && imgs.length > 0) {
		const img = imgs[0].source
		width = img.width
		height = img.height
	}

	// Ensure on https
	if (isSecure) {
		thumbUrl = thumbUrl.replace('http://', 'https://')
	}

	// Calculate thumb sizing in pixels
	const pw = Math.min(Math.round((width / height) * THUMB_MAX_HEIGHT), THUMB_MAX_WIDTH)
	const ph = THUMB_MAX_HEIGHT

	return {
		url: thumbUrl,
		width: pxToEm(pw) + 'em',
		height: pxToEm(ph) + 'em'
	}
}

function parseComment (rc: Reddit.Comment) {
	const comment: Comment = {
		author: rc.author,
		body: m.trust(prepEscapedHtml(rc.body_html)),
		score: rc.score,
		created_utc: rc.created_utc,
		edited: rc.edited,
		gilded: rc.gilded,
		controversiality: rc.controversiality,
		replies: rc.replies
			? rc.replies.data.children.map(r => parseComment(r.data))
			: []
	}
	return comment
}

/**  Convert image pixel size to ems */
function pxToEm (px: number) {
	// TODO: Calculate scale dynamically? Currently hard-coded to 18px=1em
	// Rounded to 3 decimal places
	return roundFrac(px / 18, 3)
}

export const article = stream<Article|undefined>(undefined)

/**
 * Load article content. If a promise is supplied, the JSON parsing
 * and stream update will be deferred until it resolves.
 */
export function load (url: string, p?: Promise<any>) {
	if (currentUrl === url) return
	currentUrl = url
	article(undefined)
	url = REDDIT_BASE_URL + url + '.json'
	m.request({
		url,
		extract: xhr => xhr.responseText,
		background: true
	}).then(json => {
		if (p) {
			p.then(() => {
				article(parseArticle(json))
				m.redraw()
			})
		} else {
			article(parseArticle(json))
			m.redraw()
		}
	})
}
