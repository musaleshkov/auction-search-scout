"use client";

import { useState } from "react";
import Image from "next/image";
import type { Lot } from "@/src/types/lot";
import { PLACEHOLDER_IMAGE, KEY } from "@/src/lib/constants";
import { formatEstimate } from "@/src/lib/formatEstimate";

type LotCardProps = {
	lot: Lot;
	onClick: (lot: Lot) => void;
	isPriority?: boolean;
};

export function LotCard ({ lot, onClick, isPriority = false }: Readonly<LotCardProps>) {
	const IMAGE_WIDTH = 600;
	const [imgError, setImgError] = useState(false);

	const imageSrc = imgError ? PLACEHOLDER_IMAGE : lot.image_url;

	return (
		<article
			className="flex h-130 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm"
		>
			<button
				type="button"
				className="flex h-full flex-col text-left cursor-pointer transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-700"
				onClick={() => onClick(lot)}
				onKeyDown={(event) => {
					if (event.key === KEY.Enter || event.key === KEY.Space) {
						event.preventDefault();
						onClick(lot);
					}
				}}
			>
				<div className="relative h-56 w-full shrink-0 bg-stone-200">
					<Image
						src={imageSrc}
						alt={lot.title}
						fill
						sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${IMAGE_WIDTH}px`}
						className="object-cover"
						priority={isPriority}
						loading={isPriority ? undefined : "lazy"}
						onError={() => setImgError(true)}
					/>
				</div>

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
			</button>
		</article>
	);
}
