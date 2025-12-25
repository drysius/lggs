import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import Lggs from "../src/lggs";
import fs from "fs";
import path from "path";

describe("Lggs Register (File System)", () => {
    const testLogDir = "./test_logs";

    beforeAll(() => {
        if (fs.existsSync(testLogDir)) {
            fs.rmSync(testLogDir, { recursive: true, force: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(testLogDir)) {
            fs.rmSync(testLogDir, { recursive: true, force: true });
        }
    });

    it("should create log files", () => {
        const logger = new Lggs({
            title: "FileTest",
            register: true,
            register_dir: testLogDir,
            register_filename: "test.log"
        });

        logger.info("File log message");

        // Wait a bit for file I/O (sync in this lib, but safe to check)
        const filePath = path.join(testLogDir, "test.log");
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, "utf-8");
        expect(content).toContain("File log message");
        expect(content).toContain("FileTest");
    });

    it("should rotate/delete old files", () => {
        const rotateDir = "./test_logs_rotate";
        if (!fs.existsSync(rotateDir)) fs.mkdirSync(rotateDir);

        // Create dummy old files
        const file1 = path.join(rotateDir, "old1.log");
        const file2 = path.join(rotateDir, "old2.log");
        const file3 = path.join(rotateDir, "old3.log");

        fs.writeFileSync(file1, "old1");
        fs.writeFileSync(file2, "old2");
        fs.writeFileSync(file3, "old3");

        // Set mtime to ensure order (file1 oldest, file3 newest)
        const now = Date.now();
        fs.utimesSync(file1, (now - 3000) / 1000, (now - 3000) / 1000);
        fs.utimesSync(file2, (now - 2000) / 1000, (now - 2000) / 1000);
        fs.utimesSync(file3, (now - 1000) / 1000, (now - 1000) / 1000);

        const logger = new Lggs({
            title: "RotateTest",
            register: true,
            register_dir: rotateDir,
            register_filename: "current.log",
            register_limit: 2, // Keep only 2 files (current + 1 old)
            register_del: true
        });

        logger.info("New log triggering rotation");

        // Expectation: 
        // We had 3 files. We added 1 ("current.log"). Total 4.
        // Limit is 2. So 2 oldest should be deleted?
        // Let's check logic:
        // Lib logic: `logFiles.slice(0, logFiles.length - config.register_limit)` are deleted.
        // We have 4 files now (old1, old2, old3, current).
        // 4 - 2 = 2 files to delete.
        // Oldest are old1 and old2.

        const files = fs.readdirSync(rotateDir);
        expect(files).toContain("current.log");
        // old1 should be gone
        expect(fs.existsSync(file1)).toBe(false); 
        // old2 should be gone
        expect(fs.existsSync(file2)).toBe(false);
        // old3 might remain or current remains
        expect(files.length).toBeLessThanOrEqual(2);

        // Cleanup
        fs.rmSync(rotateDir, { recursive: true, force: true });
    });
});
