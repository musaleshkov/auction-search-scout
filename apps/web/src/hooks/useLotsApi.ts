"use client";

import { useEffect, useState } from "react";
import { getLots } from "@/src/lib/api";
import type { Lot, LotsResponse } from "@/src/types/lot";
import { PAGE_SIZE } from "@/src/lib/constants";
import type { UseAuctionFiltersReturn } from "@/src/hooks/useAuctionFilters";

export type UseLotsApiReturn = {
	lots: Lot[];
	isLoading: boolean;
	error: string;
	categories: string[];
	countries: string[];
	total: number;
	totalPages: number;
};

export function useLotsApi(
	filters: Pick<
		UseAuctionFiltersReturn,
		"debouncedQuery" | "category" | "country" | "sort" | "page"
	>,
): UseLotsApiReturn {
	const { debouncedQuery, category, country, sort, page } = filters;

	const [lots, setLots] = useState<Lot[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [countries, setCountries] = useState<string[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Load ALL filter options once, without any filters applied
	useEffect(() => {
		let isMounted = true;

		async function loadFilters() {
			try {
				const response: LotsResponse = await getLots({
					limit: 0, // request 0 lots — only need filters
				});

				if (!isMounted) return;

				setCategories(response.filters.categories);
				setCountries(response.filters.countries);
			} catch {
				// Silently ignore — filters will be empty
			}
		}

		loadFilters();

		return () => {
			isMounted = false;
		};
	}, []);

	// Load lots when filters change
	useEffect(() => {
		let isMounted = true;

		async function loadLots() {
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
				setTotal(response.meta.total);
				setTotalPages(response.meta.totalPages);
			} catch (err) {
				if (!isMounted) return;
				setLots([]);
				setTotal(0);
				setTotalPages(1);
				setError(
					err instanceof Error ? err.message : "Failed to load auction lots.",
				);
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

	return {
		lots,
		isLoading,
		error,
		categories,
		countries,
		total,
		totalPages,
	};
}