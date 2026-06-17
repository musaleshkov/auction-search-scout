import type { Lot, LotsQuery, LotsResponse } from "./types.js";

export function buildLotsResponse (lots: Lot[], query: LotsQuery): LotsResponse {
	const search = query.search?.trim().toLowerCase() ?? "";

	let filteredLots = lots.filter((lot) => {
		const matchesSearch =
			!search ||
			lot.title.toLowerCase().includes(search) ||
			lot.description.toLowerCase().includes(search);

		const matchesCategory = !query.category || lot.category === query.category;
		const matchesCountry = !query.country || lot.country === query.country;

		return matchesSearch && matchesCategory && matchesCountry;
	});

	if (query.sort === "estimate-asc") {
		filteredLots = [...filteredLots].sort(
			(a, b) => a.estimate_low - b.estimate_low,
		);
	}

	if (query.sort === "estimate-desc") {
		filteredLots = [...filteredLots].sort(
			(a, b) => b.estimate_high - a.estimate_high,
		);
	}

	const limit = Math.min(Math.max(query.limit, 1), 60);
	const total = filteredLots.length;
	const totalPages = Math.max(Math.ceil(total / limit), 1);
	const page = Math.min(Math.max(query.page, 1), totalPages);

	const startIndex = (page - 1) * limit;
	const paginatedLots = filteredLots.slice(startIndex, startIndex + limit);

	return {
		data: paginatedLots,
		meta: {
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
		filters: {
			categories: Array.from(new Set(lots.map((lot) => lot.category))).sort(),
			countries: Array.from(new Set(lots.map((lot) => lot.country))).sort(),
		},
	};
}