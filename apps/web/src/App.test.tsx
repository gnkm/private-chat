import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatApp } from "./components/ChatApp.js";
import type { ChatSocketCallbacks } from "./hooks/use-chat.js";
import type { ChatSocket } from "./lib/chat-socket.js";
import { DISPLAY_NAME_STORAGE_KEY } from "./lib/display-name.js";
import { createFakeWebSocketClass } from "./lib/fake-websocket.js";
import { typeDisplayName } from "./test/open-display-name-field.js";
import { withNavigatorPlatform } from "./test/stub-navigator-platform.js";

describe("ChatApp (フェーズ3)", () => {
	const { FakeWebSocket, getLastController } = createFakeWebSocketClass();

	function sentPayloads(): unknown[] {
		return (getLastController()?.sent ?? []).map(
			(raw) => JSON.parse(raw) as unknown,
		);
	}

	function expectNoPostsSent(): void {
		const posts = sentPayloads().filter(
			(payload) =>
				typeof payload === "object" && payload !== null && "body" in payload,
		);
		expect(posts).toHaveLength(0);
	}

	function expectPostSent(displayName: string, body: string): void {
		expect(getLastController()?.sent).toContainEqual(
			JSON.stringify({ displayName, body }),
		);
	}

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
		const sidebar = screen.getByLabelText("サイドバー");
		const chatPane = screen.getByLabelText("チャット");
		expect(
			within(chatPane).getByRole("button", { name: "ダークモードに切り替え" }),
		).toBeInTheDocument();
		expect(
			within(sidebar).getByRole("heading", { name: "Private Chat" }),
		).toBeInTheDocument();
		expect(
			within(sidebar).getByRole("button", { name: "サイドバーを閉じる" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("表示名")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "参加者" })).toBeInTheDocument();
		expect(screen.getByLabelText("投稿一覧")).toBeInTheDocument();
		expect(screen.getByLabelText("メッセージ入力")).toBeInTheDocument();
	});

	it("keeps message composer visible when many posts arrive", async () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		for (let i = 1; i <= 20; i += 1) {
			getLastController()?.simulateMessage(
				JSON.stringify({
					id: String(i),
					displayName: "A",
					body: `message-${i}`,
					sentAt: `2026-04-18T12:${String(i).padStart(2, "0")}:00.000Z`,
				}),
			);
		}

		await waitFor(() => {
			expect(screen.getAllByRole("listitem")).toHaveLength(20);
		});
		expect(screen.getByLabelText("メッセージ入力")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
	});

	it("shows empty state when there are no posts", () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		expect(
			screen.getByText("ここにメッセージが表示されます"),
		).toBeInTheDocument();
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

	it("does not send when display name is empty and shows error", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		await user.type(screen.getByLabelText("メッセージ入力"), "hello");
		await user.click(screen.getByRole("button", { name: "送信" }));

		expectNoPostsSent();
		expect(screen.getByRole("alert")).toHaveTextContent(
			"表示名を入力してから送信してください。",
		);
		expect(screen.getByLabelText("メッセージ入力")).toHaveValue("hello");
	});

	it("does not send when display name is whitespace only", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		await typeDisplayName(user, "   ");
		await user.type(screen.getByLabelText("メッセージ入力"), "hello");
		await user.keyboard("{Control>}{Enter}{/Control}");

		expectNoPostsSent();
		expect(screen.getByRole("alert")).toHaveTextContent(
			"表示名を入力してから送信してください。",
		);
	});

	it("does not send empty body on send shortcut (SRS-UI-003)", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		const textarea = screen.getByLabelText("メッセージ入力");
		await user.click(textarea);
		await user.keyboard("{Control>}{Enter}{/Control}");
		expectNoPostsSent();
	});

	it("does not send on plain Enter (IME conversion)", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		await typeDisplayName(user, "Alice");
		await user.type(screen.getByLabelText("メッセージ入力"), "hello{Enter}");

		expectNoPostsSent();
	});

	it("sends post on send button click (SRS-UI-003)", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		await typeDisplayName(user, "Alice");
		await user.type(screen.getByLabelText("メッセージ入力"), "hello");
		await user.click(screen.getByRole("button", { name: "送信" }));

		expectPostSent("Alice", "hello");
	});

	it("sends post on Ctrl+Enter with display name and body", async () => {
		const user = userEvent.setup();

		await withNavigatorPlatform("Win32", async () => {
			render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
			await waitFor(() => expect(getLastController()?.readyState).toBe(1));

			await typeDisplayName(user, "Alice");
			await user.click(screen.getByLabelText("メッセージ入力"));
			await user.type(screen.getByLabelText("メッセージ入力"), "hello");
			await user.keyboard("{Control>}{Enter}{/Control}");

			expectPostSent("Alice", "hello");
		});
	});

	it("shows participants when participants frame arrives", async () => {
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({
				type: "participants",
				participants: [{ id: "p1", displayName: "Alice" }],
			}),
		);

		await waitFor(() => {
			expect(screen.getByRole("listitem")).toHaveTextContent("Alice");
		});
	});

	it("sends setDisplayName on display name blur", async () => {
		const user = userEvent.setup();
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);
		await waitFor(() => expect(getLastController()?.readyState).toBe(1));

		const input = screen.getByLabelText("表示名");
		await user.clear(input);
		await user.type(input, "Alice");
		await user.tab();

		await waitFor(() => {
			expect(getLastController()?.sent).toContainEqual(
				JSON.stringify({ type: "setDisplayName", displayName: "Alice" }),
			);
		});
	});

	it("announces stored display name on connect", async () => {
		localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, "Alice");
		render(<ChatApp chatOptions={{ wsUrl: "ws://test/ws" }} />);

		await waitFor(() => {
			expect(getLastController()?.sent).toContainEqual(
				JSON.stringify({ type: "setDisplayName", displayName: "Alice" }),
			);
		});
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
		const user = userEvent.setup();
		render(
			<ChatApp
				chatOptions={{
					wsUrl: "ws://test/ws",
					createSocket: (_url: string, callbacks: ChatSocketCallbacks) => {
						const stub = {
							connect: vi.fn(),
							dispose: vi.fn(),
							sendPost: () => {
								callbacks.onSendError("オフラインです");
								return false;
							},
							sendSetDisplayName: vi.fn(),
						};
						return stub as unknown as ChatSocket;
					},
				}}
			/>,
		);

		await typeDisplayName(user, "Alice");
		await user.click(screen.getByLabelText("メッセージ入力"));
		await user.type(screen.getByLabelText("メッセージ入力"), "x");
		await user.keyboard("{Control>}{Enter}{/Control}");
		expect(screen.getByRole("alert")).toHaveTextContent("オフラインです");
		expect(screen.getByLabelText("メッセージ入力")).toHaveValue("x");
	});
});
