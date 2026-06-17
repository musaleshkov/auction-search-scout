import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildLotsResponse } from "./lots.service.js";
import type { Lot, SortOption } from "./types.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
	}),
);

app.use(express.json());

function loadLots (): Lot[] {
	const filePath = path.join(__dirname, "../data/lots.json");
	const json = fs.readFileSync(filePath, "utf-8");

	const data = JSON.parse(json) as Lot[] | { lots: Lot[] };

	if (Array.isArray(data)) {
		return data;
	}

	if ("lots" in data && Array.isArray(data.lots)) {
		return data.lots;
	}

	return [];
}

function getString (value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber (value: unknown, fallback: number): number {
	if (typeof value !== "string") {
		return fallback;
	}

	const parsed = Number(value);

	return Number.isFinite(parsed) ? parsed : fallback;
}

function getSortOption (value: unknown): SortOption {
	if (
		value === "estimate-asc" ||
		value === "estimate-desc" ||
		value === "none"
	) {
		return value;
	}

	return "none";
}

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.get("/lots", (req, res) => {
	const lots = loadLots();

	const response = buildLotsResponse(lots, {
		search: getString(req.query.search),
		category: getString(req.query.category),
		country: getString(req.query.country),
		sort: getSortOption(req.query.sort),
		page: getNumber(req.query.page, 1),
		limit: getNumber(req.query.limit, 12),
	});

	res.json(response);
});

app.get("/lots/:id", (req, res) => {
	const lots = loadLots();
	const lot = lots.find((item) => item.id === req.params.id);

	if (!lot) {
		return res.status(404).json({ message: "Lot not found" });
	}

	return res.json(lot);
});

app.listen(port, () => {
	console.log(`API running on http://localhost:${port}`);
});