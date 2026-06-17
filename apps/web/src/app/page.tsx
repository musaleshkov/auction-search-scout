"use client";

import { useMemo, useState } from "react";
import type { Lot } from "@/src/types/lot";
import { PAGE_SIZE, useLotSearch } from "@/src/hooks/useLotSearch";
import { FilterBar } from "@/src/components/FilterBar";
import { Header } from "@/src/components/Header";
import { LotCard } from "@/src/components/LotCard";
import { LotCardSkeleton } from "@/src/components/LotCardSkeleton";
import { LotModal } from "@/src/components/LotModal";
import { Pagination } from "@/src/components/Pagination";
import { COUNTRY_NAMES } from "@/src/lib/constants";

export default function Home () {
	const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
	const {
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
	} = useLotSearch();

	const categoryOptions = useMemo(
		() => [
			{ value: "", label: "All categories" },
			...categories.map((item: string) => ({ value: item, label: item })),
		],
		[categories],
	);

	const countryOptions = useMemo(
		() => [
			{ value: "", label: "All countries" },
			...countries.map((code: string) => ({
				value: code,
				label: COUNTRY_NAMES[code] ?? code,
			})),
		],
		[countries],
	);

	const sortOptions = useMemo(
		() => [
			{ value: "none", label: "No sorting" },
			{ value: "estimate-asc", label: "Estimate: Low to high" },
			{ value: "estimate-desc", label: "Estimate: High to low" },
		],
		[],
	);

	const hasFilters: string | boolean = query || category || country || sort !== "none";

	return (
		<main
			className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0,transparent_32%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] text-stone-950">
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Header
					total={total}
					categoryCount={categories.length}
					countryCount={countries.length}
				/>

				<FilterBar
					query={query}
					onQueryChange={setQuery}
					category={category}
					categoryOptions={categoryOptions}
					onCategoryChange={setCategory}
					country={country}
					countryOptions={countryOptions}
					onCountryChange={setCountry}
					sort={sort}
					sortOptions={sortOptions}
					onSortChange={setSort}
				/>

				<div
					className="mb-4 flex items-center justify-between gap-4"
					aria-live="polite"
				>
					<p className="text-sm text-stone-600">
						{isLoading
							? "Loading lots..."
							: `Showing ${lots?.length} of ${total} auction lots`}
					</p>

					{hasFilters && (
						<button
							onClick={clearFilters}
							className="cursor-pointer text-sm font-medium text-amber-800 hover:underline"
						>
							Clear filters
						</button>
					)}
				</div>

				{error && (
					<div
						role="alert"
						className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
					>
						{error}
					</div>
				)}

				{!isLoading && !error && lots.length === 0 && (
					<div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
						No auction lots match your filters.
					</div>
				)}

				<section
					aria-busy={isLoading}
					aria-label="Auction lots"
					className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
				>
					{isLoading
						? Array.from({ length: PAGE_SIZE }, (_, i) => (
							<LotCardSkeleton key={`skeleton-${i}`} />
						))
						: lots.map((lot: Lot, index: number) => (
							<LotCard
								key={lot.id}
								lot={lot}
								onClick={setSelectedLot}
								isPriority={index < 4}
							/>
						))}
				</section>

				<Pagination
					page={page}
					totalPages={totalPages}
					isLoading={isLoading}
					onPageChange={setPage}
				/>
			</section>

			{selectedLot && (
				<LotModal lot={selectedLot} onClose={() => setSelectedLot(null)} />
			)}
		</main>
	);
}