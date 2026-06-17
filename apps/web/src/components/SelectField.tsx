"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
	value: string;
	label: string;
};

type SelectFieldProps = {
	label: string;
	value: string;
	options: SelectOption[];
	onChange: (value: string) => void;
	disabled?: boolean;
};

export function SelectField ({
	label,
	value,
	options,
	onChange,
	disabled = false,
}: SelectFieldProps) {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const listboxId = useId();

	const selectedOption =
		options.find((option) => option.value === value) ?? options[0];

	useEffect(() => {
		function handleClickOutside (event: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown (event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<div ref={wrapperRef} className="relative">
			<span className="sr-only">{label}</span>

			<button
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={listboxId}
				onClick={() => setIsOpen((current) => !current)}
				className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 text-left text-sm font-medium text-stone-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/40 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<span className="truncate">{selectedOption?.label}</span>

				<svg
					className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{isOpen && (
				<div
					id={listboxId}
					role="listbox"
					className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-72 w-full overflow-y-auto rounded-2xl border border-stone-200 bg-white p-1 shadow-xl ring-1 ring-black/5"
				>
					{options.map((option) => {
						const isSelected = option.value === value;

						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
								className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
									isSelected
										? "bg-stone-950 font-semibold text-white"
										: "text-stone-700 hover:bg-amber-50 hover:text-amber-900"
								}`}
							>
								<span className="truncate">{option.label}</span>

								{isSelected && (
									<span className="ml-3 text-xs text-white/80">Selected</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}