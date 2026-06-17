import type { Lot } from "@/src/types/lot";

export type SortOption = "none" | "estimate-asc" | "estimate-desc";

type FilterLotsParams = {
	lots: Lot[];
	query: string;
	category: string;
	country: string;
	sort: SortOption;
};

export function filterLots({
	lots,
	query,
	category,
	country,
	sort
}: FilterLotsParams): Lot[] {
	const normalizedQuery = query.trim().toLowerCase();

	const filtered = lots.filter((lot) => {
		const matchesQuery =
			!normalizedQuery ||
			lot.title.toLowerCase().includes(normalizedQuery) ||
			lot.description.toLowerCase().includes(normalizedQuery);

		const matchesCategory = !category || lot.category === category;
		const matchesCountry = !country || lot.country === country;

		return matchesQuery && matchesCategory && matchesCountry;
	});

	if (sort === "estimate-asc") {
		return [...filtered].sort((a, b) => a.estimate_low - b.estimate_low);
	}

	if (sort === "estimate-desc") {
		return [...filtered].sort((a, b) => b.estimate_high - a.estimate_high);
	}

	return filtered;
}