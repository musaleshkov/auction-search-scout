import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Barnebys Auction Search",
		template: "%s | Barnebys Auction Search",
	},
	description:
		"Search, filter, sort, and explore curated auction lots from international auction houses across art, antiques, jewellery, furniture, and collectibles.",
	keywords: [
		"auction",
		"lots",
		"art",
		"antiques",
		"jewellery",
		"furniture",
		"collectibles",
		"Barnebys",
	],
	openGraph: {
		title: "Barnebys Auction Search",
		description:
			"Discover auction lots across global markets. Search, filter, and sort curated lots from international auction houses.",
		type: "website",
		locale: "en_US",
	},
};

export default function RootLayout ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
		<body className="min-h-full flex flex-col">
		<ErrorBoundary>{children}</ErrorBoundary>
		</body>
		</html>
	);
}
