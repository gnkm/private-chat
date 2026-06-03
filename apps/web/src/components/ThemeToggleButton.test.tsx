import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { COLOR_SCHEME_STORAGE_KEY } from "../lib/color-scheme.js";
import { ThemeToggleButton } from "./ThemeToggleButton.js";

describe("ThemeToggleButton", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove("dark");
	});

	afterEach(() => {
		cleanup();
		localStorage.clear();
		document.documentElement.classList.remove("dark");
	});

	it("toggles between light and dark and persists preference", async () => {
		const user = userEvent.setup();
		render(<ThemeToggleButton />);

		const button = screen.getByRole("button", {
			name: "ダークモードに切り替え",
		});
		await user.click(button);

		expect(
			screen.getByRole("button", { name: "ライトモードに切り替え" }),
		).toBeInTheDocument();
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("dark");

		await user.click(
			screen.getByRole("button", { name: "ライトモードに切り替え" }),
		);

		expect(
			screen.getByRole("button", { name: "ダークモードに切り替え" }),
		).toBeInTheDocument();
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe("light");
	});
});
