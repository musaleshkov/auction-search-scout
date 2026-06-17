"use client";

import type { SortOption } from "@/src/types/lot";
import { SelectField } from "@/src/components/SelectField";
import { ChangeEvent } from "react";

type Option = { value: string; label: string };

type FilterBarProps = {
	query: string;
	onQueryChange: (value: string) => void;
	category: string;
	categoryOptions: Option[];
	onCategoryChange: (value: string) => void;
	country: string;
	countryOptions: Option[];
	onCountryChange: (value: string) => void;
	sort: SortOption;
	sortOptions: Option[];
	onSortChange: (value: SortOption) => void;
};

export function FilterBar ({
	query,
	onQueryChange,
	category,
	categoryOptions,
	onCategoryChange,
	country,
	countryOptions,
	onCountryChange,
	sort,
	sortOptions,
	onSortChange,
}: Readonly<FilterBarProps>) {
	return (
		<section
			aria-label="Search and filter"
			className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-4"
		>
			<input
				value={query}
				onChange={(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
					onQueryChange(event.target.value);
				}}
				placeholder="Search title or description..."
				className="h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-amber-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
			/>

			<SelectField
				label="Category"
				value={category}
				options={categoryOptions}
				onChange={onCategoryChange}
			/>

			<SelectField
				label="Country"
				value={country}
				options={countryOptions}
				onChange={onCountryChange}
			/>

			<SelectField
				label="Sort"
				value={sort}
				options={sortOptions}
				onChange={(value: string) => {
					onSortChange(value as SortOption);
				}}
			/>
		</section>
	);
}