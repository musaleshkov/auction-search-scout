import type { Lot, LotsQuery, LotsResponse } from "./types.js";

const COUNTRY_NAMES: Record<string, string> = {
	SE: "Sweden",
	UK: "United Kingdom",
	FR: "France",
	DE: "Germany",
	US: "United States",
	IT: "Italy",
	ES: "Spain",
	BE: "Belgium",
};

export function getCountryName (code: string): string {
	return COUNTRY_NAMES[code] ?? code;
}

export function buildLotsResponse (lots: readonly Lot[], query: LotsQuery): LotsResponse {
	const search: string = query.search?.trim().toLowerCase() ?? "";

	let filteredLots: Lot[] = lots.filter((lot: Lot) => {
		const matchesSearch: boolean =
			!search ||
			lot.title.toLowerCase().includes(search) ||
			lot.description.toLowerCase().includes(search);

		const matchesCategory: boolean = !query.category || lot.category === query.category;
		const matchesCountry: boolean = !query.country || lot.country === query.country;

		return matchesSearch && matchesCategory && matchesCountry;
	});

	if (query.sort === "estimate-asc") {
		filteredLots = [...filteredLots].sort(
			(a: Lot, b: Lot) => a.estimate_low - b.estimate_low,
		);
	}

	if (query.sort === "estimate-desc") {
		filteredLots = [...filteredLots].sort(
			(a: Lot, b: Lot) => b.estimate_high - a.estimate_high,
		);
	}

	const limit: number = Math.min(Math.max(query.limit, 1), 60);
	const total: number = filteredLots.length;
	const totalPages: number = Math.max(Math.ceil(total / limit), 1);
	const page: number = Math.min(Math.max(query.page, 1), totalPages);

	const startIndex: number = (page - 1) * limit;
	const paginatedLots: Lot[] = filteredLots.slice(startIndex, startIndex + limit);

	const dataWithCountryName = paginatedLots.map((lot: Lot) => ({
		...lot,
		country_name: getCountryName(lot.country),
	}));

	const filteredCategories: string[] = Array.from(
		new Set(filteredLots.map((lot: Lot) => lot.category)),
	).sort();
	const filteredCountries: string[] = Array.from(
		new Set(filteredLots.map((lot: Lot) => lot.country)),
	).sort();

	return {
		data: dataWithCountryName,
		meta: {
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
		filters: {
			categories: filteredCategories,
			countries: filteredCountries,
		},
	};
}