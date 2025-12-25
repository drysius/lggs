/**
 * Represents the components of a formatted time string.
 * @property {number} timestamp - Unix timestamp in milliseconds.
 * @property {string} year - 4-digit year.
 * @property {string} month - 2-digit month (01-12).
 * @property {string} day - 2-digit day (01-31).
 * @property {string} hours - 2-digit hour (00-23).
 * @property {string} minutes - 2-digit minute (00-59).
 * @property {string} seconds - 2-digit second (00-59).
 * @property {string} milliseconds - 3-digit millisecond (000-999).
 */
export type TimerFormat = {
	timestamp: number;
	year: string;
	month: string;
	day: string;
	hours: string;
	minutes: string;
	seconds: string;
	milliseconds: string;
};

/**
 * Supported logging levels.
 * - `info`: General informational messages.
 * - `debug`: Debugging information, verbose.
 * - `warn`: Warning conditions that should be addressed.
 * - `trace`: Detailed trace information for debugging.
 * - `error`: Error conditions that might be fatal.
 * - `txt`: Plain text output without specific level formatting.
 */
export type LggsLevel =
	| "info"
	| "debug"
	| "warn"
	| "trace"
	| "error"
	| "txt";

/**
 * Function signature for custom formatting kits.
 * Allows transformation of log text, typically for applying styles or colors.
 *
 * @param nocolor - Whether color/style codes should be stripped/disabled.
 * @param input - The text to format.
 * @returns The formatted string.
 */
export type LggsFormatKitFunction = (
	nocolor: boolean,
	input: string,
) => string;

/**
 * Any type of message that can be logged.
 */
export type LggsMessage = any;

/**
 * Definition of a Lggs Plugin.
 * Contains metadata, lifecycle hooks, and default configuration.
 *
 * @template PluginConfig - The configuration object specific to this plugin.
 */
export type LggsPluginData<PluginConfig extends object = {}> = {
	/** Unique identifier for the plugin. */
	ident: string;
	/** Default configuration values for the plugin. */
	default: PluginConfig;
	/**
	 * Called when the logger is initialized or configured.
	 * @param config - The fully merged configuration.
	 */
	onInit?(config: PluginConfig): unknown;
	/**
	 * Called before a message is processed. Can transform the message or prevent logging.
	 * @param config - The current configuration.
	 * @param level - The log level.
	 * @param messages - The messages to be logged.
	 * @returns Modified messages array, or `undefined` to cancel logging.
	 */
	onPreMessage?(
		config: PluginConfig,
		level: LggsLevel,
		messages: LggsMessage[],
	): LggsMessage[] | undefined;
	/**
	 * Called to format the message. Returns the final string representation.
	 * @param config - The current configuration.
	 * @param level - The log level.
	 * @param messages - The processed messages.
	 * @returns The formatted log string.
	 */
	onMessage?(
		config: PluginConfig,
		level: LggsLevel,
		messages: LggsMessage[],
	): string;
	/**
	 * Called to output the message (e.g., to console, file, or network).
	 * @param config - The current configuration.
	 * @param level - The log level.
	 * @param message - The final formatted message string.
	 */
	onSend?(config: PluginConfig, level: LggsLevel, message: string): unknown;
	/**
	 * Called when an error occurs within the plugin lifecycle.
	 * @param config - The current configuration.
	 * @param error - The error object.
	 */
	onError?(config: PluginConfig, error: Error): unknown;
};

/**
 * A plugin can be either a plugin data object or a function returning one (factory pattern).
 */
export type LggsPlugin<T extends object = {}> =
	| LggsPluginData<T>
	| (() => LggsPluginData<T>);

/**
 * Utility type to convert a union of types to an intersection.
 * Used to merge plugin configurations.
 */
export type UnionToIntersection<U> = [U] extends [never]
	? {}
	: (U extends any ? (k: U) => void : never) extends (k: infer I) => void
		? I
		: {};

/** Unwraps a plugin factory to get the plugin data type. */
export type UnwrapPlugin<P> = P extends (...args: any[]) => infer R ? R : P;

/** Extracts the configuration type from a plugin. */
export type PluginConfigOf<P> =
	UnwrapPlugin<P> extends LggsPluginData<infer C extends object> ? C : {};

/** Extracts and merges the configuration types of an array of plugins. */
export type PluginsConfigOf<Ps extends readonly LggsPlugin<any>[]> =
	UnionToIntersection<PluginConfigOf<Ps[number]>>;
