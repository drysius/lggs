import { describe, it, expect } from "bun:test";
import { LggsFormatKitController, sprintf, LggsGrandient, LggsFormatParser } from "../src/libs/formatkits";

describe("Lggs FormatKits", () => {
    describe("sprintf", () => {
        it("should format strings (%s)", () => {
            expect(sprintf("Hello %s", "World")).toBe("Hello World");
        });

        it("should format numbers (%d, %i, %f)", () => {
            expect(sprintf("Int %d", 123.45)).toBe("Int 123");
            expect(sprintf("Int %i", 123.99)).toBe("Int 123");
            expect(sprintf("Float %f", 123.45)).toBe("Float 123.45");
        });

        it("should format JSON (%j)", () => {
            expect(sprintf("Obj %j", { a: 1 })).toBe('Obj {"a":1}');
        });

        it("should handle circular JSON safely", () => {
            const obj: any = { a: 1 };
            obj.b = obj;
            expect(sprintf("Circular %j", obj)).toBe("Circular [Circular]");
        });

        it("should use inspect for objects (%o, %O)", () => {
            const obj = { a: 1 };
            const result = sprintf("Inspect %O", obj);
            // Check for content, ignoring ANSI codes
            expect(result).toMatch(/Inspect.*{.*a.*:.*1.*}/s); 
        });
    });

    describe("Controller & Styling", () => {
        it("should parse legacy colors e.g. [text].red", () => {
            const text = "[Hello].red";
            const result = LggsFormatKitController(text);
            expect(result).toContain("\x1b[38;2;"); // RGB start
            expect(result).toContain("Hello");
            expect(result).toContain("\x1b[0m"); // Reset
        });

        it("should parse bold syntax *bold*", () => {
            const text = "*Bold Text*";
            const result = LggsFormatKitController(text);
            expect(result).toContain("\x1b[1m");
            expect(result).toContain("Bold Text");
        });

        it("should parse strikethrough ~text~", () => {
            const text = "~Strike~";
            const result = LggsFormatKitController(text);
            expect(result).toContain("\x1b[9m");
            expect(result).toContain("Strike");
        });

        it("should support gradients", () => {
            const text = "(Gradient)gd(red,blue)";
            // Use Controller to ensure all kits are applied
            const result = LggsFormatKitController(text);
            expect(result).not.toBe(text);
            expect(result).toMatch(/G.*r.*a.*d.*i.*e.*n.*t/);
        });

        it("should handle custom format parsers", () => {
            const customParser = LggsFormatParser(/@(\w+)@/, (nocolor, _, match) => {
                return `User: ${match}`;
            });
            
            const result = LggsFormatKitController("@drysius@", [customParser]);
            expect(result).toBe("User: drysius");
        });
        
        it("should strip colors when nocolor is true", () => {
            const text = "[Red].red *Bold*";
            const result = LggsFormatKitController(text, [], true);
            expect(result).toBe("Red Bold");
            expect(result).not.toContain("\x1b[");
        });
    });
});
