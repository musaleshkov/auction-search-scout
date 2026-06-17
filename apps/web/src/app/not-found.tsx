import Link from "next/link";

export default function NotFound () {
	return (
		<main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
			<div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
				<div className="mb-4 text-5xl">🔍</div>
				<h1 className="text-2xl font-bold text-stone-900">Page not found</h1>
				<p className="mt-2 text-sm leading-6 text-stone-600">
					The page you are looking for does not exist or has been moved.
				</p>
				<Link
					href="/"
					className="mt-6 inline-block rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
				>
					Go back home
				</Link>
			</div>
		</main>
	);
}