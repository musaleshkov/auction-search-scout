import type { LotsResponse, SortOption } from "../types/lot";

const API_BASE_URL: string =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const REQUEST_TIMEOUT_MS = 15_000;

type GetLotsParams = {
	search?: string;
	category?: string;
	country?: string;
	sort?: SortOption;
	page?: number;
	limit?: number;
};

type ApiErrorResponse = {
	error: string;
	details?: Record<string, string[]>;
};

export async function getLots (params: GetLotsParams = {}): Promise<LotsResponse> {
	const url = new URL(`${API_BASE_URL}/lots`);

	if (params.search) url.searchParams.set("search", params.search);
	if (params.category) url.searchParams.set("category", params.category);
	if (params.country) url.searchParams.set("country", params.country);
	if (params.sort && params.sort !== "none") url.searchParams.set("sort", params.sort);
	if (params.page) url.searchParams.set("page", String(params.page));
	if (params.limit) url.searchParams.set("limit", String(params.limit));

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(url.toString(), {
			signal: controller.signal,
		});

		if (!response.ok) {
			const body: ApiErrorResponse = await response.json().catch(() => ({
				error: "Unknown error",
			}));

			throw new Error(body.error || `Request failed with status ${response.status}`);
		}

		return response.json();
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			throw new Error("Request timed out. Please try again.");
		}
		throw err;
	} finally {
		clearTimeout(timeoutId);
	}
}
