"use client";

type ErrorPageProps = {
	error: Error;
	reset: () => void;
};

export default function ErrorPage ({ error, reset }: Readonly<ErrorPageProps>) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
			<div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
				<div className="mb-4 text-5xl">⚠️</div>
				<h1 className="text-2xl font-bold text-stone-900">Something went wrong</h1>
				<p className="mt-2 text-sm leading-6 text-stone-600">
					{error.message || "An unexpected error occurred."}
				</p>
				<button
					type="button"
					onClick={reset}
					className="mt-6 cursor-pointer rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
				>
					Try again
				</button>
			</div>
		</main>
	);
}