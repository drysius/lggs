/**
 * Export various modules and types required for the logging system.
 */
export * from "./types";
export * from "./libs/defaults";
export * from "./libs/inspect";
export * from "./libs/pallet";
export * from "./libs/plugins/console";
export * from "./libs/plugins/register";
export * from "./libs/utils";
export * from "./libs/formatkits";
import { LoggingsPallet } from "./libs/pallet";
import { Console } from "console";
import defaults, { type LoggingsBaseConfig } from "./libs/defaults";
import { ConsolePlugin } from "./libs/plugins/console";
import { RegisterPlugin } from "./libs/plugins/register";
import type { LoggingsLevel, LoggingsMessage, LoggingsPlugin, LoggingsPluginData } from "./types";
import { deepMerge } from "./libs/utils";

/**
 * Default plugins used in the logging system.
 */
export const LoggingsDefaultPlugins = [ConsolePlugin, RegisterPlugin];
declare const global: typeof globalThis & { __INTERNAL_LOGGINGS_INSTANCE__: InstanceType<typeof Loggings> , };

/**
 * Loggings class extends the built-in Console class and provides
 * a structured logging system with plugin support.
 */
export class Loggings<
    Config extends object = {}
> extends Console {
    /**
     * Global logging configuration.
     */
    public static configs: Record<string, any> = defaults;

    /**
     * Instance-specific logging configuration overrides.
     */
    public configs: Partial<Config & LoggingsBaseConfig>;

    /**
     * Get all instance configurations including plugins configurations,
     * merging Global Configs -> Plugin Defaults -> Instance Configs.
     */
    public get allconfigs(): Config & LoggingsBaseConfig {
        const pluginDefaults = Loggings.pluginLoader(this.plugins).map(a => a.default);
        // Start with Global Configs
        // Merge Plugin Defaults
        // Merge Instance Configs
        return deepMerge({} as Record<string, any>, Loggings.configs, ...pluginDefaults, this.configs) as Config & LoggingsBaseConfig;
    }

    /**
     * Get all Globals configurations including plugins configurations
     */
    public static get allconfigs() {
        const pluginDefaults = Loggings.pluginLoader(this.plugins).map(a => a.default);
        return deepMerge({}, Loggings.configs, ...pluginDefaults);
    }

    /**
     * Default plugins applied globally.
     */
    public static plugins: LoggingsPlugin<any>[] = LoggingsDefaultPlugins;

    /**
     * Instance-specific plugins.
     */
    public plugins: LoggingsPlugin<any>[] = LoggingsDefaultPlugins;

    /**
     * Constructor with title and optional color/advanced config.
     * @param title Title of the logger.
     * @param color Color of the title.
     * @param advanced Advanced configuration.
     */
    constructor(title: string, color?: keyof typeof LoggingsPallet, advanced?: Partial<LoggingsBaseConfig & Config>);
    /**
     * Constructor with configuration object.
     * @param config Configuration object.
     */
    constructor(config?: Partial<LoggingsBaseConfig & Config>);
    /**
     * Constructor implementation.
     */
    constructor(opts?: Partial<LoggingsBaseConfig & Config> | string, color: keyof typeof LoggingsPallet = "blue", advanced: Partial<LoggingsBaseConfig & Config> = {}) {
        super(process.stdout, process.stderr);
        const IsOpt = typeof opts == "object";
        
        // Handle plugins from options if passed (legacy support or direct passing)
        const plugins = (IsOpt ? (opts as any)?.plugins ?? [] : []) || (advanced as any)?.plugins || [];
        if (plugins.length > 0) {
             this.plugins = [...this.plugins, ...plugins];
        }

        const initialConfig = { color, ...advanced, ...(typeof opts == "string" ? { title: opts } : opts) };
        this.configs = initialConfig as Partial<Config & LoggingsBaseConfig>;
        
        Loggings.pluginLoader(this.plugins).forEach((plugin) => {
            if (plugin.onInit) plugin.onInit(this.allconfigs);
        });
    }

    /**
     * Loads plugins into the logging system.
     *
     * @param instance_plugins List of plugins to be loaded.
     * @param nostatic Whether to skip static plugin loading.
     * @returns Loaded plugin data.
     */
    public static pluginLoader<Plugins extends LoggingsPlugin<any>[]>(instance_plugins: Plugins, nostatic = false): LoggingsPluginData<any>[] {
        const plugins: Record<string, LoggingsPluginData<any>> = {};

        if (!nostatic) Loggings.plugins.forEach((p) => {
            const plugin = typeof p === "function" ? p() : p;
            plugins[plugin.ident] = plugin;
        });

        instance_plugins.forEach((p) => {
            const plugin = typeof p === "function" ? p() : p;
            plugins[plugin.ident] = plugin;
        });
        return Object.values(plugins);
    }

    /**
     * Adds a plugin to the instance.
     * 
     * @param plugin The plugin to add.
     * @param config Optional configuration for the plugin.
     * @returns The Loggings instance.
     */
    public plugin<T extends object, LoggingsExtended extends Loggings<any> = Loggings<Config & T>>(plugin: LoggingsPlugin<T>, config?: T): LoggingsExtended {
        this.plugins.push(plugin);
        if (config) {
            this.configs = deepMerge(this.configs, config);
        }
        
        // Re-init the new plugin
        const pluginData = typeof plugin === 'function' ? plugin() : plugin;
        if (pluginData.onInit) {
            pluginData.onInit(this.allconfigs as unknown as T);
        }
        
        return this as unknown as LoggingsExtended;
    }

    /**
     * Adds a global plugin.
     * 
     * @param plugin The plugin to add.
     * @param config Optional configuration for the plugin.
     * @returns The Loggings class.
     */
    public static plugin<T extends object, LoggingsConfigd extends Loggings<any> = Loggings<T>>(plugin: LoggingsPlugin<T>, config?: T): typeof Loggings {
        Loggings.plugins.push(plugin);
        if (config) {
            Loggings.configs = deepMerge(Loggings.configs, config);
        }
        return Loggings;
    }

    /**
     * Updates the logging configuration dynamically.
     *
     * @param advanced New configuration settings.
     * @returns Updated Loggings instance.
     */
    public config<LoggingsConfigd extends Loggings<any> = Loggings<Config>>(advanced: Partial<(LoggingsConfigd extends Loggings<infer C> ? C : any) & LoggingsBaseConfig> & { plugins?: LoggingsPlugin<any>[] } = {}): LoggingsConfigd {
        if (advanced?.plugins) {
            this.plugins = advanced.plugins;
        }
        // Use deepMerge to update configs
        this.configs = deepMerge(this.configs, advanced as any);
        
        Loggings.pluginLoader(this.plugins, true).forEach((plugin) => {
            if (plugin.onInit) plugin.onInit(this.allconfigs);
        });
        return this as unknown as LoggingsConfigd;
    }

    /**
     * Updates Global logging configuration dynamically.
     *
     * @param advanced New configuration settings.
     * @returns Updated Loggings instance.
     */
    public static config<LoggingsConfigd extends Loggings<any> = Loggings>(
        advanced: Partial<(LoggingsConfigd extends Loggings<infer C> ? C : any) & LoggingsBaseConfig> &
        { plugins?: LoggingsPlugin<any>[] } = {}): LoggingsConfigd {
        if (advanced?.plugins) {
            Loggings.plugins = advanced.plugins;
        }
        Loggings.configs = deepMerge(Loggings.configs, advanced);
        
        Loggings.pluginLoader(Loggings.plugins, true).forEach((plugin) => {
            if (plugin.onInit) plugin.onInit(this.allconfigs);
        });
        return new Loggings(advanced) as unknown as LoggingsConfigd;
    }

    /**
     * Overrides the global console with the logging system.
     *
     * @param logger Logging instance to be used as console.
     */
    public static useConsole(logger: InstanceType<typeof Loggings>) {
        global.__INTERNAL_LOGGINGS_INSTANCE__ = logger;
        global.console = {
            ...global.console,
            log: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "info"),
            error: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "error"),
            warn: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "warn"),
            info: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "info"),
            debug: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "debug"),
            trace: (...messages) => global.__INTERNAL_LOGGINGS_INSTANCE__.controller(messages, "trace"),
        };
    }

    /**
     * Controls message logging using the configured plugins.
     *
     * @param msgs Messages to be logged.
     * @param level Log level.
     */
    public controller(msgs: LoggingsMessage[], level: LoggingsLevel) {
        const fullConfig = this.allconfigs; // Compute once
        Loggings.pluginLoader(this.plugins).forEach((plugin) => {
            try {
                let messages = plugin.onPreMessage ? plugin.onPreMessage(fullConfig, level, msgs) : msgs;
                if (messages && plugin.onMessage) {
                    const message = plugin.onMessage(fullConfig, level, messages);
                    if (plugin.onSend) plugin.onSend(fullConfig, level, message);
                }
            } catch (e) {
                if (plugin.onError) plugin.onError(fullConfig, e as Error);
                else throw e;
            }
        });
    }

    /** Logging methods */
    public log(...messages: LoggingsMessage[]) { this.controller(messages, "info"); return this; }
    public debug(...messages: LoggingsMessage[]) { this.controller(messages, "debug"); return this; }
    public error(...messages: LoggingsMessage[]) { this.controller(messages, "error"); return this; }
    public trace(...messages: LoggingsMessage[]) { this.controller(messages, "trace"); return this; }
    public info(...messages: LoggingsMessage[]) { this.controller(messages, "info"); return this; }
    public warn(...messages: LoggingsMessage[]) { this.controller(messages, "warn"); return this; }
    public txt(...messages: LoggingsMessage[]) { this.controller(messages, "txt"); return this; }

}

export default Loggings;
