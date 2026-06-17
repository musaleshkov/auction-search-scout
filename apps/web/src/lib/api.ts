import type { LotsResponse, SortOption } from "../types/lot";

const API_BASE_URL: string =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type GetLotsParams = {
	search?: string;
	category?: string;
	country?: string;
	sort?: SortOption;
	page?: number;
	limit?: number;
};

export async function getLots (params: GetLotsParams = {}): Promise<LotsResponse> {
	const url = new URL(`${API_BASE_URL}/lots`);

	if (params.search) url.searchParams.set("search", params.search);
	if (params.category) url.searchParams.set("category", params.category);
	if (params.country) url.searchParams.set("country", params.country);
	if (params.sort && params.sort !== "none") url.searchParams.set("sort", params.sort);
	if (params.page) url.searchParams.set("page", String(params.page));
	if (params.limit) url.searchParams.set("limit", String(params.limit));

	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error("Failed to fetch lots");
	}

	return response.json();
}