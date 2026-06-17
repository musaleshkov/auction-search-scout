import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLotSearch } from "./useLotSearch";

// Mock the API module
const mockGetLots = vi.fn();

vi.mock("@/src/lib/api", () => ({
	getLots: (...args: unknown[]) => mockGetLots(...args),
}));

const mockResponse = {
	data: [
		{
			id: "lot_001",
			title: "Test Lot",
			description: "A test lot",
			category: "Furniture",
			country: "SE",
			country_name: "Sweden",
			auction_house: "Test House",
			estimate_low: 1000,
			estimate_high: 2000,
			currency: "SEK",
			image_url: "https://example.com/test.jpg",
		},
	],
	meta: {
		total: 1,
		page: 1,
		limit: 12,
		totalPages: 1,
		hasNextPage: false,
		hasPreviousPage: false,
	},
	filters: {
		categories: ["Furniture"],
		countries: ["SE"],
	},
};

describe("useLotSearch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetLots.mockResolvedValue(mockResponse);
	});

	it("returns initial loading state", () => {
		const { result } = renderHook(() => useLotSearch());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.lots).toHaveLength(0);
		expect(result.current.error).toBe("");
	});

	it("loads lots on mount", async () => {
		const { result } = renderHook(() => useLotSearch());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(mockGetLots).toHaveBeenCalledWith({
			search: "",
			category: "",
			country: "",
			sort: "none",
			page: 1,
			limit: 12,
		});

		expect(result.current.lots).toHaveLength(1);
		expect(result.current.lots[0].id).toBe("lot_001");
		expect(result.current.categories).toEqual(["Furniture"]);
		expect(result.current.countries).toEqual(["SE"]);
		expect(result.current.total).toBe(1);
		expect(result.current.totalPages).toBe(1);
	});

	it("handles API error", async () => {
		mockGetLots.mockRejectedValue(new Error("Network error"));

		const { result } = renderHook(() => useLotSearch());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBe("Failed to load auction lots.");
		expect(result.current.lots).toHaveLength(0);
	});

	it("clearFilters resets all filters", async () => {
		const { result } = renderHook(() => useLotSearch());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		// Change filters
		result.current.setQuery("test");
		result.current.setCategory("Art");
		result.current.setCountry("FR");
		result.current.setSort("estimate-asc");
		result.current.setPage(2);

		// Clear
		result.current.clearFilters();

		expect(result.current.query).toBe("");
		expect(result.current.category).toBe("");
		expect(result.current.country).toBe("");
		expect(result.current.sort).toBe("none");
		expect(result.current.page).toBe(1);
	});

	it("resets page when filters change", async () => {
		const { result } = renderHook(() => useLotSearch());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		result.current.setPage(3);

		// Changing category resets page
		result.current.setCategory("Art");

		expect(result.current.page).toBe(1);
	});
});