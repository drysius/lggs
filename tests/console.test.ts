import { describe, it, expect, mock, beforeAll, afterAll } from "bun:test";
import Lggs from "../src/lggs";
import { setRuntime, Runtime } from "../src/libs/utils";

describe("Lggs Console Plugin", () => {
    // We force Node runtime to be able to mock process.stdout/stderr easily if needed,
    // although Bun has its own way, the library checks `runtime` variable.
    beforeAll(() => {
        setRuntime(Runtime.Node);
    });

    afterAll(() => {
        setRuntime(Runtime.Bun);
    });

    it("should write to stdout for info level", () => {
        const logger = new Lggs({ 
            title: "ConsoleTest", 
            console: true,
            level: "info"
        });

        const originalStdout = process.stdout.write;
        const mockStdout = mock((str: string | Uint8Array) => true);
        process.stdout.write = mockStdout as any;

        try {
            logger.info("Test Info");
            expect(mockStdout).toHaveBeenCalled();
            const callArgs = mockStdout.mock.calls[0][0].toString();
            expect(callArgs).toContain("Test Info");
        } finally {
            process.stdout.write = originalStdout;
        }
    });

    it("should write to stderr for error level", () => {
        const logger = new Lggs({ 
            title: "ConsoleTest", 
            console: true 
        });

        const originalStderr = process.stderr.write;
        const mockStderr = mock((str: string | Uint8Array) => true);
        process.stderr.write = mockStderr as any;

        try {
            logger.error("Test Error");
            expect(mockStderr).toHaveBeenCalled();
            const callArgs = mockStderr.mock.calls[0][0].toString();
            expect(callArgs).toContain("Test Error");
        } finally {
            process.stderr.write = originalStderr;
        }
    });

    it("should respect log levels (ignore debug when level is info)", () => {
        const logger = new Lggs({ 
            title: "LevelTest", 
            console: true,
            level: "info" 
        });

        const mockStdout = mock(() => true);
        const originalStdout = process.stdout.write;
        process.stdout.write = mockStdout as any;

        try {
            logger.debug("Should not appear");
            expect(mockStdout).not.toHaveBeenCalled();

            logger.info("Should appear");
            expect(mockStdout).toHaveBeenCalled();
        } finally {
            process.stdout.write = originalStdout;
        }
    });
});
