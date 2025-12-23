import type {
	LoggingsFormatKitFunction,
	LoggingsLevel,
	LoggingsPlugin,
} from "../types";
import { LOGGINGS_FORMATKITS } from "./formatkits";

export type LoggingsBaseConfig = {
	level: LoggingsLevel;
	title: string;
	formatKits: LoggingsFormatKitFunction[];
};

const defaults = {
	level: "info" as LoggingsLevel,
	title: "Loggings",
	formatKits: LOGGINGS_FORMATKITS,
} satisfies LoggingsBaseConfig;

export default defaults;

export type LoggingsConstructorConfig<
	Plugins extends
		readonly LoggingsPlugin<any>[] = readonly LoggingsPlugin<any>[],
> = Partial<LoggingsBaseConfig> & {
	plugins?: Plugins;
};
