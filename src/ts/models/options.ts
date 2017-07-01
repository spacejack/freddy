import * as stream from 'mithril/stream'
import {Stream} from 'mithril/stream'
import {MAX_SUB_LENGTH, SUB_RX} from './reddit'

export interface Theme {
	name: string
	title: string
}

export interface Preferences {
	theme: string
	articleThumbs: boolean
	feedThumbs: boolean
	nsfw: boolean
}

export const THEMES: Theme[] = [{name: 'default', title: "Default"}]

const DEFAULT_PREFS: Preferences = {
	theme: 'default',
	articleThumbs: true,
	feedThumbs: true,
	nsfw: false,
}

const DEFAULT_SUBS = [
	"Frontpage",
	"all",
	"art",
	"askreddit",
	"books",
	"funny",
	"gadgets",
	"gaming",
	"javascript",
	"movies",
	"music",
	"pics",
	"programming",
	"science",
	"television",
	"videos",
	"webdev",
	"worldnews"
]

export const preferences = stream(DEFAULT_PREFS)
export const subreddits = stream(DEFAULT_SUBS)
export const options = stream.combine(
	(prefs: Stream<Preferences>, subs: Stream<string[]>) => ({
		preferences: prefs(),
		subreddits: subs()
	}),
	[preferences, subreddits]
)

export function getPref (name: string) {
	return preferences()[name]
}

export function setPref (name: string, value: any) {
	preferences(Object.assign({}, preferences(), {[name]: value}))
	savePreferences()
}

export function addSubreddit (_sub: string) {
	const sub = validateSubName(_sub)
	if (!sub) {
		console.warn("Invalid subreddit: '" + _sub + "'")
		return
	}
	//  Sort-insert into list
	let i: number, n: number
	const subLc = sub.toLowerCase()
	const subs = subreddits().slice()
	for (i = 1, n = subs.length; i < n; ++i) {
		const sub2Lc = subs[i].toLowerCase()
		if (subLc === sub2Lc) {
			console.warn("Subreddit '" + sub + "' already added")
			return
		}
		if (subLc < sub2Lc) {
			break
		}
	}
	// Update stream array
	subs.splice(i, 0, sub)
	subreddits(subs)
	saveSubreddits()
}

export function removeSubreddit (sub: string) {
	const subLc = sub.toLowerCase()
	const i = subreddits().findIndex(s => s.toLowerCase() === subLc)
	if (i < 0) {
		console.warn("Subreddit '" + sub + "' not found")
		return
	}
	// Update stream array
	const subs = subreddits().slice()
	subs.splice(i, 1)
	subreddits(subs)
	saveSubreddits()
}

/** Load all options (preferences, subreddits) */
export function load() {
	loadPreferences()
	loadSubreddits()
}

/** Reset subreddits & prefs to app defaults */
export function reset() {
	window.localStorage.removeItem('freddy_subreddits')
	window.localStorage.removeItem('freddy_preferences')
	subreddits(DEFAULT_SUBS)
	preferences(DEFAULT_PREFS)
	saveSubreddits()
	savePreferences()
}

function validateSubName (sub: string) {
	if (!sub || typeof sub !== 'string')
		return null
	const s = sub.trim()
	if (s.length < 1 || s.length > MAX_SUB_LENGTH)
		return null
	if (s.match(SUB_RX))
		return null
	return s
}

function loadSubreddits() {
	const json = window.localStorage.getItem('freddy_subreddits')
	if (!json) return // none saved
	let subs: string[]
	try {
		subs = JSON.parse(json)
	} catch (e) {
		console.warn("Error parsing saved subreddits")
		return
	}
	subreddits(subs)
}

function loadPreferences() {
	const json = window.localStorage.getItem('freddy_preferences')
	if (!json) return // none saved
	let prefs: Preferences
	try {
		prefs = JSON.parse(json)
	} catch (e) {
		console.warn("Error parsing saved subreddits")
		return
	}
	preferences({
		articleThumbs: !!prefs.articleThumbs,
		feedThumbs: !!prefs.feedThumbs,
		nsfw: !!prefs.nsfw,
		theme: THEMES.some(t => t.name === prefs.theme)
			? prefs.theme : THEMES[0].name
	})
}

function saveSubreddits() {
	window.localStorage.setItem(
		'freddy_subreddits', JSON.stringify(subreddits())
	)
}

function savePreferences() {
	window.localStorage.setItem(
		'freddy_preferences', JSON.stringify(preferences())
	)
}
