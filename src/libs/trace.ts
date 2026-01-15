import { Runtime, runtime } from "./utils";

export interface CallerInfo {
	file: string;
	line: string;
	column: string;
	function: string;
}

/**
 * Get caller info from stack trace
 */
export function getCallerInfo(ignore: string[] = []): CallerInfo {
	const error = new Error();
	const stack = error.stack?.split("\n") || [];
	let caller: CallerInfo = {
		file: "unknown",
		line: "0",
		column: "0",
		function: "unknown",
	};

	// Default ignore patterns
	const ignorePatterns = [
		"node:internal",
		"node_modules",
		"lggs/src", // ignore self
		"lggs/dist", // ignore self build
		"native", // ignore native frames
		...ignore,
	];

	for (let i = 0; i < stack.length; i++) {
		const line = stack[i];
		if (!line.includes("at ")) continue;

		// Skip internal/library frames
		if (ignorePatterns.some((pattern) => line.includes(pattern))) continue;

		// Extract info
		// Format: "    at functionName (file:line:column)" or "    at file:line:column"
		const match = line.match(/at\s+(?:(.+?)\s+\()?([A-Z]:.+?|\/?.+?):(\d+):(\d+)\)?/i);
		
		if (match) {
			const func = match[1] || "anonymous";
			const file = match[2];
            const lineNum = match[3];
            const colNum = match[4];

            // Verify if it is not inside the library itself (double check)
            if (file.includes("lggs") && (file.includes("src") || file.includes("dist"))) continue;

			            let relativeFile = file;
						try {
							if (runtime === Runtime.Node || runtime === Runtime.Bun) {
								const cwd = process.cwd().replace(/\\/g, "/");
								const target = file.replace(/\\/g, "/");
								relativeFile = target.replace(new RegExp(`^${cwd}/?`, "i"), "");
							}
						} catch {
							// keep absolute if fails
						}
			caller = {
				file: relativeFile,
				line: lineNum,
				column: colNum,
				function: func,
			};
            
            // We found the first frame that is NOT ignored.
            // But we need to make sure it's not the logger internals.
            // The loop continues until we find a valid user frame.
            // If the current frame is "getCallerInfo" or "ConsolePlugin", we skip.
            // But we already filtered "lggs/src".
            
			break;
		}
	}

	return caller;
}
