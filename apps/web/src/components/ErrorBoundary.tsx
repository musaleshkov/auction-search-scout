"use client";

import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor (props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError (error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render () {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;

			return (
				<main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
					<div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
						<div className="mb-4 text-4xl">⚠</div>
						<h2 className="text-xl font-bold text-stone-900">
							Something went wrong
						</h2>
						<p className="mt-2 text-sm leading-6 text-stone-600">
							{this.state.error?.message ??
								"An unexpected error occurred. Please try again."}
						</p>
						<button
							type="button"
							onClick={this.handleReset}
							className="mt-6 cursor-pointer rounded-xl bg-stone-950 px-5 py-3 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
						>
							Try again
						</button>
					</div>
				</main>
			);
		}

		return this.props.children;
	}
}