export async function withNavigatorPlatform(
	platform: string,
	run: () => void | Promise<void>,
): Promise<void> {
	const original = navigator.platform;
	Object.defineProperty(navigator, "platform", {
		configurable: true,
		value: platform,
	});
	try {
		await run();
	} finally {
		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: original,
		});
	}
}
