import type { Lot } from "@/src/types/lot";

export function formatEstimate (lot: Lot): string {
	const low = lot.estimate_low.toLocaleString();
	const high = lot.estimate_high.toLocaleString();

	if (lot.estimate_low === lot.estimate_high) {
		return `${lot.currency} ${low}`;
	}

	return `${lot.currency} ${low} – ${high}`;
}
