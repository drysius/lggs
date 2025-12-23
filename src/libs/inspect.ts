import { Runtime, runtime } from "./utils";
import { inspect as Inpector } from "node:util";

const opts = {
    depth: null,
    showHidden: false,
    showProxy: false,
    maxArrayLength: null,
    breakLength: Infinity,
    compact: false
};

const _inspect = (msg: any, nocolor: boolean = false) => {
    switch (runtime) {
        case Runtime.Node: {
            return Inpector(msg, {
                colors: !nocolor,
                ...opts
            });
        }
        case Runtime.Bun: {
            try {
                // @ts-expect-error @types/Bun not installed
                return Bun.inspect(msg, {
                    colors: !nocolor,
                    ...opts
                });
            } catch (e) {
                return String(msg);
            }
        }
        case Runtime.Deno: {
            try {
                // @ts-expect-error @types/Deno not installed
                return Deno.inspect(msg, {
                    colors: !nocolor,
                    ...opts
                });
            } catch (e) {
                return String(msg);
            }
        }
        default: {
            if (typeof msg === 'object') {
                try {
                    return JSON.stringify(msg, null, 2);
                } catch {
                    return String(msg);
                }
            }
            return String(msg);
        }
    }
}

export default _inspect;