import { describe, expect, it } from "vitest";
import { buildLotsResponse } from "./lots.service.js";
import type { Lot } from "./types.js";

const lots: Lot[] = [
	{
		id: "lot_001",
		title: "18th Century Oak Writing Desk",
		description: "A preserved writing desk",
		category: "Furniture",
		country: "SE",
		auction_house: "Stockholms Auktionsverk",
		estimate_low: 4500,
		estimate_high: 6000,
		currency: "SEK",
		image_url: "https://example.com/desk.jpg",
	},
	{
		id: "lot_002",
		title: "Diamond Ring",
		description: "Fine jewellery item",
		category: "Jewellery",
		country: "UK",
		auction_house: "London Auctions",
		estimate_low: 2000,
		estimate_high: 3000,
		currency: "GBP",
		image_url: "https://example.com/ring.jpg",
	},
	{
		id: "lot_003",
		title: "Modern Painting",
		description: "Abstract art piece",
		category: "Art",
		country: "FR",
		auction_house: "Paris Auctions",
		estimate_low: 8000,
		estimate_high: 12000,
		currency: "EUR",
		image_url: "https://example.com/painting.jpg",
	},
];

describe("buildLotsResponse", () => {
	it("filters lots by search query", () => {
		const response = buildLotsResponse(lots, {
			search: "desk",
			category: undefined,
			country: undefined,
			sort: "none",
			page: 1,
			limit: 12,
		});

		expect(response.data).toHaveLength(1);
		expect(response.data[0].id).toBe("lot_001");
	});

	it("filters lots by category and country", () => {
		const response = buildLotsResponse(lots, {
			search: undefined,
			category: "Jewellery",
			country: "UK",
			sort: "none",
			page: 1,
			limit: 12,
		});

		expect(response.data).toHaveLength(1);
		expect(response.data[0].id).toBe("lot_002");
	});

	it("sorts lots by estimate high descending", () => {
		const response = buildLotsResponse(lots, {
			search: undefined,
			category: undefined,
			country: undefined,
			sort: "estimate-desc",
			page: 1,
			limit: 12,
		});

		expect(response.data[0].id).toBe("lot_003");
	});

	it("paginates lots", () => {
		const response = buildLotsResponse(lots, {
			search: undefined,
			category: undefined,
			country: undefined,
			sort: "none",
			page: 2,
			limit: 2,
		});

		expect(response.data).toHaveLength(1);
		expect(response.meta.page).toBe(2);
		expect(response.meta.totalPages).toBe(2);
		expect(response.meta.hasPreviousPage).toBe(true);
		expect(response.meta.hasNextPage).toBe(false);
	});
});