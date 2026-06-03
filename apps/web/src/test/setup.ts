import "@testing-library/jest-dom/vitest";

/** Node 22+ の実験的 localStorage が jsdom と競合するため、テスト用に差し替える */
const storage = new Map<string, string>();

const testLocalStorage: Storage = {
	get length() {
		return storage.size;
	},
	clear() {
		storage.clear();
	},
	getItem(key: string) {
		const value = storage.get(key);
		return value === undefined ? null : value;
	},
	key(index: number) {
		const keys = [...storage.keys()];
		return keys[index] ?? null;
	},
	removeItem(key: string) {
		storage.delete(key);
	},
	setItem(key: string, value: string) {
		storage.set(key, value);
	},
};

Object.defineProperty(globalThis, "localStorage", {
	value: testLocalStorage,
	writable: true,
	configurable: true,
});
