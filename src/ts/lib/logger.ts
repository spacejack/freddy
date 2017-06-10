export function log (msg: string) {
	const el = document.querySelector('.logger')
	if (!el) return
	el.innerHTML = el.innerHTML + msg + '<br/>'
}
