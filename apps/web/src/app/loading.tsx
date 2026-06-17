import { LotCardSkeleton } from "@/src/components/LotCardSkeleton";
import { PAGE_SIZE } from "@/src/lib/constants";

export default function Loading () {
	return (
		<main
			className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0,transparent_32%),linear-gradient(to_bottom,#fafaf9,#f5f5f4)] text-stone-950">
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Skeleton header */}
				<header className="mb-8 overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
					<div className="relative px-6 py-8 sm:px-8 lg:px-10">
						<div className="mb-5 flex gap-3">
							<div className="h-8 w-24 animate-pulse rounded-full bg-stone-200" />
							<div className="h-8 w-40 animate-pulse rounded-full bg-stone-200" />
						</div>
						<div className="h-14 w-3/4 animate-pulse rounded bg-stone-200" />
						<div className="mt-5 h-6 w-2/3 animate-pulse rounded bg-stone-200" />
						<div className="mt-7 grid gap-3 sm:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
									<div className="h-8 w-12 animate-pulse rounded bg-stone-200" />
									<div className="mt-1 h-4 w-20 animate-pulse rounded bg-stone-200" />
								</div>
							))}
						</div>
					</div>
				</header>

				{/* Skeleton filter bar */}
				<div className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white/90 p-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-12 animate-pulse rounded-xl bg-stone-200" />
					))}
				</div>

				<section aria-label="Auction lots" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: PAGE_SIZE }, (_, i) => (
						<LotCardSkeleton key={`skeleton-${i}`} />
					))}
				</section>
			</section>
		</main>
	);
}