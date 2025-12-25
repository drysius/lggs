/**
 * Export various modules and types required for the logging system.
 */

export * from "./libs/defaults";
export * from "./libs/formatkits";
export * from "./libs/inspect";
export * from "./libs/pallet";
export * from "./libs/plugins/console";
export * from "./libs/plugins/register";
export * from "./libs/utils";
export * from "./types";

import { Console } from "node:console";
import defaults, { type LggsBaseConfig } from "./libs/defaults";
import type { LggsPallet } from "./libs/pallet";
import { ConsolePlugin } from "./libs/plugins/console";
import { RegisterPlugin } from "./libs/plugins/register";
import { deepMerge } from "./libs/utils";
import type {
	LggsLevel,
	LggsMessage,
	LggsPlugin,
	LggsPluginData,
	PluginConfigOf,
	PluginsConfigOf,
} from "./types";

/**
 * Initialization options for the Lggs class.
 * Allows partial configuration of base settings and plugin-specific settings.
 *
 * @template Extra - Additional custom configuration properties.
 * @template Ps - List of plugins to initialize with.
 */
export type LggsInitOptions<
	Extra extends object,
	Ps extends readonly LggsPlugin<any>[] = readonly LggsPlugin<any>[],
> = Partial<Extra & PluginsConfigOf<Ps>> & {
	/**
	 * Optional array of plugins to be used by the instance.
	 */
	plugins?: Ps;
};

/**
 * Default plugins used in the logging system if none are specified.
 */
export const LggsDefaultPlugins = [ConsolePlugin, RegisterPlugin] as const;

declare const global: typeof globalThis & {
	/**
	 * Internal global storage for the lggs instance when overriding the global console.
	 */
	__INTERNAL_LGGS_INSTANCE__: InstanceType<typeof Lggs>;
};

/**
 * Lggs Class
 *
 * A high-performance, structured logging system that extends the native Console.
 * Supports a flexible plugin system, gradients, custom formatting kits, and deep configuration merging.
 *
 * @template Config - The configuration object type for this instance.
 * @template Ps - The tuple of plugins used by this instance.
 */
export class Lggs<
	const in out Config extends LggsBaseConfig = typeof defaults,
	const in out Ps extends
		readonly LggsPlugin<any>[] = typeof LggsDefaultPlugins,
> extends Console {
	/**
	 * Global logging configuration.
	 * Changes here affect all instances that do not override specific properties.
	 */
	public static configs: Record<string, any> = defaults;

	/**
	 * Instance-specific logging configuration overrides.
	 * These properties take precedence over global configurations.
	 */
	public configs: Partial<Config & LggsBaseConfig & PluginsConfigOf<Ps>>;

	/**
	 * Default plugins applied globally to every new instance.
	 */
	public static plugins: LggsPlugin<any>[] = [...LggsDefaultPlugins];

	/**
	 * Instance-specific plugins.
	 * Includes both global defaults and instance-added plugins.
	 */
	public plugins: LggsPlugin<any>[] = [...LggsDefaultPlugins];

	/**
	 * Get all instance configurations including plugin configurations.
	 * Merges: Global Defaults -> Plugin Defaults -> Instance Overrides.
	 *
	 * @returns The fully merged configuration object.
	 */
	public get allconfigs(): Config & LggsBaseConfig & PluginsConfigOf<Ps> {
		const pluginDefaults = Lggs.pluginLoader(this.plugins).map(
			(a) => a.default,
		);
		return deepMerge(
			{} as Record<string, any>,
			Lggs.configs,
			...pluginDefaults,
			this.configs,
		) as Config & LggsBaseConfig & PluginsConfigOf<Ps>;
	}

	/**
	 * Get all global configurations including global plugin defaults.
	 *
	 * @returns The fully merged global configuration object.
	 */
	public static get allconfigs() {
		const pluginDefaults = Lggs.pluginLoader(Lggs.plugins).map(
			(a) => a.default,
		);
		return deepMerge({}, Lggs.configs, ...pluginDefaults);
	}

	/**
	 * Constructor using an options object.
	 *
	 * @param config - The initialization options including base config and plugins.
	 */
	constructor(config?: LggsInitOptions<Config, Ps>);
	/**
	 * Constructor using legacy title and color parameters.
	 *
	 * @param title - The title of the logger instance.
	 * @param color - The color key for the title (from LggsPallet).
	 * @param advanced - Additional advanced configurations.
	 */
	constructor(
		title: string,
		color?: keyof typeof LggsPallet,
		advanced?: LggsInitOptions<Config, Ps>,
	);
	/**
	 * Internal constructor implementation supporting both object-based and positional arguments.
	 */
	constructor(
		opts?: LggsInitOptions<Config, Ps> | string,
		color: keyof typeof LggsPallet = "blue",
		advanced: LggsInitOptions<Config, Ps> = {},
	) {
		super(process.stdout, process.stderr);
		const IsOpt = typeof opts === "object" && opts !== null;

		const plugins =
			(IsOpt ? ((opts as any)?.plugins ?? []) : []) ||
			(advanced as any)?.plugins ||
			[];
		if (plugins.length > 0) {
			//override plugins
			this.plugins = plugins;
		}

		const initialConfig = {
			color,
			...advanced,
			...(typeof opts === "string" ? { title: opts } : opts),
		};

		this.configs = initialConfig as Partial<
			Config & LggsBaseConfig & PluginsConfigOf<Ps>
		>;

		Lggs.pluginLoader(this.plugins).forEach((plugin) => {
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
	public static pluginLoader<Plugins extends readonly LggsPlugin<any>[]>(
		instance_plugins: Plugins,
		nostatic = false,
	): LggsPluginData<any>[] {
		const plugins: Record<string, LggsPluginData<any>> = {};

		if (!nostatic) {
			Lggs.plugins.forEach((p) => {
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
	public plugin<P extends LggsPlugin<any>>(
		plugin: P,
		config?: Partial<PluginConfigOf<P>>,
	): Lggs<Config & PluginConfigOf<P>, readonly [...Ps, P]> {
		this.plugins.push(plugin);

		if (config) this.configs = deepMerge(this.configs, config);

		const pluginData = (
			typeof plugin === "object" ? plugin : plugin()
		) as LggsPluginData<any>;
		if (pluginData.onInit) pluginData.onInit(this.allconfigs as any);

		return this as any;
	}

	/**
	 * Adds a plugin globally to all future logger instances.
	 *
	 * @template T - The plugin configuration type.
	 * @param plugin - The plugin to register.
	 * @param config - Optional global default configuration for this plugin.
	 * @returns The Lggs class for chaining.
	 */
	public static plugin<T extends object>(
		plugin: LggsPlugin<T>,
		config?: T,
	): typeof Lggs {
		Lggs.plugins.push(plugin);
		if (config) Lggs.configs = deepMerge(Lggs.configs, config);
		return Lggs;
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
		const EConfig extends LggsBaseConfig = typeof defaults,
		const EPs extends readonly LggsPlugin<any>[] = Ps,
	>(
		advanced: LggsInitOptions<EConfig, EPs> & Partial<PluginsConfigOf<Ps>>,
	): Lggs<EConfig & Config, readonly [...EPs, ...Ps]> {
		this.configs = deepMerge(this.configs, advanced as any);

		if (advanced.plugins) {
			Lggs.pluginLoader(advanced.plugins, true).forEach((plugin) => {
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
	 * @returns The Lggs class for chaining.
	 */
	public static config<
		const EConfig extends LggsBaseConfig = typeof defaults,
		const EPs extends
			readonly LggsPlugin<any>[] = typeof LggsDefaultPlugins,
	>(advanced: LggsInitOptions<EConfig, EPs>) {
		Lggs.configs = deepMerge(Lggs.configs, advanced);

		if (advanced?.plugins) {
			Lggs.pluginLoader(advanced.plugins, false).forEach((plugin) => {
				if (plugin.onInit) plugin.onInit(Lggs.allconfigs as any);
			});
			Lggs.plugins.push(...advanced.plugins);
		}

		return Lggs;
	}

	/**
	 * Overrides the global `console` with this specific logger instance.
	 * Allows native `console.log`, `console.error`, etc., to use Lggs' formatting and plugins.
	 *
	 * @param logger - The Lggs instance to use as the global console.
	 */
	public static useConsole(logger: InstanceType<typeof Lggs>) {
		global.__INTERNAL_LGGS_INSTANCE__ = logger;
		global.console = {
			...global.console,
			log: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "info"),
			error: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "error"),
			warn: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "warn"),
			info: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "info"),
			debug: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "debug"),
			trace: (...messages) =>
				global.__INTERNAL_LGGS_INSTANCE__.controller(messages, "trace"),
		};
	}

	/**
	 * Internal controller that coordinates message processing through all registered plugins.
	 * Executes lifecycle hooks: onPreMessage -> onMessage -> onSend.
	 *
	 * @param msgs - The raw messages to log.
	 * @param level - The log level (info, error, debug, etc.).
	 */
	public controller(msgs: LggsMessage[], level: LggsLevel) {
		const fullConfig = this.allconfigs;

		Lggs.pluginLoader(this.plugins).forEach((plugin) => {
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
	public log(...messages: LggsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	/** Log message with DEBUG level */
	public debug(...messages: LggsMessage[]) {
		this.controller(messages, "debug");
		return this;
	}
	/** Log message with ERROR level */
	public error(...messages: LggsMessage[]) {
		this.controller(messages, "error");
		return this;
	}
	/** Log message with TRACE level */
	public trace(...messages: LggsMessage[]) {
		this.controller(messages, "trace");
		return this;
	}
	/** Log message with INFO level (alias) */
	public info(...messages: LggsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	/** Log message with WARN level */
	public warn(...messages: LggsMessage[]) {
		this.controller(messages, "warn");
		return this;
	}
	/** Log raw text message without status formatting */
	public txt(...messages: LggsMessage[]) {
		this.controller(messages, "txt");
		return this;
	}
}

export default Lggs;
