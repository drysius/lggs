import type { LoggingsBaseConfig } from "./cdn";

/**
 * Timer Format
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
 * Supported levels of loggings
 */
export type LoggingsLevel = "info" | "debug" | "warn" | "trace" | "error" | "txt";
export type LoggingsFormatKitFunction = (nocolor: boolean, input: string) => string
export type LoggingsMessage = any;
export type LoggingsPlugin<T extends object = {}> = LoggingsPluginData<T> | (() => LoggingsPluginData<T>)
export type LoggingsPluginData<PluginConfig extends object> = {
    ident: string;
    default: PluginConfig;
    onInit?(config: PluginConfig): unknown;
    onPreMessage?(config: PluginConfig, level: LoggingsLevel, messages: LoggingsMessage[]): LoggingsMessage[] | undefined;
    onMessage?(config: PluginConfig, level: LoggingsLevel, messages: LoggingsMessage[]): string;
    onSend?(config: PluginConfig, level: LoggingsLevel, message: string): unknown;
    onError?(config: PluginConfig, error: Error): unknown;
}