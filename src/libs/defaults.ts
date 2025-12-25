import type {
	LggsFormatKitFunction,
	LggsLevel,
	LggsPlugin,
} from "../types";
import { LGGS_FORMATKITS } from "./formatkits";

export type LggsBaseConfig = {
	level: LggsLevel;
	title: string;
	formatKits: LggsFormatKitFunction[];
};

const defaults = {
	level: "info" as LggsLevel,
	title: "Lggs",
	formatKits: LGGS_FORMATKITS,
} satisfies LggsBaseConfig;

export default defaults;

export type LggsConstructorConfig<
	Plugins extends
		readonly LggsPlugin<any>[] = readonly LggsPlugin<any>[],
> = Partial<LggsBaseConfig> & {
	plugins?: Plugins;
};
