import type { LggsLevel, TimerFormat } from "../types";

const rgb_converter = (background: boolean, ...colors: number[]) => {
	const [r, g, b] = colors.map((color) => Math.min(255, Math.max(0, color)));
	const type = background ? "48" : "38";
	return `\x1b[${type};2;${r};${g};${b}m`;
};

/**
 * Text RGB Color
 * @param r Red color (0 ~ 255)
 * @param g Green color (0 ~ 255)
 * @param b Blue color (0 ~ 255)
 * @returns (isBackground? = false) => string // terminal string
 */
export const rgb =
	(r: number, g: number, b: number) =>
	(bg: boolean = false) =>
		rgb_converter(bg, r, g, b);

export function timer(format: string): { format: string; timer: TimerFormat } {
	const now = new Date();
	const timer = {
		timestamp: Date.now(),
		year: String(now.getFullYear()),
		month: String(now.getMonth() + 1).padStart(2, "0"),
		day: String(now.getDate()).padStart(2, "0"),
		hours: String(now.getHours()).padStart(2, "0"),
		minutes: String(now.getMinutes()).padStart(2, "0"),
		seconds: String(now.getSeconds()).padStart(2, "0"),
		milliseconds: String(now.getMilliseconds()).padStart(3, "0"),
	};

	const formatted = Object.entries(timer).reduce((acc, [key]) => {
		const regex = new RegExp(`{${key}}`, "g");
		return acc.replace(regex, String(timer[key as keyof typeof timer]));
	}, format);

	return { format: formatted, timer };
}

export function LggsLevelToNumber(level: LggsLevel) {
	switch (level) {
		case "debug":
			return 4;
		case "info":
			return 3;
		case "warn":
			return 2;
		case "error":
			return 1;
		default:
			return 1;
	}
}
export enum Runtime {
	Node,
	Bun,
	Deno,
	Browser,
}

/**
 * Only for check
 */
declare const Bun: unknown | undefined;
declare const Deno: unknown | undefined;

/**
 * Current Runtime
 */
let runtime = Runtime.Node;
switch (true) {
	case typeof Bun !== "undefined": {
		runtime = Runtime.Bun;
		break;
	}
	case typeof Deno !== "undefined": {
		runtime = Runtime.Deno;
		break;
	}
	case typeof process !== "undefined": {
		runtime = Runtime.Node;
		break;
	}
	default: {
		runtime = Runtime.Browser;
	}
}

export const setRuntime = (r: Runtime) => {
	runtime = r;
};

export function deepMerge<T extends object = object>(
	target: T,
	...sources: Partial<T>[]
): T {
	for (const source of sources) {
		if (!isObject(source)) continue;

		const stack: Array<{ to: Record<string, any>; from: Record<string, any> }> = [
			{ to: target as Record<string, any>, from: source as Record<string, any> },
		];

		while (stack.length > 0) {
			const current = stack.pop() as {
				to: Record<string, any>;
				from: Record<string, any>;
			};

			for (const key in current.from) {
				const next = current.from[key];
				if (isObject(next)) {
					const existing = current.to[key];
					if (!isObject(existing)) {
						current.to[key] = {};
					}
					stack.push({
						to: current.to[key] as Record<string, any>,
						from: next as Record<string, any>,
					});
					continue;
				}
				current.to[key] = next;
			}
		}
	}

	return target;
}

function isObject(item: any): item is object {
	return item && typeof item === "object" && !Array.isArray(item);
}

export { runtime };
