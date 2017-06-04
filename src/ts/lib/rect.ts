export interface Rect {
	left: number
	top: number
	right: number
	bottom: number
	width: number
	height: number
}

export function create (rc0?: Rect) {
	const rc = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0
	}
	return rc0 ? copy(rc0, rc) : rc
}

export function copy (src: Rect, out: Rect) {
	out.left = src.left
	out.top = src.top
	out.right = src.right
	out.bottom = src.bottom
	out.width = src.right - src.left
	out.height = src.bottom - src.top
	return out
}

/**
 *  @param w Rect width to fit
 *  @param h Rect height to fit
 *  @param wc Container rect width to fit into
 *  @param hc Container rect height to fit into
 *  @return Size that fits (integer values)
 */
export function fit (w: number, h: number, wc: number, hc: number) {
	let s = 1.0
	if (h < hc && w < wc) {
		// must enlarge
		h *= wc / w
		w = wc
	}
	if (h > hc) {
		// must shrink height
		s = hc / h
		w *= s
		h = hc
	}
	if (w > wc) {
		// must shrink width
		s = wc / w
		h *= s
		w = wc
	}
	return {
		w: Math.round(w), h: Math.round(h)
	}
}
