import { describe, it, expect } from "bun:test";
import { sprintf } from "../src/libs/formatkits";

describe("Complexity & Edge Cases", () => {
    it("should handle large objects in sprintf", () => {
        const largeObj: any = {};
        for (let i = 0; i < 2000; i++) {
            largeObj[`key_${i}`] = i;
        }

        const start = performance.now();
        const result = sprintf("Big: %O", [largeObj]);
        const end = performance.now();

        expect(result.length).toBeGreaterThan(1000);
        expect(end - start).toBeLessThan(500); // Should be reasonably fast
    });

    it("should handle deep nesting", () => {
        const deep: any = { a: { b: { c: { d: 1 } } } };
        let current = deep;
        for (let i = 0; i < 5; i++) {
            current.next = { val: i };
            current = current.next;
        }

        const result = sprintf("%O", [deep], true);
        expect(result.result).toContain("val: 4");
    });

    it("should not crash on invalid sprintf args", () => {
        expect(sprintf("%s %d", ["One"])).toBe("One %d"); // Missing arg
        expect(sprintf("%z", ["One"])).toBe("%z"); // Invalid specifier
    });
});
