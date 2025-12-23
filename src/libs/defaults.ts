import type { LoggingsFormatKitFunction, LoggingsLevel, LoggingsPlugin } from "../types";
import { LOGGINGS_FORMATKITS } from "./formatkits";

export default {
  level: "info",
  title: "Loggings",
  formatKits: LOGGINGS_FORMATKITS,
  plugins: []
} as LoggingsBaseConfig;

export type LoggingsBaseConfig = {
  /**
   * Global Level of show and write logs
   * Supported Levels: "error" | "warn" | "info" | "debug"
   * @default "info"
   */
  level: LoggingsLevel;
  /**
   * Title of logger
   * 
   * @since Loggings v1.0.0
   */
  title: string;
  /**
   * Loggings FormatKits
   * 
   * FormatKits define how Loggings processes color and style formatting in logs.  
   * This is an advanced technology that enables even more flexible customization,  
   * allowing log texts to be dynamically transformed and personalized.  
   * 
   * ⚠️ **Advanced Feature**: Do not modify this parameter unless you know exactly what you are doing.
   * 
   * @since Loggings v3.0.0
   * @default
   * ```ts
   * import Loggings, { LoggingsPallet } from "loggings";
   * const logger = new Loggings();
   * logger.config({
   *     formatKits: [
   *          (nocolor, text) => LoggingsPallet.strikethrough + text + LoggingsPallet.reset,
   *     ]
   * });
   * logger.log("This is ~not~ funny");
   * ```
   */
  formatKits: LoggingsFormatKitFunction[];
};

export type LoggingsConstructorConfig<Plugins extends LoggingsPlugin<any>[] = []> = {
  /**
   * Loggings plugins
   * @default [ConsolePlugin, RegisterPlugin]
   */
  plugins: Plugins;
} & LoggingsBaseConfig; 