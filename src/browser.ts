/**
 * Export various modules and types required for the logging system (Browser Version).
 */

export * from "./libs/defaults";
export * from "./libs/formatkits";
export * from "./libs/inspect";
export * from "./libs/pallet";
export * from "./libs/plugins/console";
export * from "./libs/utils";
export * from "./types";

import defaults, { type LoggingsBaseConfig } from "./libs/defaults";
import type { LoggingsPallet } from "./libs/pallet";
import { ConsolePlugin } from "./libs/plugins/console";
import { deepMerge } from "./libs/utils";
import type {
	LoggingsLevel,
	LoggingsMessage,
	LoggingsPlugin,
	LoggingsPluginData,
	PluginConfigOf,
	PluginsConfigOf,
} from "./types";

/**
 * Initialization options for the Loggings class.
 * Allows partial configuration of base settings and plugin-specific settings.
 *
 * @template Extra - Additional custom configuration properties.
 * @template Ps - List of plugins to initialize with.
 */
export type LoggingsInitOptions<
	Extra extends object,
	Ps extends readonly LoggingsPlugin<any>[] = readonly LoggingsPlugin<any>[],
> = Partial<Extra & PluginsConfigOf<Ps>> & {
	/**
	 * Optional array of plugins to be used by the instance.
	 */
	plugins?: Ps;
};

/**
 * Default plugins used in the browser logging system.
 * Only ConsolePlugin is included by default for browser environments.
 */
export const LoggingsDefaultPlugins = [ConsolePlugin] as const;

/**
 * Loggings Class (Browser Version)
 *
 * A lightweight version of Loggings optimized for browser environments.
 * It does not extend the native Console and removes Node.js specific features like file registration.
 *
 * @template Config - The configuration object type for this instance.
 * @template Ps - The tuple of plugins used by this instance.
 */
export class Loggings<
	const in out Config extends LoggingsBaseConfig = typeof defaults,
	const in out Ps extends
		readonly LoggingsPlugin<any>[] = typeof LoggingsDefaultPlugins,
> {
	/**
	 * Global logging configuration.
	 * Changes here affect all instances that do not override specific properties.
	 */
	public static configs: Record<string, any> = defaults;

	/**
	 * Instance-specific logging configuration overrides.
	 * These properties take precedence over global configurations.
	 */
	public configs: Partial<Config & LoggingsBaseConfig & PluginsConfigOf<Ps>>;

	/**
	 * Default plugins applied globally to every new instance.
	 */
	public static plugins: LoggingsPlugin<any>[] = [...LoggingsDefaultPlugins];

	/**
	 * Instance-specific plugins.
	 * Includes both global defaults and instance-added plugins.
	 */
	public plugins: LoggingsPlugin<any>[] = [...LoggingsDefaultPlugins];

	/**
	 * Get all instance configurations including plugin configurations.
	 * Merges: Global Defaults -> Plugin Defaults -> Instance Overrides.
	 *
	 * @returns The fully merged configuration object.
	 */
	public get allconfigs(): Config & LoggingsBaseConfig & PluginsConfigOf<Ps> {
		const pluginDefaults = Loggings.pluginLoader(this.plugins).map(
			(a) => a.default,
		);
		return deepMerge(
			{} as Record<string, any>,
			Loggings.configs,
			...pluginDefaults,
			this.configs,
		) as Config & LoggingsBaseConfig & PluginsConfigOf<Ps>;
	}

	/**
	 * Get all global configurations including global plugin defaults.
	 *
	 * @returns The fully merged global configuration object.
	 */
	public static get allconfigs() {
		const pluginDefaults = Loggings.pluginLoader(Loggings.plugins).map(
			(a) => a.default,
		);
		return deepMerge({}, Loggings.configs, ...pluginDefaults);
	}

	/**
	 * Constructor using an options object.
	 *
	 * @param config - The initialization options including base config and plugins.
	 */
	constructor(config?: LoggingsInitOptions<Config, Ps>);
	/**
	 * Constructor using legacy title and color parameters.
	 *
	 * @param title - The title of the logger instance.
	 * @param color - The color key for the title (from LoggingsPallet).
	 * @param advanced - Additional advanced configurations.
	 */
	constructor(
		title: string,
		color?: keyof typeof LoggingsPallet,
		advanced?: LoggingsInitOptions<Config, Ps>,
	);
	/**
	 * Internal constructor implementation supporting both object-based and positional arguments.
	 */
	constructor(
		opts?: LoggingsInitOptions<Config, Ps> | string,
		color: keyof typeof LoggingsPallet = "blue",
		advanced: LoggingsInitOptions<Config, Ps> = {},
	) {
		const IsOpt = typeof opts === "object" && opts !== null;

		const plugins =
			(IsOpt ? ((opts as any)?.plugins ?? []) : []) ||
			(advanced as any)?.plugins ||
			[];
		if (plugins.length > 0) {
			this.plugins = [...this.plugins, ...plugins];
		}

		const initialConfig = {
			color,
			...advanced,
			...(typeof opts === "string" ? { title: opts } : opts),
		};

		this.configs = initialConfig as Partial<
			Config & LoggingsBaseConfig & PluginsConfigOf<Ps>
		>;

		Loggings.pluginLoader(this.plugins).forEach((plugin) => {
			if (plugin.onInit) plugin.onInit(this.allconfigs as any);
		});
	}

	/**
	 * Loads and normalizes plugins (handling both objects and generator functions).
	 * Automatically merges global static plugins unless `nostatic` is set to true.
	 *
	 * @param instance_plugins - Plugins specific to the instance.
	 * @param nostatic - If true, ignores globally registered plugins.
	 * @returns An array of normalized plugin data objects.
	 */
	public static pluginLoader<Plugins extends readonly LoggingsPlugin<any>[]>(
		instance_plugins: Plugins,
		nostatic = false,
	): LoggingsPluginData<any>[] {
		const plugins: Record<string, LoggingsPluginData<any>> = {};

		if (!nostatic) {
			Loggings.plugins.forEach((p) => {
				const plugin = typeof p === "function" ? p() : p;
				plugins[plugin.ident] = plugin;
			});
		}

		instance_plugins.forEach((p) => {
			const plugin = typeof p === "function" ? p() : p;
			plugins[plugin.ident] = plugin;
		});

		return Object.values(plugins);
	}

	/**
	 * Adds a plugin to this specific logger instance.
	 * This method accumulates type information for the configuration.
	 *
	 * @template P - The plugin type.
	 * @param plugin - The plugin instance or function.
	 * @param config - Optional initial configuration for this plugin.
	 * @returns The logger instance with updated type information.
	 */
	public plugin<P extends LoggingsPlugin<any>>(
		plugin: P,
		config?: Partial<PluginConfigOf<P>>,
	): Loggings<Config & PluginConfigOf<P>, readonly [...Ps, P]> {
		this.plugins.push(plugin);

		if (config) this.configs = deepMerge(this.configs, config);

		const pluginData = (
			typeof plugin === "object" ? plugin : plugin()
		) as LoggingsPluginData<any>;
		if (pluginData.onInit) pluginData.onInit(this.allconfigs as any);

		return this as any;
	}

	/**
	 * Adds a plugin globally to all future logger instances.
	 *
	 * @template T - The plugin configuration type.
	 * @param plugin - The plugin to register.
	 * @param config - Optional global default configuration for this plugin.
	 * @returns The Loggings class for chaining.
	 */
	public static plugin<T extends object>(
		plugin: LoggingsPlugin<T>,
		config?: T,
	): typeof Loggings {
		Loggings.plugins.push(plugin);
		if (config) Loggings.configs = deepMerge(Loggings.configs, config);
		return Loggings;
	}

	/**
	 * Updates the configuration of this logger instance.
	 *
	 * @template EConfig - Additional configuration types to merge.
	 * @template EPs - Additional plugins to add via config.
	 * @param advanced - The new configuration options.
	 * @returns The updated logger instance.
	 */
	public config<
		const EConfig extends LoggingsBaseConfig = typeof defaults,
		const EPs extends readonly LoggingsPlugin<any>[] = Ps,
	>(
		advanced: LoggingsInitOptions<EConfig, EPs> & Partial<PluginsConfigOf<Ps>>,
	): Loggings<EConfig & Config, readonly [...EPs, ...Ps]> {
		this.configs = deepMerge(this.configs, advanced as any);

		if (advanced.plugins) {
			Loggings.pluginLoader(advanced.plugins, true).forEach((plugin) => {
				if (plugin.onInit) plugin.onInit(this.allconfigs as any);
			});
			this.plugins.push(...advanced.plugins);
		}

		return this as never;
	}

	/**
	 * Updates the global logging configuration.
	 *
	 * @template EConfig - Global configuration type extension.
	 * @template EPs - Global plugin extension.
	 * @param advanced - The global configuration options to apply.
	 * @returns The Loggings class for chaining.
	 */
	public static config<
		const EConfig extends LoggingsBaseConfig = typeof defaults,
		const EPs extends
			readonly LoggingsPlugin<any>[] = typeof LoggingsDefaultPlugins,
	>(advanced: LoggingsInitOptions<EConfig, EPs>) {
		Loggings.configs = deepMerge(Loggings.configs, advanced);

		if (advanced?.plugins) {
			Loggings.pluginLoader(advanced.plugins, false).forEach((plugin) => {
				if (plugin.onInit) plugin.onInit(Loggings.allconfigs as any);
			});
			Loggings.plugins.push(...advanced.plugins);
		}

		return Loggings;
	}

	/**
	 * Internal controller that coordinates message processing through all registered plugins.
	 * Executes lifecycle hooks: onPreMessage -> onMessage -> onSend.
	 *
	 * @param msgs - The raw messages to log.
	 * @param level - The log level (info, error, debug, etc.).
	 */
	public controller(msgs: LoggingsMessage[], level: LoggingsLevel) {
		const fullConfig = this.allconfigs;

		Loggings.pluginLoader(this.plugins).forEach((plugin) => {
			try {
				const messages = plugin.onPreMessage
					? plugin.onPreMessage(fullConfig as any, level, msgs)
					: msgs;
				if (messages && plugin.onMessage) {
					const message = plugin.onMessage(fullConfig as any, level, messages);
					if (plugin.onSend) plugin.onSend(fullConfig as any, level, message);
				}
			} catch (e) {
				if (plugin.onError) plugin.onError(fullConfig as any, e as Error);
				else throw e;
			}
		});
	}

	/** Log message with INFO level */
	public log(...messages: LoggingsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	/** Log message with DEBUG level */
	public debug(...messages: LoggingsMessage[]) {
		this.controller(messages, "debug");
		return this;
	}
	/** Log message with ERROR level */
	public error(...messages: LoggingsMessage[]) {
		this.controller(messages, "error");
		return this;
	}
	/** Log message with TRACE level */
	public trace(...messages: LoggingsMessage[]) {
		this.controller(messages, "trace");
		return this;
	}
	/** Log message with INFO level (alias) */
	public info(...messages: LoggingsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	/** Log message with WARN level */
	public warn(...messages: LoggingsMessage[]) {
		this.controller(messages, "warn");
		return this;
	}
	/** Log raw text message without status formatting */
	public txt(...messages: LoggingsMessage[]) {
		this.controller(messages, "txt");
		return this;
	}
}

export default Loggings;
