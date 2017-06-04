import {Item} from '../../models/feed'
import {Preferences} from '../../models/options'
import renderItem from './item'

export default function render (allItems: Item[], prefs: Preferences) {
	const time = Date.now() / 1000
	const items = prefs.nsfw
		? allItems
		: allItems.filter(i => !i.over_18)
	return items.map(item => renderItem(item, time, prefs))
}
