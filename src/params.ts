import { defineParams } from '@sveltejs/kit/params'

export const params = defineParams({
	// a four-digit year, so `/2019` is a year page and `/anything-else` is a 404
	year: (param) => (/^(19|20)\d\d$/.test(param) ? Number(param) : undefined)
})
