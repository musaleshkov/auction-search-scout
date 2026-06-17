import type { Lot } from "@/src/types/lot";

export function formatEstimate (lot: Lot): string {
	return `${lot.currency} ${lot.estimate_low.toLocaleString()} – ${lot.estimate_high.toLocaleString()}`;
}