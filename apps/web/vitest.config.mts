import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: "jsdom",
		server: {
			deps: {
				inline: ["@barnebys/shared"],
			},
		},
	},
	resolve: {
		alias: {
			react: path.resolve("./node_modules/react"),
			"react-dom": path.resolve("./node_modules/react-dom"),
		},
	},
});
