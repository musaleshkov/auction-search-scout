export function LotCardSkeleton () {
	return (
		<div
			aria-hidden="true"
			className="flex h-130 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
		>
			<div className="h-56 w-full animate-pulse bg-stone-200" />
			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex justify-between gap-3">
					<div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
					<div className="h-4 w-10 animate-pulse rounded bg-stone-200" />
				</div>
				<div className="h-14 animate-pulse rounded bg-stone-200" />
				<div className="h-5 w-36 animate-pulse rounded bg-stone-200" />
				<div className="h-6 w-32 animate-pulse rounded bg-stone-200" />
				<div className="h-18 animate-pulse rounded bg-stone-200" />
			</div>
		</div>
	);
}