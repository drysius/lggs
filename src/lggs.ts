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

export type LggsInitOptions<
	Extra extends object,
	Ps extends readonly LggsPlugin<any>[] = readonly LggsPlugin<any>[],
> = Partial<Extra & PluginsConfigOf<Ps>> & {
	plugins?: Ps;
};

export const LggsDefaultPlugins = [ConsolePlugin, RegisterPlugin] as const;

declare const global: typeof globalThis & {
	__INTERNAL_LGGS_INSTANCE__: InstanceType<typeof Lggs>;
};

type Cache<T> = { stamp: string; value: T } | null;

export class Lggs<
	const in out Config extends LggsBaseConfig = typeof defaults,
	const in out Ps extends
		readonly LggsPlugin<any>[] = typeof LggsDefaultPlugins,
> extends Console {
	public static configs: Record<string, any> = defaults;
	public configs: Partial<Config & LggsBaseConfig & PluginsConfigOf<Ps>>;

	public static plugins: LggsPlugin<any>[] = [...LggsDefaultPlugins];
	public plugins: LggsPlugin<any>[] = [...LggsDefaultPlugins];

	private static globalVersion = 0;
	private static globalCache: Cache<Record<string, any>> = null;

	private localConfigVersion = 0;
	private localPluginVersion = 0;
	private pluginCache: Cache<LggsPluginData<any>[]> = null;
	private configCache: Cache<Config & LggsBaseConfig & PluginsConfigOf<Ps>> = null;

	private static normalizePlugins<Plugins extends readonly LggsPlugin<any>[]>(
		instancePlugins: Plugins,
		nostatic = false,
	): LggsPluginData<any>[] {
		const map = new Map<string, LggsPluginData<any>>();

		if (!nostatic) {
			for (const raw of Lggs.plugins) {
				const plugin = typeof raw === "function" ? raw() : raw;
				map.set(plugin.ident, plugin);
			}
		}

		for (const raw of instancePlugins) {
			const plugin = typeof raw === "function" ? raw() : raw;
			map.set(plugin.ident, plugin);
		}

		return Array.from(map.values());
	}

	private static bumpGlobalVersion() {
		Lggs.globalVersion++;
		Lggs.globalCache = null;
	}

	private bumpConfigVersion() {
		this.localConfigVersion++;
		this.configCache = null;
	}

	private bumpPluginVersion() {
		this.localPluginVersion++;
		this.pluginCache = null;
		this.configCache = null;
	}

	private getResolvedPlugins() {
		const stamp = `${Lggs.globalVersion}:${this.localPluginVersion}`;
		if (this.pluginCache?.stamp === stamp) {
			return this.pluginCache.value;
		}

		const value = Lggs.normalizePlugins(this.plugins as any);
		this.pluginCache = { stamp, value };
		return value;
	}

	private runInitHooks(plugins: LggsPluginData<any>[]) {
		const config = this.allconfigs;
		for (const plugin of plugins) {
			if (plugin.onInit) plugin.onInit(config as any);
		}
	}

	public get allconfigs(): Config & LggsBaseConfig & PluginsConfigOf<Ps> {
		const stamp = `${Lggs.globalVersion}:${this.localConfigVersion}:${this.localPluginVersion}`;
		if (this.configCache?.stamp === stamp) {
			return this.configCache.value;
		}

		const pluginDefaults = this.getResolvedPlugins().map((a) => a.default);
		const value = deepMerge(
			{} as Record<string, any>,
			Lggs.configs,
			...pluginDefaults,
			this.configs,
		) as Config & LggsBaseConfig & PluginsConfigOf<Ps>;
		this.configCache = { stamp, value };
		return value;
	}

	public static get allconfigs() {
		const stamp = String(Lggs.globalVersion);
		if (Lggs.globalCache?.stamp === stamp) {
			return Lggs.globalCache.value;
		}

		const pluginDefaults = Lggs.normalizePlugins(Lggs.plugins as any).map(
			(a) => a.default,
		);
		const value = deepMerge({}, Lggs.configs, ...pluginDefaults);
		Lggs.globalCache = { stamp, value };
		return value;
	}

	constructor(config?: LggsInitOptions<Config, Ps>);
	constructor(
		title: string,
		color?: keyof typeof LggsPallet,
		advanced?: LggsInitOptions<Config, Ps>,
	);
	constructor(
		opts?: LggsInitOptions<Config, Ps> | string,
		color: keyof typeof LggsPallet = "blue",
		advanced: LggsInitOptions<Config, Ps> = {},
	) {
		super(process.stdout, process.stderr);

		const isOptionsObject = typeof opts === "object" && opts !== null;
		const plugins =
			(isOptionsObject ? ((opts as any)?.plugins ?? []) : []) ||
			(advanced as any)?.plugins ||
			[];

		if (plugins.length > 0) {
			this.plugins = [...plugins];
			this.bumpPluginVersion();
		}

		this.configs = {
			color,
			...advanced,
			...(typeof opts === "string" ? { title: opts } : opts),
		} as Partial<Config & LggsBaseConfig & PluginsConfigOf<Ps>>;

		this.runInitHooks(this.getResolvedPlugins());
	}

	public static pluginLoader<Plugins extends readonly LggsPlugin<any>[]>(
		instance_plugins: Plugins,
		nostatic = false,
	): LggsPluginData<any>[] {
		return Lggs.normalizePlugins(instance_plugins, nostatic);
	}

	public plugin<P extends LggsPlugin<any>>(
		plugin: P,
		config?: Partial<PluginConfigOf<P>>,
	): Lggs<Config & PluginConfigOf<P>, readonly [...Ps, P]> {
		this.plugins.push(plugin);
		this.bumpPluginVersion();

		if (config) {
			this.configs = deepMerge(this.configs, config);
			this.bumpConfigVersion();
		}

		const pluginData = (
			typeof plugin === "object" ? plugin : plugin()
		) as LggsPluginData<any>;
		if (pluginData.onInit) {
			pluginData.onInit(this.allconfigs as any);
		}

		return this as any;
	}

	public static plugin<T extends object>(
		plugin: LggsPlugin<T>,
		config?: T,
	): typeof Lggs {
		Lggs.plugins.push(plugin);
		if (config) {
			Lggs.configs = deepMerge(Lggs.configs, config);
		}
		Lggs.bumpGlobalVersion();
		return Lggs;
	}

	public config<
		const EConfig extends LggsBaseConfig = typeof defaults,
		const EPs extends readonly LggsPlugin<any>[] = Ps,
	>(
		advanced: LggsInitOptions<EConfig, EPs> & Partial<PluginsConfigOf<Ps>>,
	): Lggs<EConfig & Config, readonly [...EPs, ...Ps]> {
		this.configs = deepMerge(this.configs, advanced as any);
		this.bumpConfigVersion();

		if (advanced.plugins) {
			const normalized = Lggs.normalizePlugins(advanced.plugins, true);
			const fullConfig = this.allconfigs;
			for (const plugin of normalized) {
				if (plugin.onInit) plugin.onInit(fullConfig as any);
			}
			this.plugins.push(...advanced.plugins);
			this.bumpPluginVersion();
		}

		return this as never;
	}

	public static config<
		const EConfig extends LggsBaseConfig = typeof defaults,
		const EPs extends
			readonly LggsPlugin<any>[] = typeof LggsDefaultPlugins,
	>(advanced: LggsInitOptions<EConfig, EPs>) {
		Lggs.configs = deepMerge(Lggs.configs, advanced);
		if (advanced?.plugins) {
			const normalized = Lggs.normalizePlugins(advanced.plugins, false);
			const fullConfig = Lggs.allconfigs;
			for (const plugin of normalized) {
				if (plugin.onInit) plugin.onInit(fullConfig as any);
			}
			Lggs.plugins.push(...advanced.plugins);
		}
		Lggs.bumpGlobalVersion();
		return Lggs;
	}

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

	public controller(msgs: LggsMessage[], level: LggsLevel) {
		const fullConfig = this.allconfigs;
		const plugins = this.getResolvedPlugins();

		for (const plugin of plugins) {
			try {
				const messages = plugin.onPreMessage
					? plugin.onPreMessage(fullConfig as any, level, msgs)
					: msgs;
				if (!messages || !plugin.onMessage) continue;
				const message = plugin.onMessage(fullConfig as any, level, messages);
				if (plugin.onSend) plugin.onSend(fullConfig as any, level, message);
			} catch (e) {
				if (plugin.onError) plugin.onError(fullConfig as any, e as Error);
				else throw e;
			}
		}
	}

	public log(...messages: LggsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	public debug(...messages: LggsMessage[]) {
		this.controller(messages, "debug");
		return this;
	}
	public error(...messages: LggsMessage[]) {
		this.controller(messages, "error");
		return this;
	}
	public trace(...messages: LggsMessage[]) {
		this.controller(messages, "trace");
		return this;
	}
	public info(...messages: LggsMessage[]) {
		this.controller(messages, "info");
		return this;
	}
	public warn(...messages: LggsMessage[]) {
		this.controller(messages, "warn");
		return this;
	}
	public txt(...messages: LggsMessage[]) {
		this.controller(messages, "txt");
		return this;
	}
}

export default Lggs;
