import { rgb } from "./utils";

/**
 * Palette created with the shades supported by tailwind,
 * but instead of using "color-num" use "colornum"
 * @example "slate10" // equivalent slate-100
 */
export const LoggingsTailwindColors = {
	slate5: "#f8fafc",
	slate10: "#f1f5f9",
	slate20: "#e2e8f0",
	slate30: "#cbd5e1",
	slate40: "#94a3b8",
	slate50: "#64748b",
	slate60: "#475569",
	slate70: "#334155",
	slate80: "#1e293b",
	slate90: "#0f172a",
	slate95: "#020617",
	gray5: "#f9fafb",
	gray10: "#f3f4f6",
	gray20: "#e5e7eb",
	gray30: "#d1d5db",
	gray40: "#9ca3af",
	gray50: "#6b7280",
	gray60: "#4b5563",
	gray70: "#374151",
	gray80: "#1f2937",
	gray90: "#111827",
	gray95: "#030712",
	zinc5: "#fafafa",
	zinc10: "#f4f4f5",
	zinc20: "#e4e4e7",
	zinc30: "#d4d4d8",
	zinc40: "#a1a1aa",
	zinc50: "#71717a",
	zinc60: "#52525b",
	zinc70: "#3f3f46",
	zinc80: "#27272a",
	zinc90: "#18181b",
	zinc95: "#09090b",
	neutral5: "#fafafa",
	neutral10: "#f5f5f5",
	neutral20: "#e5e5e5",
	neutral30: "#d4d4d4",
	neutral40: "#a3a3a3",
	neutral50: "#737373",
	neutral60: "#525252",
	neutral70: "#404040",
	neutral80: "#262626",
	neutral90: "#171717",
	neutral95: "#0a0a0a",
	stone5: "#fafaf9",
	stone10: "#f5f5f4",
	stone20: "#e7e5e4",
	stone30: "#d6d3d1",
	stone40: "#a8a29e",
	stone50: "#78716c",
	stone60: "#57534e",
	stone70: "#44403c",
	stone80: "#292524",
	stone90: "#1c1917",
	stone95: "#0c0a09",
	red5: "#fef2f2",
	red10: "#fee2e2",
	red20: "#fecaca",
	red30: "#fca5a5",
	red40: "#f87171",
	red50: "#ef4444",
	red60: "#dc2626",
	red70: "#b91c1c",
	red80: "#991b1b",
	red90: "#7f1d1d",
	red95: "#450a0a",
	orange5: "#fff7ed",
	orange10: "#ffedd5",
	orange20: "#fed7aa",
	orange30: "#fdba74",
	orange40: "#fb923c",
	orange50: "#f97316",
	orange60: "#ea580c",
	orange70: "#c2410c",
	orange80: "#9a3412",
	orange90: "#7c2d12",
	orange95: "#431407",
	amber5: "#fffbeb",
	amber10: "#fef3c7",
	amber20: "#fde68a",
	amber30: "#fcd34d",
	amber40: "#fbbf24",
	amber50: "#f59e0b",
	amber60: "#d97706",
	amber70: "#b45309",
	amber80: "#92400e",
	amber90: "#78350f",
	amber95: "#451a03",
	yellow5: "#fefce8",
	yellow10: "#fef9c3",
	yellow20: "#fef08a",
	yellow30: "#fde047",
	yellow40: "#facc15",
	yellow50: "#eab308",
	yellow60: "#ca8a04",
	yellow70: "#a16207",
	yellow80: "#854d0e",
	yellow90: "#713f12",
	yellow95: "#422006",
	lime5: "#f7fee7",
	lime10: "#ecfccb",
	lime20: "#d9f99d",
	lime30: "#bef264",
	lime40: "#a3e635",
	lime50: "#84cc16",
	lime60: "#65a30d",
	lime70: "#4d7c0f",
	lime80: "#3f6212",
	lime90: "#365314",
	lime95: "#1a2e05",
	green5: "#f0fdf4",
	green10: "#dcfce7",
	green20: "#bbf7d0",
	green30: "#86efac",
	green40: "#4ade80",
	green50: "#22c55e",
	green60: "#16a34a",
	green70: "#15803d",
	green80: "#166534",
	green90: "#14532d",
	green95: "#052e16",
	emerald5: "#ecfdf5",
	emerald10: "#d1fae5",
	emerald20: "#a7f3d0",
	emerald30: "#6ee7b7",
	emerald40: "#34d399",
	emerald50: "#10b981",
	emerald60: "#059669",
	emerald70: "#047857",
	emerald80: "#065f46",
	emerald90: "#064e3b",
	emerald95: "#022c22",
	teal5: "#f0fdfa",
	teal10: "#ccfbf1",
	teal20: "#99f6e4",
	teal30: "#5eead4",
	teal40: "#2dd4bf",
	teal50: "#14b8a6",
	teal60: "#0d9488",
	teal70: "#0f766e",
	teal80: "#115e59",
	teal90: "#134e4a",
	teal95: "#042f2e",
	cyan5: "#ecfeff",
	cyan10: "#cffafe",
	cyan20: "#a5f3fc",
	cyan30: "#67e8f9",
	cyan40: "#22d3ee",
	cyan50: "#06b6d4",
	cyan60: "#0891b2",
	cyan70: "#0e7490",
	cyan80: "#155e75",
	cyan90: "#164e63",
	cyan95: "#083344",
	sky5: "#f0f9ff",
	sky10: "#e0f2fe",
	sky20: "#bae6fd",
	sky30: "#7dd3fc",
	sky40: "#38bdf8",
	sky50: "#0ea5e9",
	sky60: "#0284c7",
	sky70: "#0369a1",
	sky80: "#075985",
	sky90: "#0c4a6e",
	sky95: "#082f49",
	blue5: "#eff6ff",
	blue10: "#dbeafe",
	blue20: "#bfdbfe",
	blue30: "#93c5fd",
	blue40: "#60a5fa",
	blue50: "#3b82f6",
	blue60: "#2563eb",
	blue70: "#1d4ed8",
	blue80: "#1e40af",
	blue90: "#1e3a8a",
	blue95: "#172554",
	indigo5: "#eef2ff",
	indigo10: "#e0e7ff",
	indigo20: "#c7d2fe",
	indigo30: "#a5b4fc",
	indigo40: "#818cf8",
	indigo50: "#6366f1",
	indigo60: "#4f46e5",
	indigo70: "#4338ca",
	indigo80: "#3730a3",
	indigo90: "#312e81",
	indigo95: "#1e1b4b",
	violet5: "#f5f3ff",
	violet10: "#ede9fe",
	violet20: "#ddd6fe",
	violet30: "#c4b5fd",
	violet40: "#a78bfa",
	violet50: "#8b5cf6",
	violet60: "#7c3aed",
	violet70: "#6d28d9",
	violet80: "#5b21b6",
	violet90: "#4c1d95",
	violet95: "#2e1065",
	purple5: "#faf5ff",
	purple10: "#f3e8ff",
	purple20: "#e9d5ff",
	purple30: "#d8b4fe",
	purple40: "#c084fc",
	purple50: "#a855f7",
	purple60: "#9333ea",
	purple70: "#7e22ce",
	purple80: "#6b21a8",
	purple90: "#581c87",
	purple95: "#3b0764",
	fuchsia5: "#fdf4ff",
	fuchsia10: "#fae8ff",
	fuchsia20: "#f5d0fe",
	fuchsia30: "#f0abfc",
	fuchsia40: "#e879f9",
	fuchsia50: "#d946ef",
	fuchsia60: "#c026d3",
	fuchsia70: "#a21caf",
	fuchsia80: "#86198f",
	fuchsia90: "#701a75",
	fuchsia95: "#4a044e",
	pink5: "#fdf2f8",
	pink10: "#fce7f3",
	pink20: "#fbcfe8",
	pink30: "#f9a8d4",
	pink40: "#f472b6",
	pink50: "#ec4899",
	pink60: "#db2777",
	pink70: "#be185d",
	pink80: "#9d174d",
	pink90: "#831843",
	pink95: "#500724",
	rose5: "#fff1f2",
	rose10: "#ffe4e6",
	rose20: "#fecdd3",
	rose30: "#fda4af",
	rose40: "#fb7185",
	rose50: "#f43f5e",
	rose60: "#e11d48",
	rose70: "#be123c",
	rose80: "#9f1239",
	rose90: "#881337",
	rose95: "#4c0519",
} as const;

export const LoggingsAnsiSpecials = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	italic: "\x1b[3m",
	underline: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	strikethrough: "\x1b[9m",
	none: "\x1b[22m",
};
export const LoggingsCommonPallet = {
	red: "#ff0000",
	green: "#00ff00",
	lime: "#80ff80",
	blue: "#0000ff",
	yellow: "#ffff00",
	cyan: "#00ffff",
	magenta: "#ff00ff",
	black: "#000000",
	white: "#ffffff",
	gray: "#808080",
	maroon: "#800000",
	olive: "#808000",
	navy: "#000080",
	purple: "#800080",
	teal: "#008080",
	silver: "#c0c0c0",
	indigo: "#4b0082",
	gold: "#ffd700",
	pink: "#ffc0cb",
	orange: "#ffa500",
	brown: "#a52a2a",
	peach: "#ffdab9",
	lavender: "#e6e6fa",
	coral: "#ff7f50",
	turquoise: "#40e0d0",
	salmon: "#fa8072",
	olivebrab: "#6b8e23",
	slate: "#708090",
	lsgreen: "#20b2aa",
	dorange: "#ff8c00",
	khaki: "#f0e68c",
	mvred: "#c71585",
	dsalmon: "#e9967a",
	lpink: "#ffb6c1",
	dgray: "#696969",
	gainsboro: "#dcdcdc",
};
export const LoggingsPallet = {
	...LoggingsCommonPallet,
	...LoggingsAnsiSpecials,
	...LoggingsTailwindColors,
};
const Pallet = {
	...LoggingsCommonPallet,
	...LoggingsTailwindColors,
};
/**
 * Loggings convert hex to hexadecimal number
 */
export const toHexadecimal = (color: string | number) => {
	let current: string | null = null;

	if (typeof color === "number") {
		return color;
	}

	if (typeof color === "string" && /^#[0-9A-Fa-f]{6}$/i.test(color)) {
		let hex = color;
		hex = hex.replace(/^#/, "");
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((h) => h + h)
				.join("");
		}
		if (hex.length === 6) {
			return parseInt(hex, 16);
		}
	}

	if (!current && Object.keys(Pallet).includes(color as keyof typeof Pallet)) {
		current = Pallet[color as keyof typeof Pallet];
	}

	if (!current) {
		current = Pallet.white;
	}

	return parseInt(current.replace("#", ""), 16);
};

/**
 * Convert Hexadecimal to terminal colors
 * @example termcolor("#FFFFFF") // text terminal color
 * @example termcolor("\x1b[4m") // return "\x1b[4m"
 * @example termcolor("slate5", true) // background terminal color
 * @example termcolor("slate-50") // equivalent "slate5" text terminal color
 * @example termcolor(2553641265); rgb(255, 0, 0)() // equivalent "slate5" text terminal color
 */
export const termcolor = (
	color: string | number,
	background: boolean = false,
): string => {
	if (typeof color === "number") {
		const r = (color >> 24) & 255;
		const g = (color >> 16) & 255;
		const b = (color >> 8) & 255;
		return rgb(r, g, b)(background);
	}

	if (color.startsWith("#")) {
		let hex = color;
		hex = hex.replace(/^#/, "");
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((h) => h + h)
				.join("");
		}
		if (hex.length === 6) {
			const bigint = parseInt(hex, 16);
			return rgb(
				(bigint >> 16) & 255,
				(bigint >> 8) & 255,
				bigint & 255,
			)(background);
		}
	}

	if (LoggingsPallet[color as keyof typeof LoggingsPallet]) {
		const palletcolor = LoggingsPallet[color as keyof typeof LoggingsPallet];
		return termcolor(palletcolor, background);
	}

	//tailwind color
	if (color.includes("-")) {
		const tailcolor = color.replace("-", "");
		return termcolor(tailcolor.slice(0, tailcolor.length - 1), background);
	}

	if (/^\\x1b\[/.test(color)) {
		return color;
	}

	return LoggingsAnsiSpecials.reset;
};

export function colorpik(
	key: string,
	text: string,
	extra: Record<string, string> = {},
): string {
	const color = extra[key];
	switch (true) {
		case typeof color === "undefined": {
			const color = termcolor(key);
			if (color) {
				return color + text + LoggingsAnsiSpecials.reset;
			}
			return text;
		}
		case color === "none": {
			return text;
		}
		default: {
			return termcolor(color) + text + LoggingsAnsiSpecials.reset;
		}
	}
}

/**
 * Colors
 */
export const Colors = colorpik;
