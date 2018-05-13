export const BASE_URL = 'https://www.reddit.com'
export const MAX_SUB_LENGTH = 40 // what is reddit's max..??
export const SUB_RX = /[^0-9A-Za-z_]/

// Types for Reddit API

export interface RedditVideo {
	height: number
	width: number
	duration: number
	fallback_url: string
	scrubber_media_url: string
	dash_url: string
	hls_url: string
	is_gif: boolean
	transcoding_status: string
}

export interface OEmbed {
	html: string
}

export interface Media {
	reddit_video?: RedditVideo
	oembed?: OEmbed
}

export interface Item {
	domain: string
	banned_by: any
	media_embed: any
	subreddit: string
	selftext_html: string
	selftext: string
	likes: any
	suggested_sort: any
	user_reports: any[]
	secure_media: any
	link_flair_text: string
	id: string
	from_kind: any
	gilded: number
	archived: boolean
	clicked: boolean
	report_reasons: any
	author: string
	media: Media | null
	score: number
	approved_by: any
	over_18: boolean
	hidden: boolean
	thumbnail: string
	subreddit_id: string
	edited: boolean
	link_flair_css_class: string
	author_flair_css_class: string
	downs: number
	mod_reports: any[]
	hide_score: boolean
	secure_media_embed: any
	saved: boolean
	removal_reason: any
	post_hint: string
	stickied: boolean
	from: any
	is_self: boolean
	from_id: string
	permalink: string
	locked: boolean
	ups: number
	visited: boolean
	num_reports: any
	num_comments: number
	name: string
	created: number
	url: string
	author_flair_text: string
	quarantine: boolean
	title: string
	created_utc: number
	distinguished: any
	preview: {
		images: PreviewImageSummary[]
	}
}

export interface Feed {
	kind: string
	data: {
		modhash: string,
		children: FeedItemSummary[],
		before: string,
		after: string
	}
}

export interface FeedItemSummary {
	kind: string
	data: Item
}

export type ArticleData = [ArticleList, CommentList]

export interface ArticleList {
	kind: string
	data: {
		modhash: string,
		children: ArticleSummary[],
		before: string,
		after: string
	}
}

export interface ArticleSummary {
	kind: string
	data: Article
}

export interface Article extends Item {
	upvote_ratio: number
}

export interface CommentList {
	kind: string
	data: {
		modhash: string,
		children: CommentSummary[],
		before: string,
		after: string
	}
}

export interface CommentSummary {
	kind: string
	data: Comment
}

export interface Comment {
	subreddit_id: string
	banned_by: any
	removal_reason: any
	link_id: string
	likes: any
	user_reports: any[]
	saved: boolean
	id: string
	gilded: number
	archived: boolean
	report_reasons: any
	author: string
	parent_id: string
	score: number
	approved_by: any
	controversiality: number
	body: string
	edited: boolean
	author_flair_css_class: string
	downs: number
	body_html: string
	subreddit: string
	name: string
	score_hidden: boolean
	stickied: boolean
	created: number
	author_flair_text: string
	created_utc: number
	distinguished: any
	mod_reports: any[]
	num_reports: any
	ups: number
	replies: CommentList
}

export interface PreviewImageSummary {
	source: PreviewImage
	resolutions: PreviewImage[]
}

export interface PreviewImage {
	url: string
	width: number
	height: number
}

export interface AboutSummary {
	kind: string
	data: About
}

export interface About {
	banner_img: string
	submit_text_html: string
	user_is_banned: any
	wiki_enabled: boolean
	show_media: boolean
	id: string
	user_is_contributor: any
	submit_text: string
	display_name: string
	header_img: string
	description_html: string
	title: string
	collapse_deleted_comments: boolean
	public_description: string
	over18: boolean
	public_description_html: string
	icon_size: any
	suggested_comment_sort: any
	icon_img: any
	header_title: string
	description: string
	user_is_muted: any
	submit_link_label: any
	accounts_active: number
	public_traffic: boolean
	header_size: number[]
	subscribers: number
	submit_text_label: string
	lang: string
	key_color: string
	name: string
	created: number
	url: string
	quarantine: boolean
	hide_ads: boolean
	created_utc: number
	banner_size: any
	user_is_moderator: any
	user_sr_theme_enabled: boolean
	show_media_preview: boolean
	comment_score_hide_mins: number
	subreddit_type: string
	submission_type: string
	user_is_subscriber: any
}
