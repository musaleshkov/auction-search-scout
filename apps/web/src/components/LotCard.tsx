"use client";

import type { Lot } from "@/src/types/lot";
import { PLACEHOLDER_IMAGE, KEY } from "@/src/lib/constants";
import { formatEstimate } from "@/src/lib/formatEstimate";

type LotCardProps = {
	lot: Lot;
	onClick: (lot: Lot) => void;
};

export function LotCard ({ lot, onClick }: Readonly<LotCardProps>) {
	return (
		<article
			role="button"
			tabIndex={0}
			aria-label={`View details for ${lot.title}`}
			onClick={() => onClick(lot)}
			onKeyDown={(event) => {
				if (event.key === KEY.Enter || event.key === KEY.Space) {
					event.preventDefault();
					onClick(lot);
				}
			}}
			className="flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-700"
		>
			<img
				src={lot.image_url}
				alt={lot.title}
				className="h-56 w-full shrink-0 bg-stone-200 object-cover"
				loading="lazy"
				onError={(event) => {
					event.currentTarget.src = PLACEHOLDER_IMAGE;
				}}
			/>

			<div className="flex flex-1 flex-col p-5">
				<div className="mb-3 flex items-center justify-between gap-3 text-sm text-stone-500">
					<span>{lot.category}</span>
					<span>{lot.country_name}</span>
				</div>

				<h2 className="line-clamp-2 min-h-14 text-lg font-semibold">
					{lot.title}
				</h2>

				<p className="mt-2 line-clamp-1 min-h-5 text-sm text-stone-600">
					{lot.auction_house}
				</p>

				<p className="mt-4 font-semibold text-amber-800">
					{formatEstimate(lot)}
				</p>

				<p className="mt-3 line-clamp-3 min-h-18 text-sm leading-6 text-stone-600">
					{lot.description}
				</p>
			</div>
		</article>
	);
}