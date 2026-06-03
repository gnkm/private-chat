import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MESSAGE_BODY_MAX_CODE_POINTS } from "@private-chat/shared";

import { withNavigatorPlatform } from "../test/stub-navigator-platform.js";
import { MessageComposer } from "./MessageComposer.js";

describe("MessageComposer", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows message body code point counter (SRS-FUNC-007)", () => {
		render(
			<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={vi.fn()} />,
		);

		expect(screen.getByText("5 / 12,000")).toBeInTheDocument();
		expect(screen.getByLabelText("メッセージ入力")).toHaveAttribute(
			"aria-describedby",
			"message-body-counter message-composer-hint",
		);
	});

	it("truncates input beyond max code points on change", () => {
		const onBodyChange = vi.fn();
		render(
			<MessageComposer body="" onBodyChange={onBodyChange} onSend={vi.fn()} />,
		);

		const overLimit = `${"a".repeat(MESSAGE_BODY_MAX_CODE_POINTS)}😀`;
		fireEvent.change(screen.getByLabelText("メッセージ入力"), {
			target: { value: overLimit },
		});

		expect(onBodyChange).toHaveBeenCalledWith(
			"a".repeat(MESSAGE_BODY_MAX_CODE_POINTS),
		);
	});

	it("uses example placeholder and shows shortcut hint in footer", async () => {
		await withNavigatorPlatform("Win32", async () => {
			render(
				<MessageComposer body="" onBodyChange={vi.fn()} onSend={vi.fn()} />,
			);

			expect(screen.getByLabelText("メッセージ入力")).toHaveAttribute(
				"placeholder",
				"メッセージを入力…",
			);
			expect(
				screen.getByText("Ctrl+Enter で送信。Enter で改行"),
			).toBeInTheDocument();
		});
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

		await withNavigatorPlatform("Win32", async () => {
			render(
				<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
			);

			await user.click(screen.getByLabelText("メッセージ入力"));
			await user.keyboard("{Control>}{Enter}{/Control}");

			expect(onSend).toHaveBeenCalledTimes(1);
		});
	});

	it("calls onSend when send button is clicked (SRS-UI-003)", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();

		render(
			<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
		);

		await user.click(screen.getByRole("button", { name: "送信" }));

		expect(onSend).toHaveBeenCalledTimes(1);
	});

	it("disables send button when body is empty", () => {
		render(<MessageComposer body="" onBodyChange={vi.fn()} onSend={vi.fn()} />);

		expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
	});

	it("does not call onSend when send button is disabled", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();

		render(<MessageComposer body="" onBodyChange={vi.fn()} onSend={onSend} />);

		const button = screen.getByRole("button", { name: "送信" });
		expect(button).toBeDisabled();
		await user.click(button);

		expect(onSend).not.toHaveBeenCalled();
	});

	it("sends on Meta+Enter on Mac", async () => {
		const user = userEvent.setup();
		const onSend = vi.fn();

		await withNavigatorPlatform("MacIntel", async () => {
			render(
				<MessageComposer body="hello" onBodyChange={vi.fn()} onSend={onSend} />,
			);

			await user.click(screen.getByLabelText("メッセージ入力"));
			await user.keyboard("{Meta>}{Enter}{/Meta}");

			expect(onSend).toHaveBeenCalledTimes(1);
		});
	});
});
