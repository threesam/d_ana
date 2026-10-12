/** Shapes of the GROQ projections the pages read. One piece is one post, story, reel or essay. */
export interface Image {
	key: string
	/** The Sanity asset id, e.g. `image-<hash>-1080x1920-jpg`. */
	ref: string
	alt: string
	width: number
	height: number
	/** The photograph's own dominant colour, shown until it loads. */
	tone: string | null
	/** A video's address. When set, the photograph is the still shown until it plays. */
	video: string | null
}

export interface Place {
	name: string
	city: string
	lat: number
	lng: number
}

export interface Theme {
	handle: string
	title: string
}

export interface Piece {
	handle: string
	kind: 'post' | 'story' | 'reel' | 'essay'
	/** `YYYY-MM-DD` */
	day: string
	title: string | null
	text: string | null
	images: Image[]
	place: Place | null
	people: string[]
	themes: Theme[]
}
