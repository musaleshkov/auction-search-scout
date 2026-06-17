export const PAGE_SIZE: number = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 12;

export const PLACEHOLDER_IMAGE =
	"https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop";

export const KEY = {
	Enter: "Enter",
	Space: " ",
	Escape: "Escape",
	Tab: "Tab",
} as const;

export const COUNTRY_NAMES: Record<string, string> = {
	SE: "Sweden",
	UK: "United Kingdom",
	FR: "France",
	DE: "Germany",
	US: "United States",
	IT: "Italy",
	ES: "Spain",
	BE: "Belgium",
};
