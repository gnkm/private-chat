import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ServerBroadcastPost } from "@private-chat/shared";
import { ChatApp } from "./components/ChatApp.js";
import type { ChatSocket } from "./lib/chat-socket.js";
import { DISPLAY_NAME_STORAGE_KEY } from "./lib/display-name.js";
import { createFakeWebSocketClass } from "./lib/fake-websocket.js";

describe("ChatApp (フェーズ3)", () => {
	const { FakeWebSocket, getLastController } = createFakeWebSocketClass();

	beforeEach(() => {
		localStorage.clear();
		vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		localStorage.clear();
	});

	it("shows Slack-like layout with sidebar and main area (SRS-UI-001)", () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		expect(
			screen.getByRole("heading", { name: "Private Chat" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("表示名")).toBeInTheDocument();
		expect(screen.getByLabelText("投稿一覧")).toBeInTheDocument();
		expect(screen.getByLabelText("メッセージ入力")).toBeInTheDocument();
	});

	it("persists display name in localStorage (SRS-UI-004)", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		const input = screen.getByLabelText("表示名");
		await user.clear(input);
		await user.type(input, "Bob");
		expect(localStorage.getItem(DISPLAY_NAME_STORAGE_KEY)).toBe("Bob");
	});

	it("appends posts in chronological order (SRS-UI-002)", async () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({
				id: "1",
				displayName: "A",
				body: "first",
				sentAt: "2026-04-18T12:00:00.000Z",
			}),
		);
		getLastController()?.simulateMessage(
			JSON.stringify({
				id: "2",
				displayName: "B",
				body: "second",
				sentAt: "2026-04-18T12:01:00.000Z",
			}),
		);

		await waitFor(() => {
			expect(screen.getByText("first")).toBeInTheDocument();
			expect(screen.getByText("second")).toBeInTheDocument();
		});
		const list = screen.getByLabelText("投稿一覧");
		const items = list.querySelectorAll("li");
		expect(items).toHaveLength(2);
		expect(items[0]).toHaveTextContent("first");
		expect(items[1]).toHaveTextContent("second");
	});

	it("does not send empty body on Enter (SRS-UI-003)", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		const textarea = screen.getByLabelText("メッセージ入力");
		await user.click(textarea);
		await user.keyboard("{Enter}");
		expect(getLastController()?.sent).toHaveLength(0);
	});

	it("sends post on Enter with display name and body", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		await user.type(screen.getByLabelText("表示名"), "Alice");
		await user.type(screen.getByLabelText("メッセージ入力"), "hello{Enter}");

		expect(getLastController()?.sent).toEqual([
			JSON.stringify({ displayName: "Alice", body: "hello" }),
		]);
	});

	it("shows server error message (SRS-IF-003)", async () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({ type: "error", message: "本文が空です" }),
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("本文が空です");
		});
	});

	it("shows error when socket is not open on send", async () => {
		const createSocket = (
			_url: string,
			callbacks: {
				onPost: (post: ServerBroadcastPost) => void;
				onSendError: (message: string) => void;
			},
		) => {
			const stub = {
				connect: vi.fn(),
				dispose: vi.fn(),
				sendPost: () => {
					callbacks.onSendError("オフラインです");
				},
			};
			return stub as unknown as ChatSocket;
		};

		const user = userEvent.setup();
		render(
			<ChatApp
				chatOptions={{
					wsUrl: "ws://test/ws",
					createSocket,
				}}
			/>,
		);

		await user.type(screen.getByLabelText("メッセージ入力"), "x{Enter}");
		expect(screen.getByRole("alert")).toHaveTextContent("オフラインです");
	});
});
