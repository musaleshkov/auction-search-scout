"use client";

import { useEffect, useMemo, useState } from "react";
import { filterLots, type SortOption } from "../lib/filterLots";
import { getLots } from "../lib/api";
import type { Lot } from "../types/lot";

function formatEstimate (lot: Lot): string {
	return `${lot.currency} ${lot.estimate_low.toLocaleString()} – ${lot.estimate_high.toLocaleString()}`;
}

export default function Home () {
	const [lots, setLots] = useState<Lot[]>([]);
	const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("");
	const [country, setCountry] = useState("");
	const [sort, setSort] = useState<SortOption>("none");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadLots () {
			try {
				const data = await getLots();
				setLots(data);
			} catch {
				setError("Failed to load auction lots.");
			} finally {
				setIsLoading(false);
			}
		}

		loadLots();
	}, []);

	const categories = useMemo(() => {
		return Array.from(new Set(lots.map((lot) => lot.category))).sort();
	}, [lots]);

	const countries = useMemo(() => {
		return Array.from(new Set(lots.map((lot) => lot.country))).sort();
	}, [lots]);

	const filteredLots = useMemo(() => {
		return filterLots({
			lots,
			query,
			category,
			country,
			sort,
		});
	}, [lots, query, category, country, sort]);

	return (
		<main className="min-h-screen bg-stone-50 text-stone-950">
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<header className="mb-8">
					<p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
						Barnebys Technical Assessment
					</p>
					<h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
						Auction Lot Search
					</h1>
					<p className="mt-4 max-w-2xl text-stone-600">
						Browse, search, filter, and sort auction lots from multiple
						categories and country editions.
					</p>
				</header>

				<section className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-4">
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search title or description..."
						className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700 md:col-span-1"
					/>

					<select
						value={category}
						onChange={(event) => setCategory(event.target.value)}
						className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
					>
						<option value="">All categories</option>
						{categories.map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>

					<select
						value={country}
						onChange={(event) => setCountry(event.target.value)}
						className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
					>
						<option value="">All countries</option>
						{countries.map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>

					<select
						value={sort}
						onChange={(event) => setSort(event.target.value as SortOption)}
						className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
					>
						<option value="none">No sorting</option>
						<option value="estimate-asc">Estimate: Low to high</option>
						<option value="estimate-desc">Estimate: High to low</option>
					</select>
				</section>

				<div className="mb-4 flex items-center justify-between">
					<p className="text-sm text-stone-600">
						{isLoading
							? "Loading lots..."
							: <p className="text-sm text-stone-600">
								Showing {filteredLots.length} of {lots.length} auction lots
							</p>}
					</p>

					{(query || category || country || sort !== "none") && (
						<button
							onClick={() => {
								setQuery("");
								setCategory("");
								setCountry("");
								setSort("none");
							}}
							className="text-sm font-medium text-amber-800 hover:underline"
						>
							Clear filters
						</button>
					)}
				</div>

				{error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
						{error}
					</div>
				)}

				{!isLoading && !error && filteredLots.length === 0 && (
					<div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
						No auction lots match your filters.
					</div>
				)}

				<section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredLots.map((lot) => (
						<article
							key={lot.id}
							onClick={() => setSelectedLot(lot)}
							className="cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
						>
							<img
								src={lot.image_url}
								alt={lot.title}
								className="h-56 w-full bg-stone-200 object-cover"
								loading="lazy"
							/>

							<div className="p-5">
								<div className="mb-3 flex items-center justify-between gap-3 text-sm text-stone-500">
									<span>{lot.category}</span>
									<span>{lot.country}</span>
								</div>

								<h2 className="line-clamp-2 text-lg font-semibold">
									{lot.title}
								</h2>

								<p className="mt-2 text-sm text-stone-600">
									{lot.auction_house}
								</p>

								<p className="mt-4 font-semibold text-amber-800">
									{formatEstimate(lot)}
								</p>

								<p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
									{lot.description}
								</p>
							</div>
						</article>
					))}
				</section>
			</section>

			{selectedLot && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					onClick={() => setSelectedLot(null)}
				>
					<div
						className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<img
							src={selectedLot.image_url}
							alt={selectedLot.title}
							className="h-72 w-full object-cover"
						/>

						<div className="p-6">
							<div className="mb-3 flex items-center justify-between text-sm text-stone-500">
								<span>{selectedLot.category}</span>
								<span>{selectedLot.country}</span>
							</div>

							<h2 className="text-2xl font-bold">{selectedLot.title}</h2>

							<p className="mt-2 font-medium text-stone-700">
								{selectedLot.auction_house}
							</p>

							<p className="mt-4 text-lg font-semibold text-amber-800">
								{formatEstimate(selectedLot)}
							</p>

							<p className="mt-4 leading-7 text-stone-700">
								{selectedLot.description}
							</p>

							<button
								onClick={() => setSelectedLot(null)}
								className="mt-6 rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}