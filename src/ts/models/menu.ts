import * as stream from 'mithril/stream'

export interface Menu {
	title: string
	text?: string
	items: MenuItem[],
	onselect?(id: string): void
}

export interface MenuItem {
	id: string
	text: string
}

export default stream<Menu | undefined>()
