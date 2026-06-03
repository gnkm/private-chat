import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MessageComposer } from "./MessageComposer.js";

describe("MessageComposer", () => {
	afterEach(() => {
		cleanup();
	});

	it("does not send on plain Enter (IME conversion)", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();

		render(
			<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
		);

		await user.click(screen.getByLabelText("メッセージ入力"));
		await user.keyboard("{Enter}");

		expect(onSend).not.toHaveBeenCalled();
	});

	it("sends on Ctrl+Enter on non-Mac", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();
		const original = navigator.platform;
		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: "Win32",
		});

		render(
			<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
		);

		await user.click(screen.getByLabelText("メッセージ入力"));
		await user.keyboard("{Control>}{Enter}{/Control}");

		expect(onSend).toHaveBeenCalledTimes(1);

		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: original,
		});
	});

	it("sends on Meta+Enter on Mac", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();
		const original = navigator.platform;
		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: "MacIntel",
		});

		render(
			<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
		);

		await user.click(screen.getByLabelText("メッセージ入力"));
		await user.keyboard("{Meta>}{Enter}{/Meta}");

		expect(onSend).toHaveBeenCalledTimes(1);

		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: original,
		});
	});
});
