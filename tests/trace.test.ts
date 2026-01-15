import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import Lggs from "../src/lggs";
import { RegisterPlugin } from "../src/libs/plugins/register";

const LOG_DIR = "./tests/logs_trace";

describe("Lggs Trace Features", () => {
	beforeAll(() => {
		if (fs.existsSync(LOG_DIR)) {
			fs.rmSync(LOG_DIR, { recursive: true, force: true });
		}
	});

	afterAll(() => {
		if (fs.existsSync(LOG_DIR)) {
			fs.rmSync(LOG_DIR, { recursive: true, force: true });
		}
	});

	test("should log filename and line number with {file}", async () => {
		const logger = new Lggs({
			register_dir: LOG_DIR,
			register_filename: "trace.log",
			register_format: "{file} | {message}",
			register: true,
			tracefile: true,
			plugins: [
				RegisterPlugin(),
			],
		});

		logger.info("Trace Test"); // This is line 33 (approx)

		// Wait for FS
		await new Promise((r) => setTimeout(r, 100));

		const logFile = path.join(LOG_DIR, "trace.log");
		expect(fs.existsSync(logFile)).toBe(true);

		const content = fs.readFileSync(logFile, "utf-8");
		console.log("Log content:", content);
		
		expect(content).toContain("trace.test.ts");
		// The line number should be around 33
		expect(content).toMatch(/tests[\\/]trace.test.ts:\d+/);
		expect(content).toContain("| Trace Test");
	});
});
