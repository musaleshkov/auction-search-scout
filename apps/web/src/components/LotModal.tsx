"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Lot } from "@/src/types/lot";
import { PLACEHOLDER_IMAGE, KEY } from "@/src/lib/constants";
import { formatEstimate } from "@/src/lib/formatEstimate";

type LotModalProps = {
	lot: Lot;
	onClose: () => void;
};

export function LotModal ({ lot, onClose }: Readonly<LotModalProps>) {
	const modalRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	useEffect(() => {
		const previousOverflow: string = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		// Focus the close button when modal opens
		setTimeout(() => {
			closeButtonRef.current?.focus();
		}, 0);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === KEY.Escape) {
				onClose();
				return;
			}

			// Focus trapping
			if (event.key === KEY.Tab && modalRef.current) {
				const focusable = modalRef.current.querySelectorAll<HTMLElement>(
					"button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])",
				);
				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (event.shiftKey) {
					if (document.activeElement === first) {
						event.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						event.preventDefault();
						first.focus();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	const imageSrc = imageError ? PLACEHOLDER_IMAGE : lot.image_url;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="lot-modal-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="relative h-72 w-full bg-stone-200">
					{!imageLoaded && !imageError && (
						<div className="absolute inset-0 animate-pulse bg-stone-300" />
					)}
					<Image
						src={imageSrc}
						alt={lot.title}
						fill
						sizes="(max-width: 672px) 100vw, 672px"
						className="object-cover"
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageError(true)}
					/>
				</div>
				<div className="p-6">
					<div className="mb-3 flex items-center justify-between text-sm text-stone-500">
						<span>{lot.category}</span>
						<span>{lot.country_name}</span>
					</div>

					<h2 id="lot-modal-title" className="text-2xl font-bold">
						{lot.title}
					</h2>

					<p className="mt-2 font-medium text-stone-700">
						{lot.auction_house}
					</p>

					<p className="mt-4 text-lg font-semibold text-amber-800">
						{formatEstimate(lot)}
					</p>

					<p className="mt-4 leading-7 text-stone-700">
						{lot.description}
					</p>

					<button
						ref={closeButtonRef}
						onClick={onClose}
						className="cursor-pointer mt-6 rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
