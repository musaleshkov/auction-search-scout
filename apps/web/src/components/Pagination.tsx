type PaginationProps = {
	page: number;
	totalPages: number;
	isLoading: boolean;
	onPageChange: (page: number) => void;
};

export function Pagination ({
	page,
	totalPages,
	isLoading,
	onPageChange,
}: Readonly<PaginationProps>) {
	if (totalPages <= 1) return null;

	return (
		<nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
			<button
				type="button"
				disabled={isLoading || page === 1}
				onClick={() => onPageChange(Math.max(1, page - 1))}
				className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
			>
				Previous
			</button>

			<span className="text-sm text-stone-600" aria-live="polite">
        Page {page} of {totalPages}
      </span>

			<button
				type="button"
				disabled={isLoading || page === totalPages}
				onClick={() => onPageChange(Math.min(totalPages, page + 1))}
				className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
			>
				Next
			</button>
		</nav>
	);
}