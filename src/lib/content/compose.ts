import type { Image, Piece } from './types.ts'

/** One photograph in the stream. `lead` marks the first photograph of its piece: it carries the words. */
export interface Figure {
	piece: Piece
	image: Image
	lead: boolean
}

export type Side = 'left' | 'right'

export type Block =
	| { layout: 'bleed'; side: Side; figure: Figure }
	| { layout: 'stagger'; drop: Side; a: Figure; b: Figure }
	| { layout: 'title'; piece: Piece }

export interface Month {
	/** `YYYY-MM` */
	month: string
	blocks: Block[]
}

const flip = (side: Side): Side => (side === 'right' ? 'left' : 'right')

/**
 * The site composes and she never places. Photographs run in pairs (stagger) with a single
 * one (bleed) between pairs, so two bleeds never sit together; writing with no photograph is a
 * title page. Each layout flips side every time it comes round, across the whole run.
 */
export function compose(pieces: Piece[]): Month[] {
	const months: Month[] = []
	let bleedSide: Side = 'left'
	let dropSide: Side = 'left'

	const setFigures = (figures: Figure[], blocks: Block[]) => {
		let wantPair = true
		let i = 0
		while (i < figures.length) {
			const a = figures[i]
			const b = figures[i + 1]
			if (a === undefined) break
			const left = figures.length - i
			if (b !== undefined && (wantPair || left === 2)) {
				dropSide = flip(dropSide)
				blocks.push({ layout: 'stagger', drop: dropSide, a, b })
				wantPair = false
				i += 2
			} else {
				bleedSide = flip(bleedSide)
				blocks.push({ layout: 'bleed', side: bleedSide, figure: a })
				wantPair = true
				i += 1
			}
		}
	}

	let current: Month | undefined
	let pending: Figure[] = []
	const flush = () => {
		if (current !== undefined && pending.length > 0) setFigures(pending, current.blocks)
		pending = []
	}

	for (const piece of pieces) {
		const month = piece.day.slice(0, 7)
		if (current?.month !== month) {
			flush()
			current = { month, blocks: [] }
			months.push(current)
		}
		if (piece.images.length > 0) {
			piece.images.forEach((image, i) => pending.push({ piece, image, lead: i === 0 }))
		} else if (piece.text !== null || piece.title !== null) {
			flush()
			current.blocks.push({ layout: 'title', piece })
		}
	}
	flush()

	return months.filter((m) => m.blocks.length > 0)
}
