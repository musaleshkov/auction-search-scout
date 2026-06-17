import { describe, expect, it } from "vitest";
import { filterLots } from "./filterLots";
import type { Lot } from "../types/lot";

const lots: Lot[] = [
	{
		id: "lot_001",
		title: "18th Century Oak Writing Desk",
		description: "A beautifully preserved writing desk",
		category: "Furniture",
		country: "SE",
		auction_house: "Stockholms Auktionsverk",
		estimate_low: 4500,
		estimate_high: 6000,
		currency: "SEK",
		image_url: "https://example.com/image.jpg"
	},
	{
		id: "lot_002",
		title: "Diamond Ring",
		description: "A fine jewellery lot",
		category: "Jewellery",
		country: "UK",
		auction_house: "London Auctions",
		estimate_low: 2000,
		estimate_high: 3000,
		currency: "GBP",
		image_url: "https://example.com/image.jpg"
	}
];

describe("filterLots", () => {
	it("filters by title, category, and country", () => {
		const result = filterLots({
			lots,
			query: "desk",
			category: "Furniture",
			country: "SE",
			sort: "none"
		});

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("lot_001");
	});

	it("sorts by estimate low to high", () => {
		const result = filterLots({
			lots,
			query: "",
			category: "",
			country: "",
			sort: "estimate-asc"
		});

		expect(result[0].id).toBe("lot_002");
	});
});