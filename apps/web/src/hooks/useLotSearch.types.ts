import type { SortOption, Lot } from "@/src/types/lot";

export type UseLotSearchReturn = {
	lots: Lot[];
	isLoading: boolean;
	error: string;
	query: string;
	setQuery: (value: string) => void;
	category: string;
	setCategory: (value: string) => void;
	country: string;
	setCountry: (value: string) => void;
	sort: SortOption;
	setSort: (value: SortOption) => void;
	page: number;
	setPage: (value: number) => void;
	categories: string[];
	countries: string[];
	total: number;
	totalPages: number;
	clearFilters: () => void;
};