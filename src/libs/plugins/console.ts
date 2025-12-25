import type { LggsLevel, LggsPluginData } from "../../types";
import type { LggsBaseConfig } from "../defaults";
import { LggsFormatKitController } from "../formatkits";
import { colorpik, type LggsPallet } from "../pallet";
import { LggsLevelToNumber, Runtime, runtime, timer } from "../utils";

/**
 * Lggs Console Default options
 */
export const ConsolePluginDefault: LggsConsoleConfig = {
	format: "[{status}] [{hours}:{minutes}:{seconds}].gray {message}",
	status: {
		error: "red50",
		debug: "purple50",
		info: "blue40",
		warn: "yellow40",
		trace: "yellow95",
		txt: "none",
	},
	color: "green",
	fallback: "white",
	disable_colors: false,
	console: true,
	colors: {},
};

/**
 * Lggs Console plugin
 *
 * Allow lggs show logs in terminal with colors
 *
 * @version 2.0.0
 */
export const ConsolePlugin = (
	opts: LggsConsoleOptions = {},
): LggsPluginData<LggsConsoleConfig & Partial<LggsBaseConfig>> => ({
	ident: "lggs-console",
	default: ConsolePluginDefault,
	onInit: opts.onInit,
	onPreMessage: (config, level, messages) => {
		if (level === "txt") return undefined;
		const logLevel = LggsLevelToNumber(
			config.console_level ?? (config.level as LggsLevel),
		);
		const msgLevel = LggsLevelToNumber(level);
		if (!config.console || msgLevel > logLevel) return undefined;

		return opts.onPreMessage
			? opts.onPreMessage(config, level, messages)
			: messages;
	},
	onMessage(config, level, messages) {
		config.level = config.console_level ? config.console_level : config.level;
		if (opts.onMessage) opts.onMessage(config, level, messages);
		let message = LggsFormatKitController(
			config.format,
			config.formatKits,
			config.disable_colors,
		);
		message = timer(message).format;

		const disabled = config.disable_colors;
		if (message.includes("{title}")) {
			message = message.replace(
				/{title}/g,
				disabled
					? (config.title as string)
					: colorpik(config.color, config.title as string, config.colors),
			);
		}
		if (message.includes("{status}")) {
			message = message.replace(
				/{status}/g,
				disabled
					? level
					: colorpik(
						config.status[level],
						colorpik("bold", level),
						config.colors,
					),
			);
		}
		if (message.includes("{message}")) {
			message = message.replace(
				/{message}/g,
				LggsFormatKitController(
					messages,
					config.formatKits,
					config.disable_colors,
				),
			);
		}
		return message;
	},
	onSend(config, level, message) {
		if (opts.onSend) opts.onSend(config, level, message);
		const nmessage = `${message}\n`;
		const isError = ["error", "warn"].includes(level.toLowerCase());

		switch (runtime) {
			case Runtime.Deno: {
				const output = new TextEncoder().encode(nmessage);
				//@ts-ignore Ignore Deno
				return isError ? Deno.stderr.write(output) : Deno.stdout.write(output);
			}
			case Runtime.Node: {
				//@ts-ignore Ignore Node
				return isError
					? process.stderr.write(nmessage)
					: process.stdout.write(nmessage);
			}
			case Runtime.Bun: {
				//@ts-ignore Ignore Bun
				return isError ? Bun.write(Bun.stderr, nmessage) : Bun.write(Bun.stdout, nmessage);
			}
			case Runtime.Browser: {
				// Navegador usa console para logging
				console[level.toLowerCase() as "log"](message);
				break;
			}
			default: {
				throw new Error("Unknown environment");
			}
		}
	},
});

export type LggsConsoleOptions = {
	onPreMessage?: LggsPluginData<LggsConsoleConfig>["onPreMessage"];
	onMessage?: LggsPluginData<LggsConsoleConfig>["onMessage"];
	onSend?: LggsPluginData<LggsConsoleConfig>["onSend"];
	onInit?: LggsPluginData<LggsConsoleConfig>["onInit"];
};

export type LggsConsoleConfig = {
	/**
	 * Format log Message, Console print.
	 *
	 * Main Args:  {status} | {message} | {title}
	 *
	 * Timer Args: {day} | {month} | {year} | {hours} | {minutes}| {seconds} | {milliseconds}
	 *
	 * @default "[{status}] [{{hours}:{minutes}:{seconds}}].gray {message}"
	 */
	format: string;
	/**
	 * Lggs Level
	 * Console-specific level will be used
	 */
	console_level?: LggsLevel;
	/**
	 * Status colors
	 */
	status: Record<LggsLevel, keyof typeof LggsPallet>;
	/**
	 * Add new Colors code(ansi or rgb code colors), used in logs functions,
	 * e.g:
	 * @default ```ts
	 * import Lggs, { rgb } from "lggs";
	 * const logger = new Lggs();
	 * logger.config({
	 *     colors: {
	 *          "ngreen": rgb(57, 255, 20)() // Neon Green
	 *     }
	 * })
	 * logger.log("[Hello].ngreen")
	 * ```
	 */
	colors?: Record<string, string>;
	/**
	 * If any color using the [].color declaration is wrong,
	 * we will use that color instead.
	 */
	fallback: keyof typeof LggsPallet;
	/**
	 * In some types of hosting, the terminal does not support
	 * ansi colors or uses the terminal to display logs.
	 * The lggs module uses arguments that apply colors to the terminal
	 * using ansi codes, which can make logs difficult to read when saved in
	 * .txt files due to the presence of several random characters.
	 *
	 * To solve this problem, this boolean has been added, that,
	 * when activated, causes the lggs module to ignore the color codes
	 * and imprint simple logs on the terminal, without color formatting.
	 *
	 * Hosts that this boolean becomes useful:
	 * [Discloud, Squarecloud]
	 */
	disable_colors: boolean;
	/**
	 * Allows show logs in terminal
	 */
	console: boolean;
	/**
	 * Color of title
	 */
	color: keyof typeof LggsPallet;
};
