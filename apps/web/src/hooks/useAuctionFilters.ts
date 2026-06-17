"use client";

import { useCallback, useState } from "react";
import type { SortOption } from "@/src/types/lot";
import { useDebounce } from "@/src/hooks/useDebounce";

export type UseAuctionFiltersReturn = {
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
	debouncedQuery: string;
	clearFilters: () => void;
};

export function useAuctionFilters(): UseAuctionFiltersReturn {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("");
	const [country, setCountry] = useState("");
	const [sort, setSort] = useState<SortOption>("none");
	const [page, setPage] = useState(1);

	const debouncedQuery = useDebounce(query, 300);

	const clearFilters = useCallback(() => {
		setQuery("");
		setCategory("");
		setCountry("");
		setSort("none");
		setPage(1);
	}, []);

	return {
		query,
		setQuery,
		category,
		setCategory,
		country,
		setCountry,
		sort,
		setSort,
		page,
		setPage,
		debouncedQuery,
		clearFilters,
	};
}