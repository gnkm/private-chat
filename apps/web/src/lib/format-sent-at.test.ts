import { describe, expect, it } from "vitest";

import { formatSentAt } from "./format-sent-at.js";

const ISO_SAMPLE = "2026-04-18T12:00:00.000Z";

function expectedLocalFormat(iso: string): string {
	const date = new Date(iso);
	const pad2 = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

describe("formatSentAt", () => {
	it("formats valid ISO as yyyy-mm-dd hh:mm:ss in local time", () => {
		expect(formatSentAt(ISO_SAMPLE)).toBe(expectedLocalFormat(ISO_SAMPLE));
		expect(formatSentAt(ISO_SAMPLE)).toMatch(
			/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
		);
	});

	it("returns original string when date is invalid", () => {
		expect(formatSentAt("not-a-date")).toBe("not-a-date");
	});
});
