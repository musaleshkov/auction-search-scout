"use client";

import { useEffect, useRef, useState } from "react";
import { getLots } from "../lib/api";
import type { Lot, SortOption } from "../types/lot";
import { SelectField } from "@/src/components/SelectField";

const PAGE_SIZE = 12;

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
	const [page, setPage] = useState(1);

	const [categories, setCategories] = useState<string[]>([]);
	const [countries, setCountries] = useState<string[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const closeButtonRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadLots () {
			try {
				setIsLoading(true);
				setError("");

				const response = await getLots({
					search: query,
					category,
					country,
					sort,
					page,
					limit: PAGE_SIZE,
				});

				if (!isMounted) return;

				setLots(response.data);
				setCategories(response.filters.categories);
				setCountries(response.filters.countries);
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
	}, [query, category, country, sort, page]);

	useEffect(() => {
		if (!selectedLot) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setSelectedLot(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		setTimeout(() => {
			closeButtonRef.current?.focus();
		}, 0);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedLot]);

	return (
		<main
			className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0,transparent_32%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] text-stone-950">
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<header className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
					<div className="relative px-6 py-8 sm:px-8 lg:px-10">
						<div
							className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-amber-100/70 to-transparent lg:block" />

						<div className="relative max-w-4xl">
							<div className="mb-5 flex flex-wrap items-center gap-3">
        <span
	        className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Barnebys
        </span>

								<span
									className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
          Technical Assessment
        </span>
							</div>

							<h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
								Discover auction lots across global markets
							</h1>

							<p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
								Search, filter, sort, and explore curated lots from international
								auction houses across art, antiques, jewellery, furniture, and
								collectibles.
							</p>

							<div className="mt-7 grid gap-3 sm:grid-cols-3">
								<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
									<p className="text-2xl font-bold text-stone-950">60</p>
									<p className="text-sm text-stone-500">Auction lots</p>
								</div>

								<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
									<p className="text-2xl font-bold text-stone-950">
										{categories.length || "—"}
									</p>
									<p className="text-sm text-stone-500">Categories</p>
								</div>

								<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
									<p className="text-2xl font-bold text-stone-950">
										{countries.length || "—"}
									</p>
									<p className="text-sm text-stone-500">Countries</p>
								</div>
							</div>
						</div>
					</div>
				</header>

				<section
					className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-4">
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setPage(1);
						}}
						placeholder="Search title or description..."
						className="h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-amber-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
					/>

					<SelectField
						label="Category"
						value={category}
						options={[
							{ value: "", label: "All categories" },
							...categories.map((item) => ({
								value: item,
								label: item,
							})),
						]}
						onChange={(value) => {
							setCategory(value);
							setPage(1);
						}}
					/>

					<SelectField
						label="Country"
						value={country}
						options={[
							{ value: "", label: "All countries" },
							...countries.map((item) => ({
								value: item,
								label: item,
							})),
						]}
						onChange={(value) => {
							setCountry(value);
							setPage(1);
						}}
					/>

					<SelectField
						label="Sort"
						value={sort}
						options={[
							{ value: "none", label: "No sorting" },
							{ value: "estimate-asc", label: "Estimate: Low to high" },
							{ value: "estimate-desc", label: "Estimate: High to low" },
						]}
						onChange={(value) => {
							setSort(value as SortOption);
							setPage(1);
						}}
					/>
				</section>

				<div className="mb-4 flex items-center justify-between gap-4">
					<p className="text-sm text-stone-600">
						{isLoading
							? "Loading lots..."
							: `Showing ${lots.length} of ${total} auction lots`}
					</p>

					{(query || category || country || sort !== "none") && (
						<button
							onClick={() => {
								setQuery("");
								setCategory("");
								setCountry("");
								setSort("none");
								setPage(1);
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

				{!isLoading && !error && lots.length === 0 && (
					<div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
						No auction lots match your filters.
					</div>
				)}

				<section
					aria-busy={isLoading}
					className={`grid min-h-[2160px] gap-5 transition-opacity sm:min-h-[1590px] sm:grid-cols-2 lg:min-h-[1075px] lg:grid-cols-3 ${
						isLoading ? "opacity-60" : "opacity-100"
					}`}
				>
					{lots.map((lot) => (
						<article
							key={lot.id}
							role="button"
							tabIndex={0}
							onClick={() => setSelectedLot(lot)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									setSelectedLot(lot);
								}
							}}
							className="flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-700">
							<img
								src={lot.image_url}
								alt={lot.title}
								className="h-56 w-full shrink-0 bg-stone-200 object-cover"
								loading="lazy"
							/>

							<div className="flex flex-1 flex-col p-5">
								<div className="mb-3 flex items-center justify-between gap-3 text-sm text-stone-500">
									<span>{lot.category}</span>
									<span>{lot.country}</span>
								</div>

								<h2 className="line-clamp-2 min-h-[56px] text-lg font-semibold">
									{lot.title}
								</h2>

								<p className="mt-2 line-clamp-1 min-h-[20px] text-sm text-stone-600">
									{lot.auction_house}
								</p>

								<p className="mt-4 font-semibold text-amber-800">
									{formatEstimate(lot)}
								</p>

								<p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-stone-600">
									{lot.description}
								</p>

							</div>
						</article>
					))}
				</section>

				{!error && totalPages > 1 && (
					<div className="mt-8 flex items-center justify-center gap-4">
						<button
							type="button"
							disabled={isLoading || page === 1}
							onClick={() =>
								setPage((currentPage) => Math.max(1, currentPage - 1))
							}
							className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
						>
							Previous
						</button>

						<span className="text-sm text-stone-600">
      Page {page} of {totalPages}
    </span>

						<button
							type="button"
							disabled={isLoading || page === totalPages}
							onClick={() =>
								setPage((currentPage) => Math.min(totalPages, currentPage + 1))
							}
							className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
						>
							Next
						</button>
					</div>
				)}
			</section>

			{selectedLot && (
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby="lot-modal-title"
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

							<h2 id="lot-modal-title" className="text-2xl font-bold">
								{selectedLot.title}
							</h2>

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
								ref={closeButtonRef}
								onClick={() => setSelectedLot(null)}
								className="cursor-pointer mt-6 rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
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