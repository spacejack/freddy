export function sign (s: number) {
	return s > 0 ? 1 : s < 0 ? -1 : 0
}

export function clamp (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max)
}

export function length2d (x: number, y: number) {
	return Math.sqrt(x * x + y * y)
}

export function pmod (n: number, m: number) {
	return (n % m + m) % m
}

export function roundFrac (n: number, places: number) {
	const d = Math.pow(10, places)
	return Math.round(n * d) / d
}
