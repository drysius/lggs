import { describe, it, expect } from "bun:test";
import Loggings from "../src/loggings";
import { ConsolePlugin } from "../src/libs/plugins/console";

describe("Loggings Core", () => {
    it("should instantiate with default configuration", () => {
        const logger = new Loggings("TestLogger");
        expect(logger).toBeInstanceOf(Loggings);
        expect(logger.allconfigs.title).toBe("TestLogger");
        expect(logger.allconfigs.level).toBe("info");
    });

    it("should accept configuration object in constructor", () => {
        const logger = new Loggings({
            title: "ConfigTest",
            level: "debug",
            color: "red"
        });
        expect(logger.configs.title).toBe("ConfigTest");
        expect(logger.configs.level).toBe("debug");
        expect(logger.configs.color).toBe("red");
    });

    it("should allow dynamic configuration updates", () => {
        const logger = new Loggings("UpdateTest");
        expect(logger.allconfigs.level).toBe("info");

        logger.config({ level: "error", });
        expect(logger.allconfigs.level).toBe("error");
    });

    it("should handle plugins correctly", () => {
        const logger = new Loggings("PluginTest");
        expect(logger.plugins.length).toBeGreaterThan(0); // Should have defaults

        // Custom plugin
        const customPlugin = () => ({
            ident: "custom-plugin",
            default: {},
            onMessage: () => "custom"
        });

        logger.plugin(customPlugin);
        const hasPlugin = logger.plugins.some((p: any) => 
            (typeof p === 'function' ? p().ident : p.ident) === "custom-plugin"
        );
        expect(hasPlugin).toBe(true);
    });
    
    it("should support static configuration", () => {
        // Warning: this modifies global state, might affect other tests if not careful.
        // But we are just checking if the method exists and runs without error.
        Loggings.config({ level: "warn" });
        expect(Loggings.configs.level).toBe("warn");
        
        // Reset
        Loggings.config({ level: "info" });
    });
});
