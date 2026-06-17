import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { buildLotsResponse, getCountryName } from "./lots.service.js";
import type { Lot } from "./types.js";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 4000;

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
	}),
);

app.use(express.json());

// Rate limiting — 100 requests per 15-second window per IP
app.use(
	rateLimit({
		windowMs: 15_000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
		message: { error: "Too many requests, please try again later." },
	}),
);

// Load lots asynchronously at startup — avoids blocking the event loop
// Freeze prevents accidental mutation of the in-memory cache
let cachedLots: readonly Lot[] = [];

async function loadLotsAtStartup (): Promise<void> {
	const dataPath: string =
		process.env.LOTS_DATA_PATH || path.resolve(__dirname, "../data/lots.json");

	try {
		const json: string = await fs.readFile(dataPath, "utf-8");
		const data = JSON.parse(json) as Lot[] | { lots: Lot[] };

		let raw: Lot[] = [];
		if (Array.isArray(data)) {
			raw = data;
		} else if ("lots" in data && Array.isArray(data.lots)) {
			raw = data.lots;
		}

		cachedLots = Object.freeze(raw) as readonly Lot[];
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Failed to load lots data from "${dataPath}": ${message}`);
		throw err;
	}
}

// Zod schema for query validation
const ListLotsQuerySchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
	country: z.string().optional(),
	sort: z.enum(["none", "estimate-asc", "estimate-desc"]).default("none"),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(60).default(12),
});

// Health check
app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

// List lots with search, filter, sort, pagination
app.get("/lots", (req, res) => {
	const parsed = ListLotsQuerySchema.safeParse(req.query);

	if (!parsed.success) {
		return res.status(400).json({
			error: "Invalid query parameters",
			details: parsed.error.flatten().fieldErrors,
		});
	}

	const query = parsed.data;
	const lots = cachedLots;
	const response = buildLotsResponse(lots, query);

	// Cache for 30 seconds on CDN / browser (stale-while-revalidate for 5 minutes)
	res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
	res.json(response);
});

// Single lot by ID
app.get("/lots/:id", (req, res) => {
	const lot: Lot | undefined = cachedLots.find((item) => item.id === req.params.id);

	if (!lot) {
		return res.status(404).json({ error: "Lot not found" });
	}

	res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
	res.json({
		...lot,
		country_name: getCountryName(lot.country),
	});
});

// Global error handler
app.use(
	(
		err: Error,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		console.error("Unhandled error:", err.message);
		res.status(500).json({ error: "Internal server error" });
	},
);

let server: ReturnType<typeof app.listen> | null = null;

async function start (): Promise<void> {
	await loadLotsAtStartup();
	console.log(`Loaded ${cachedLots.length} auction lots`);
	server = app.listen(port, () => {
		console.log(`API running on http://localhost:${port}`);
	});
}

function gracefulShutdown (signal: string) {
	console.log(`\nReceived ${signal}, shutting down gracefully...`);
	if (server) {
		server.close(() => {
			console.log("Server closed.");
			process.exit(0);
		});
		setTimeout(() => {
			console.error("Forced shutdown after timeout.");
			process.exit(1);
		}, 10_000);
	} else {
		process.exit(0);
	}
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
