import fs from "node:fs";
import path from "node:path";
import type { LoggingsLevel, LoggingsPluginData } from "../../types";
import type { LoggingsBaseConfig } from "../defaults";
import { LoggingsFormatKitController } from "../formatkits";
import { LoggingsLevelToNumber, timer } from "../utils";

/**
 * Loggings Register Default options
 */
export const RegisterPluginDefault: LoggingsRegisterConfig = {
	register: true,
	register_del: true,
	register_limit: 10,
	register_dir: "./logs",
	register_locale_file: "{register_dir}",
	register_filename: "{day}_{month}_{year}.{ext}",
	register_format:
		"[ {day}/{month}/{year}-{hours}:{minutes}:{seconds} ] [ _.{title}._ ] {message}",
};
/**
 * Loggings Register plugin
 *
 * Allow loggings show logs in terminal with colors
 *
 * @version 2.0.0
 */
export const RegisterPlugin = (
	opts: LoggingsRegisterOptions = {},
): LoggingsPluginData<
	LoggingsRegisterConfig & Partial<LoggingsBaseConfig>
> => ({
	ident: "loggings-register",
	default: RegisterPluginDefault,
	onInit: opts.onInit,
	onPreMessage: (config, level, messages) => {
		const logLevel = LoggingsLevelToNumber(
			config.register_level ?? (config.level as LoggingsLevel),
		);
		const globalLevel = LoggingsLevelToNumber(config.level as LoggingsLevel);
		if (!config.register || logLevel < globalLevel) return undefined;

		return opts.onPreMessage
			? opts.onPreMessage(config, level, messages)
			: messages;
	},
	onMessage(config, level, messages) {
		if (opts.onMessage) opts.onMessage(config, level, messages);
		let message = config.register_format;
		message = timer(message).format;
		if (message.includes("{title}")) {
			message = message.replace(/{title}/g, config.title as string);
		}
		if (message.includes("{status}")) {
			message = message.replace(/{status}/g, level);
		}
		if (message.includes("{message}")) {
			message = message.replace(
				/{message}/g,
				LoggingsFormatKitController(messages, config.formatKits, true),
			);
		}
		return message;
	},
	onSend(config, level, message) {
		if (opts.onSend) opts.onSend(config, level, message);
		let filepath = config.register_locale_file.replace(
			/{register_dir}/g,
			config.register_dir,
		);
		filepath = filepath.replace(/{title}/g, config.title as string);
		filepath = filepath.replace(/{status}/g, level);
		const logFileName = timer(config.register_filename)
			.format.replace(/{status}/g, level)
			.replace(/{ext}/g, "log");

		const logFilePath = path.join(filepath, logFileName);
		const logFolderPath = path.resolve(config.register_dir);
		if (!fs.existsSync(logFolderPath)) {
			fs.mkdirSync(logFolderPath, { recursive: true });
		}
		fs.appendFileSync(logFilePath, `${message}\n`);

		if (config.register_del && config.register_limit > 0) {
			const logFilesPattern = /.log/;
			const logFiles = fs
				.readdirSync(filepath)
				.filter((file) => logFilesPattern.test(file))
				.sort((a, b) => {
					const aStat = fs.statSync(path.join(filepath, a));
					const bStat = fs.statSync(path.join(filepath, b));
					return aStat.mtime.getTime() - bStat.mtime.getTime();
				});
			const filesToDelete = logFiles.slice(
				0,
				logFiles.length - config.register_limit,
			); // Get the oldest files to delete
			filesToDelete.forEach((file) => {
				const filePath = path.join(filepath, file);
				fs.unlinkSync(filePath);
			});
		}
	},
});

export type LoggingsRegisterOptions = {
	onPreMessage?: LoggingsPluginData<LoggingsRegisterConfig>["onPreMessage"];
	onMessage?: LoggingsPluginData<LoggingsRegisterConfig>["onMessage"];
	onSend?: LoggingsPluginData<LoggingsRegisterConfig>["onSend"];
	onInit?: LoggingsPluginData<LoggingsRegisterConfig>["onInit"];
};

export type LoggingsRegisterConfig = {
	/**
	 * Allows register logs in file, on {register_dir}
	 */
	register: boolean;
	/**
	 * Allows you to delete the logs, if you exceed the limit configured
	 * in "register_limit", if "register_limit" is 0, it will be ignored
	 */
	register_del: boolean;
	/**
	 * Loggings Level
	 * Register-specific level will be used
	 */
	register_level?: LoggingsLevel;
	/**
	 * Sets how many log files will be needed to start deleting old files,
	 * if "register_del" is disabled or the value set is 0,
	 * this option will be ignored
	 */
	register_limit: number;
	/**
	 * Directory where the files will be stored, if "register" is disabled, it will be ignored
	 */
	register_dir: string;
	/**
	 * Register Format locale file.
	 *
	 * Suported Args:  {register_dir} | {status} | {title}
	 *
	 * @default "{register_dir}/{status}"
	 */
	register_locale_file: string;
	/**
	 * Register File Format locale file.
	 *
	 * Main Args:  {ext} | {status}
	 *
	 * Timer Args: {day} | {month} | {year} | {hours} | {minutes}| {seconds} | {milliseconds}
	 *
	 * @default "{day}_{month}_{year}.{ext}"
	 */
	register_filename: string;
	/**
	 * Register Format, in registration logs,
	 *
	 * Main Args:  {status} | {message} | {title}
	 *
	 * Timer Args: {day} | {month} | {year} | {hours} | {minutes}| {seconds} | {milliseconds}
	 *
	 * @default "[ {day}/{month}/{year} in {hours}:{minutes}:{seconds} ] [ _.{title}._ ]{message}"
	 */
	register_format: string;
};
