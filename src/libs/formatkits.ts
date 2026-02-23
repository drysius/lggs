import type { LggsFormatKitFunction } from "../types";
import _inspect from "./inspect";
import { colorpik, LggsAnsiSpecials, toHexadecimal } from "./pallet";

/**
 * Creates a logging format function that applies a parser based on a regex or string
 * and executes a callback to process the extracted values.
 *
 * @param {string | RegExp} parser - A regular expression or string to match patterns in the text.
 * @param {(nocolor: boolean, ...text: string[]) => string} cb - Callback function to handle the extracted values.
 *   - `nocolor`: Indicates whether color formatting should be disabled.
 *   - `...text`: Captured groups from the regex applied to the input text.
 * @returns {LggsFormatKitFunction} Returns a function that can be used to process formatted logs.
 */
export const LggsFormatParser = (
	parser: string | RegExp,
	cb: (nocolor: boolean, ...text: string[]) => string,
): LggsFormatKitFunction => {
	const regex = typeof parser === "string" ? new RegExp(parser, "g") : parser;
	return (nocolor, text) => {
		return text.replace(regex, (...args) => cb(nocolor, ...args));
	};
};

const legacyPattern = /\[([^[\]]+)\]\.(\w+)(-b)?/g;
const stylePattern =
	/(\*)(.*?)\*|(~)(.*?)~|(-)(.*?)-|(_)(.*?)_|(!)(.*?)!|(#)(.*?)#/g;
const gradientPattern = /\(([^()]+)\)g[db]\((.*?)\)/g;

const styleMap: Record<string, string> = {
	"*": "bold",
	"~": "strikethrough",
	"-": "italic",
	_: "underline",
	"!": "blink",
	"#": "reverse",
};

function legacyFormatKit(nocolor: boolean, input: string): string {
	let output = input;
	const fragments: { key: string; value: string }[] = [];
	let counter = 0;

	while (true) {
		legacyPattern.lastIndex = 0;
		let changed = false;
		output = output.replace(legacyPattern, (_matched, value, key, boldFlag) => {
			changed = true;
			let formatted = value;
			if (!nocolor && boldFlag === "-b") {
				formatted = LggsAnsiSpecials.bold + formatted;
			}
			if (!nocolor) {
				formatted = colorpik(key, formatted);
			}
			const placeholder = `<__LGGS_${counter++}>`;
			fragments.push({ key: placeholder, value: formatted });
			return placeholder;
		});
		if (!changed) break;
	}

	for (let i = fragments.length - 1; i >= 0; i--) {
		output = output.replace(fragments[i].key, fragments[i].value);
	}

	return output;
}

function styleFormatKit(nocolor: boolean, input: string): string {
	return input.replace(stylePattern, (match, ...groups) => {
		if (nocolor) {
			for (let i = 1; i < groups.length; i += 2) {
				if (groups[i] !== undefined) return groups[i];
			}
			return match;
		}

		for (let i = 0; i < groups.length; i += 2) {
			const delimiter = groups[i];
			const content = groups[i + 1];
			if (delimiter && content !== undefined) {
				return colorpik(styleMap[delimiter], content);
			}
		}

		return match;
	});
}

function gradientFormatKit(
	nocolor: boolean,
	_: string,
	text: string,
	_colors: string,
) {
	if (nocolor) return text;

	const splited_colors = _colors.split(",");
	const colors = (
		splited_colors.length === 1
			? [splited_colors[0], splited_colors[0]]
			: splited_colors
	)
		.map((a) => a.trim())
		.map((a) => toHexadecimal(a));

	const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
	const chars: string[] = [];

	let lastIndex = 0;
	let match: RegExpExecArray | null = null;
	while ((match = emojiRegex.exec(text)) !== null) {
		for (let i = lastIndex; i < match.index; i++) {
			chars.push(text[i]);
		}
		chars.push(match[0]);
		lastIndex = emojiRegex.lastIndex;
	}
	for (let i = lastIndex; i < text.length; i++) {
		chars.push(text[i]);
	}

	const textLength = chars.length;
	const sections = colors.length - 1;
	const section_length = Math.ceil(textLength / sections);

	const output: string[] = [];

	for (let i = 0; i < textLength; i++) {
		const char = chars[i];
		const index = Math.floor(i / section_length);
		const factor = (i - index * section_length) / section_length;

		// Inline interpolation and RGB conversion
		const colorA = colors[Math.min(index, sections)];
		const colorB = colors[Math.min(index + 1, sections)];

		const rA = (colorA >> 16) & 255,
			gA = (colorA >> 8) & 255,
			bA = colorA & 255;
		const rB = (colorB >> 16) & 255,
			gB = (colorB >> 8) & 255,
			bB = colorB & 255;

		const r = (rA + (rB - rA) * factor) | 0; // Bitwise trunc instead of round
		const g = (gA + (gB - gA) * factor) | 0;
		const b = (bA + (bB - bA) * factor) | 0;

		output.push(`\x1b[38;2;${r};${g};${b}m`, char);
	}

	output.push(LggsAnsiSpecials.reset);
	return output.join("");
}

/**
 * Returns Gradient Text in terminal colors
 *
 * @since Lggs v3.0.0
 */
export const LggsGrandient = (text: string) =>
	LGGS_FORMATKITS[1](false, text);

/**
 * Core Lggs Formatkits
 * Legacy + gradient ficam sempre ativos.
 */
export const LGGS_FORMATKITS: LggsFormatKitFunction[] = [
	legacyFormatKit,
	LggsFormatParser(gradientPattern, gradientFormatKit),
];

/**
 * Formatkits extras (desligados por padrão).
 * Ative com `extkits: true`.
 */
export const LGGS_EXT_FORMATKITS: LggsFormatKitFunction[] = [styleFormatKit];

/**
 * Sprintf implementation for Lggs
 */
export function sprintf(
	format: string,
	args: any[],
	nocolor: boolean,
): { result: string; consumed: number };
export function sprintf(format: string, ...args: any[]): string;
export function sprintf(
	format: string,
	...args: any[]
): string | { result: string; consumed: number } {
	const isInternal = Array.isArray(args[0]) && typeof args[1] === "boolean";
	const actualArgs = isInternal ? args[0] : args;
	const nocolor = isInternal ? args[1] : false;

	let consumed = 0;
	const result = format.replace(/%([a-zA-Z%])/g, (match, char) => {
		if (match === "%%") return "%";
		if (consumed >= actualArgs.length) return match;

		const arg = actualArgs[consumed++];
		switch (char) {
			case "s":
				return String(arg);
			case "d":
				return String(Math.floor(Number(arg)));
			case "i":
				return String(parseInt(String(arg), 10));
			case "f":
				return String(parseFloat(String(arg)));
			case "j":
				try {
					return JSON.stringify(arg);
				} catch {
					return "[Circular]";
				}
			case "o":
			case "O":
				return _inspect(arg, nocolor);
			default:
				consumed--; // didn't consume
				return match;
		}
	});

	if (isInternal) {
		return { result, consumed };
	}
	return result;
}

/**
 * Lggs FormatKit Controller
 *
 * Processes text by applying the defined FormatKits, allowing logs to be styled
 * with various formats such as colors, bold, underline, and gradients.
 *
 * @param texts - A string or an array of texts to be formatted.
 * @param extraformats - Additional custom FormatKits.
 * @param nocolor - Determines whether formatting should be disabled (returning plain text).
 * @returns Returns a formatted string with applied styling rules.
 * @since Lggs v3.0.0
 * @new Fragment/Fragmenter of lggs
 *
 * @example
 * ```ts
 * const formatted = LggsFormatKitController("Text in *bold* and ~strikethrough~");
 * console.log(formatted); // Output formatted with ANSI codes
 * ```
 */
export const LggsFormatKitController = (
	texts: any | any[],
	extraformats: LggsFormatKitFunction[] = [],
	nocolor = false,
	extkits = false,
) => {
	let inputs = Array.isArray(texts) ? texts : [texts];
	const output: string[] = [];

	if (inputs.length > 0 && typeof inputs[0] === "string" && inputs.length > 1) {
		const { result, consumed } = sprintf(inputs[0], inputs.slice(1), nocolor);
		output.push(result);
		inputs = inputs.slice(1 + consumed);
	}

	for (const input of inputs) {
		if (typeof input === "string") {
			output.push(input);
		} else {
			output.push(_inspect(input, nocolor));
		}
	}

	const tools = extkits
		? [...LGGS_FORMATKITS, ...LGGS_EXT_FORMATKITS, ...extraformats]
		: [...LGGS_FORMATKITS, ...extraformats];

	for (let i = 0; i < output.length; i++) {
		let current = output[i];
		for (const tool of tools) {
			current = tool(nocolor, current);
		}
		output[i] = current;
	}

	return output.join(" ");
};
