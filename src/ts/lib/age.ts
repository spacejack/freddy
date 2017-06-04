const MINUTE = 60
const HOUR = 60 * 60
const DAY = 60 * 60 * 24
const MONTH = 60 * 60 * 24 * 12
const YEAR = 60 * 60 * 24 * 365

/**
 * Casual english for age of post.
 * Not super accurate (no DST, leap years, approx. months)
 * @param seconds Age in seconds
 */
export default function ageString (seconds: number) {
	const t = seconds
	let n: number
	let str: string, tstr: string
	if (t < MINUTE) {
		str = 'just now'
	} else {
		if (t < HOUR) {
			n = Math.round(t / MINUTE)
			tstr = 'minute'
		} else if (t < DAY) {
			n = Math.round(t / HOUR)
			tstr = 'hour'
		} else if (t < MONTH) {
			n = Math.round(t / DAY)
			tstr = 'day'
		} else if (t < YEAR) {
			n = Math.round(t / MONTH)
			tstr = 'month'
		} else {
			n = Math.round(t / YEAR)
			tstr = 'year'
		}
		if (n > 1) {
			tstr += 's'
		}
		str = n + ' ' + tstr + ' ago'
	}
	return str
}
