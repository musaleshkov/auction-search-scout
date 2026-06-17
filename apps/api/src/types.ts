export type Lot = {
	id: string;
	title: string;
	description: string;
	category: string;
	country: string;
	country_name: string;
	auction_house: string;
	estimate_low: number;
	estimate_high: number;
	currency: string;
	image_url: string;
};

export type SortOption = "none" | "estimate-asc" | "estimate-desc";

export type LotsQuery = {
	search?: string;
	category?: string;
	country?: string;
	sort: SortOption;
	page: number;
	limit: number;
};

export type LotsResponse = {
	data: Lot[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	filters: {
		categories: string[];
		countries: string[];
	};
};
