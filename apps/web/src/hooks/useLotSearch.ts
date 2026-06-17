"use client";

import { useAuctionFilters } from "@/src/hooks/useAuctionFilters";
import { useLotsApi } from "@/src/hooks/useLotsApi";
import type { UseLotSearchReturn } from "@/src/hooks/useLotSearch.types";

export { PAGE_SIZE } from "@/src/lib/constants";
export type { UseLotSearchReturn } from "@/src/hooks/useLotSearch.types";

export function useLotSearch(): UseLotSearchReturn {
	const filters = useAuctionFilters();
	const api = useLotsApi(filters);

	return {
		lots: api.lots,
		isLoading: api.isLoading,
		error: api.error,
		query: filters.query,
		setQuery: (value) => {
			filters.setQuery(value);
			filters.setPage(1);
		},
		category: filters.category,
		setCategory: (value) => {
			filters.setCategory(value);
			filters.setPage(1);
		},
		country: filters.country,
		setCountry: (value) => {
			filters.setCountry(value);
			filters.setPage(1);
		},
		sort: filters.sort,
		setSort: (value) => {
			filters.setSort(value);
			filters.setPage(1);
		},
		page: filters.page,
		setPage: filters.setPage,
		categories: api.categories,
		countries: api.countries,
		total: api.total,
		totalPages: api.totalPages,
		clearFilters: filters.clearFilters,
	};
}