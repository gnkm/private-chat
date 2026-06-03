import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DISPLAY_NAME_EMPTY_HINT } from "../lib/display-name-validation.js";
import { DisplayNameField } from "./DisplayNameField.js";

describe("DisplayNameField", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows hint when display name is blank", () => {
		render(<DisplayNameField value="" onChange={vi.fn()} />);

		expect(screen.getByText(DISPLAY_NAME_EMPTY_HINT)).toBeInTheDocument();
	});

	it("hides hint when display name has content", () => {
		render(<DisplayNameField value="Alice" onChange={vi.fn()} />);

		expect(screen.queryByText(DISPLAY_NAME_EMPTY_HINT)).not.toBeInTheDocument();
	});

	it("shows hint when display name is whitespace only", () => {
		render(<DisplayNameField value="   " onChange={vi.fn()} />);

		expect(screen.getByText(DISPLAY_NAME_EMPTY_HINT)).toBeInTheDocument();
	});
});
