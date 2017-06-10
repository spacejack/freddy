import * as m from 'mithril'
import {getPref, setPref} from '../../models/options'

export default function render (name: string, label: string) {
	return m('p',
		m('input',
			{
				type: 'checkbox',
				checked: getPref(name),
				onchange: (e: Event) => {
					setPref(
						name,
						(e.currentTarget as HTMLInputElement).checked
					)
				}
			}
		),
		m('span', " " + label)
	)
}
