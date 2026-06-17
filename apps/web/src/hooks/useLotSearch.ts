"use client";

import { useCallback, useEffect, useState } from "react";
import { getLots } from "@/src/lib/api";
import type { Lot, SortOption, LotsResponse } from "@/src/types/lot";
import { useDebounce } from "@/src/hooks/useDebounce";

export const PAGE_SIZE: number = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 12;

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

export function useLotSearch (): UseLotSearchReturn {
	const [lots, setLots] = useState<Lot[]>([]);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("");
	const [country, setCountry] = useState("");
	const [sort, setSort] = useState<SortOption>("none");
	const [page, setPage] = useState(1);
	const [categories, setCategories] = useState<string[]>([]);
	const [countries, setCountries] = useState<string[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const debouncedQuery: string = useDebounce(query, 300);

	useEffect(() => {
		let isMounted: boolean = true;

		async function loadLots () {
			try {
				setIsLoading(true);
				setError("");

				const response: LotsResponse = await getLots({
					search: debouncedQuery,
					category,
					country,
					sort,
					page,
					limit: PAGE_SIZE,
				});

				if (!isMounted) return;

				setLots(response.data);
				setCategories((prev) => {
					const merged = new Set([...prev, ...response.filters.categories]);
					return Array.from(merged);
				});
				setCountries((prev) => {
					const merged = new Set([...prev, ...response.filters.countries]);
					return Array.from(merged);
				});
				setTotal(response.meta.total);
				setTotalPages(response.meta.totalPages);
			} catch {
				if (!isMounted) return;
				setLots([]);
				setTotal(0);
				setTotalPages(1);
				setError("Failed to load auction lots.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		loadLots();

		return () => {
			isMounted = false;
		};
	}, [debouncedQuery, category, country, sort, page]);

	const clearFilters: () => void = useCallback(() => {
		setQuery("");
		setCategory("");
		setCountry("");
		setSort("none");
		setPage(1);
	}, []);

	return {
		lots,
		isLoading,
		error,
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
		categories,
		countries,
		total,
		totalPages,
		clearFilters,
	};
}