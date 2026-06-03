import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeWebSocketClass } from "../lib/fake-websocket.js";
import { SIDEBAR_WIDTH_COLLAPSED_CLASS } from "../lib/sidebar-layout.js";
import { ChatApp } from "./ChatApp.js";

describe("ChatApp responsive sidebar", () => {
	const { FakeWebSocket } = createFakeWebSocketClass();

	beforeEach(() => {
		vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it("shows title on the left and toggle on the top right of the sidebar", () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		const sidebar = screen.getByLabelText("サイドバー");
		const header = within(sidebar).getByRole("heading", {
			name: "Private Chat",
		});
		const toggle = within(sidebar).getByRole("button", {
			name: "サイドバーを閉じる",
		});
		expect(header.compareDocumentPosition(toggle)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		);
	});

	it("collapses sidebar to icon width while keeping toggle visible", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		await user.click(
			screen.getByRole("button", { name: "サイドバーを閉じる" }),
		);

		const sidebar = screen.getByLabelText("サイドバー");
		expect(sidebar).toHaveClass(SIDEBAR_WIDTH_COLLAPSED_CLASS);
		expect(sidebar).toBeVisible();
		expect(
			within(sidebar).getByRole("button", { name: "サイドバーを開く" }),
		).toHaveAttribute("title", "サイドバーを開く");
		const panel = document.getElementById("chat-sidebar-panel");
		expect(panel).toHaveAttribute("inert");
		expect(panel).toHaveAttribute("aria-hidden", "true");
		expect(
			screen.queryByRole("heading", { name: "Private Chat" }),
		).not.toBeInTheDocument();
	});

	it("keeps theme toggle in chat pane when sidebar is collapsed", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		await user.click(
			screen.getByRole("button", { name: "サイドバーを閉じる" }),
		);

		const sidebar = screen.getByLabelText("サイドバー");
		const chatPane = screen.getByLabelText("チャット");
		expect(
			within(sidebar).queryByRole("button", { name: /モードに切り替え/ }),
		).not.toBeInTheDocument();
		expect(
			within(chatPane).getByRole("button", { name: "ダークモードに切り替え" }),
		).toBeVisible();
	});

	it("expands sidebar when toggle is clicked again", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		await user.click(
			screen.getByRole("button", { name: "サイドバーを閉じる" }),
		);
		await user.click(screen.getByRole("button", { name: "サイドバーを開く" }));

		expect(screen.getByLabelText("表示名")).toBeVisible();
	});
});
