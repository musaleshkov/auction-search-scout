import type { Lot } from "../types/lot";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type LotsApiResponse = Lot[] | { lots: Lot[] };

export async function getLots(): Promise<Lot[]> {
	const response = await fetch(`${API_BASE_URL}/lots`);

	if (!response.ok) {
		throw new Error("Failed to fetch lots");
	}

	const data = (await response.json()) as LotsApiResponse;

	if (Array.isArray(data)) {
		return data;
	}

	if ("lots" in data && Array.isArray(data.lots)) {
		return data.lots;
	}

	return [];
}