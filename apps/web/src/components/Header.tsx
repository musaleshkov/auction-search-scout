type HeaderProps = {
	total: number;
	categoryCount: number;
	countryCount: number;
};

export function Header ({ total, categoryCount, countryCount }: Readonly<HeaderProps>) {
	return (
		<header className="mb-8 overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
			<div className="relative px-6 py-8 sm:px-8 lg:px-10">
				<div
					className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-amber-100/70 to-transparent lg:block" />

				<div className="relative max-w-4xl">
					<div className="mb-5 flex flex-wrap items-center gap-3">
            <span
	            className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Auction Scout
            </span>
						<span
							className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Auction Discovery
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

					<dl className="mt-7 grid gap-3 sm:grid-cols-3">
						<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
							<dt className="text-2xl font-bold text-stone-950">
								{total || "—"}
							</dt>
							<dd className="text-sm text-stone-500">Auction lots</dd>
						</div>

						<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
							<dt className="text-2xl font-bold text-stone-950">
								{categoryCount || "—"}
							</dt>
							<dd className="text-sm text-stone-500">Categories</dd>
						</div>

						<div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
							<dt className="text-2xl font-bold text-stone-950">
								{countryCount || "—"}
							</dt>
							<dd className="text-sm text-stone-500">Countries</dd>
						</div>
					</dl>
				</div>
			</div>
		</header>
	);
}