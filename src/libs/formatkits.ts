import type { LoggingsFormatKitFunction } from "../types";
import _inspect from "./inspect";
import { colorpik, LoggingsAnsiSpecials, toHexadecimal } from "./pallet";

/**
 * Creates a logging format function that applies a parser based on a regex or string
 * and executes a callback to process the extracted values.
 *
 * @param {string | RegExp} parser - A regular expression or string to match patterns in the text.
 * @param {(nocolor: boolean, ...text: string[]) => string} cb - Callback function to handle the extracted values.
 *   - `nocolor`: Indicates whether color formatting should be disabled.
 *   - `...text`: Captured groups from the regex applied to the input text.
 * @returns {LoggingsFormatKitFunction} Returns a function that can be used to process formatted logs.
 */
export const LoggingsFormatParser = (
	parser: string | RegExp,
	cb: (nocolor: boolean, ...text: string[]) => string,
): LoggingsFormatKitFunction => {
	return (nocolor, text) => {
		const regex = typeof parser === "string" ? new RegExp(parser, "g") : parser;
		return text.replace(regex, (...args) => cb(nocolor, ...args));
	};
};

/**
 * Optimized Gradient Function
 */
const GradientFunction = (
	nocolor: boolean,
	_: string,
	text: string,
	_colors: string,
) => {
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

	output.push(LoggingsAnsiSpecials.reset);
	return output.join("");
};

/**
 * Returns Gradient Text in terminal colors
 *
 * @since Loggings v3.0.0
 */
export const LoggingsGrandient = (text: string) =>
	LOGGINGS_FORMATKITS[2](false, text);

/**
 * Default Loggings Formatkits
 */
export const LOGGINGS_FORMATKITS: LoggingsFormatKitFunction[] = [
	/**
	 * Loggings Legacy colors formatkit
	 *
	 * @new Fragment/Fragment
	 * @version 3.2.0v
	 * @since Loggings v1.0.0
	 *
	 * @example "[example text].green-b"
	 */
	(nocolor, input) => {
		const pattern = /\[([^[\]]+)\]\.(\w+)(-b)?/g;
		const fragments: {
			key: string;
			value: string;
		}[] = [];
		let counter = 0;

		let output = input;

		// Multi-pass replacement: Process all innermost matches at once
		while (true) {
			let changed = false;
			// Use replace with callback to handle all non-overlapping matches in one pass
			output = output.replace(pattern, (_matched, value, key, boldFlag) => {
				changed = true;
				const isBold = boldFlag === "-b";
				const count = counter++;

				let fragmented = value;
				if (isBold)
					fragmented = nocolor
						? fragmented
						: LoggingsAnsiSpecials.bold + fragmented;
				fragmented = nocolor ? fragmented : colorpik(key, fragmented);

				const placeholder = `<__LOGGINGS_$${count}>`;
				fragments.push({ key: placeholder, value: fragmented });
				return placeholder;
			});

			if (!changed) break;
		}

		for (let i = fragments.length - 1; i >= 0; i--) {
			output = output.replace(fragments[i].key, fragments[i].value);
		}

		return output;
	},
	/**
	 * Loggings Combined Simple Styles
	 * Bold, Strikethrough, Italic, Underline, Blink, Reverse
	 * @version 3.2.0 optimized
	 */
	LoggingsFormatParser(
		/(\*)(.*?)\*|(~)(.*?)~|(-)(.*?)-|(_)(.*?)_|(!)(.*?)!|(#)(.*?)#/g,
		(nocolor, match, ...args) => {
			// args contains captured groups.
			// Groups:
			// 1: * (bold delimiter), 2: content
			// 3: ~ (strike delimiter), 4: content
			// 5: - (italic delimiter), 6: content
			// 7: _ (underline delimiter), 8: content
			// 9: ! (blink delimiter), 10: content
			// 11: # (reverse delimiter), 12: content

			if (nocolor) {
				// Return content only
				// Find the non-undefined content group
				for (let i = 1; i < args.length; i += 2) {
					if (args[i] !== undefined) return args[i];
				}
				return match;
			}

			const styleMap: Record<string, string> = {
				"*": "bold",
				"~": "strikethrough",
				"-": "italic",
				_: "underline",
				"!": "blink",
				"#": "reverse",
			};

			// Find matched delimiter
			for (let i = 0; i < args.length; i += 2) {
				const delimiter = args[i];
				const content = args[i + 1];
				if (delimiter && content !== undefined) {
					return colorpik(styleMap[delimiter], content);
				}
			}
			return match;
		},
	),
	/**
	 * Loggings Gradient formatkit
	 *
	 * @version 1.0.0v
	 * @since Loggings v3.0.0
	 */
	LoggingsFormatParser(/\(([^()]+)\)g[db]\((.*?)\)/g, GradientFunction),
];

/**
 * Sprintf implementation for Loggings
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
 * Loggings FormatKit Controller
 *
 * Processes text by applying the defined FormatKits, allowing logs to be styled
 * with various formats such as colors, bold, underline, and gradients.
 *
 * @param texts - A string or an array of texts to be formatted.
 * @param extraformats - Additional custom FormatKits.
 * @param nocolor - Determines whether formatting should be disabled (returning plain text).
 * @returns Returns a formatted string with applied styling rules.
 * @since Loggings v3.0.0
 * @new Fragment/Fragmenter of loggings
 *
 * @example
 * ```ts
 * const formatted = LoggingsFormatKitController("Text in *bold* and ~strikethrough~");
 * console.log(formatted); // Output formatted with ANSI codes
 * ```
 */
export const LoggingsFormatKitController = (
	texts: any | any[],
	extraformats: LoggingsFormatKitFunction[] = [],
	nocolor = false,
) => {
	let inputs = Array.isArray(texts) ? texts : [texts];
	const tools = [...LOGGINGS_FORMATKITS, ...extraformats];
	let output: string[] = [];

	// Sprintf Support
	if (inputs.length > 0 && typeof inputs[0] === "string" && inputs.length > 1) {
		// Simple heuristic: if string contains %, try sprintf
		// Or always try? Node.js util.format always tries.
		const { result, consumed } = sprintf(inputs[0], inputs.slice(1), nocolor);
		output.push(result);
		// Remove consumed args + format string
		inputs = inputs.slice(1 + consumed);
	}

	// Process remaining inputs
	inputs.forEach((input: any) => {
		if (typeof input === "string") {
			output.push(input);
		} else {
			output.push(_inspect(input, nocolor));
		}
	});

	// Apply FormatKits to all string parts
	output = output.map((current) => {
		let changed = false;
		let iterations = 0;
		const max = 10;

		do {
			changed = false;
			tools.forEach((func) => {
				const nextupt = func(nocolor, current);
				if (nextupt !== current) {
					changed = true;
					current = nextupt;
				}
			});
			iterations++;
		} while (changed && iterations < max);

		return current;
	});

	return output.join(" ");
};
