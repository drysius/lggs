import type { LoggingsFormatKitFunction } from "../types";
import _inspect from "./inspect";
import { colorpik, LoggingsAnsiSpecials, toHexadecimal } from "./pallet";
import { rgb } from "./utils";

/**
 * Creates a logging format function that applies a parser based on a regex or string
 * and executes a callback to process the extracted values.
 *
 * @param {string | RegExp} parser - A regular expression or string to match patterns in the text.
 * @param {(nocolor: boolean, ...text: string[]) => string} cb - Callback function to handle the extracted values.
 *   - `nocolor`: Indicates whether color formatting should be disabled.
 *   - `...text`: Captured groups from the regex applied to the input text.
 * @returns {LoggingsFormatKitFunction} Returns a function that can be used to process formatted logs.
 *
 * @example
 * const parser = LoggingsFormatParser(/\[([^\]]+)\]\.(\w+)(-b)?/, (nocolor, _, text, key, boldFlag) => {
 *     let result = boldFlag ? "**" : "";
 *     result += key.toUpperCase() + ": " + text;
 *     return result;
 * });
 *
 * console.log(parser(false, "[hello].red")); // "RED: hello"
 * console.log(parser(false, "[world].blue-b")); // "**BLUE: world"
 */
export const LoggingsFormatParser = (
    parser: string | RegExp,
    cb: (nocolor: boolean, ...text: string[]) => string
): LoggingsFormatKitFunction => {
    return (nocolor, text) => {
        const regex = typeof parser === 'string' ? new RegExp(parser) : parser;
        return text.replace(regex, (...args) => cb(nocolor, ...args));
    };
};

/**
 * 
 * @param nocolor 
 * @param _ 
 * @param text 
 * @param _colors 
 * @returns 
 */
const GradientFunction = (nocolor: boolean, _: string, text: string, _colors: string) => {
    if (nocolor) return text;

    const interpolate = (colorA: number, colorB: number, factor: number) => {
        const rA = (colorA >> 16) & 255, gA = (colorA >> 8) & 255, bA = colorA & 255;
        const rB = (colorB >> 16) & 255, gB = (colorB >> 8) & 255, bB = colorB & 255;

        const r = Math.round(rA + (rB - rA) * factor);
        const g = Math.round(gA + (gB - gA) * factor);
        const b = Math.round(bA + (bB - bA) * factor);
        return rgb(r, g, b)();
    };

    const splited_colors = _colors.split(",");
    const colors = (splited_colors.length == 1 ? [splited_colors[0], splited_colors[0]] : splited_colors)
        .map(a => a.trim())
        .map(a => toHexadecimal(a));

    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    
    const emojiMatches = [];
    let match;
    while ((match = emojiRegex.exec(text)) !== null) {
        emojiMatches.push({
            index: match.index,
            length: match[0].length,
            emoji: match[0]
        });
    }

    const chars = [];
    let currentIndex = 0;
    for (const emoji of emojiMatches) {
        while (currentIndex < emoji.index) {
            chars.push({
                char: text[currentIndex],
                isEmoji: false
            });
            currentIndex++;
        }
        chars.push({
            char: emoji.emoji,
            isEmoji: true
        });
        currentIndex += emoji.length;
    }
    while (currentIndex < text.length) {
        chars.push({
            char: text[currentIndex],
            isEmoji: false
        });
        currentIndex++;
    }

    const textLength = chars.filter(c => !c.isEmoji).length;
    const sections = colors.length - 1;
    const section_length = Math.ceil(textLength / sections);

    let gradient = "";
    let charIndex = 0;
    
    for (const {char, isEmoji} of chars) {
        if (isEmoji) {
            gradient += char;
        } else {
            const index = Math.floor(charIndex / section_length);
            const factor = (charIndex - index * section_length) / section_length;
            const colorA = colors[index];
            const colorB = colors[Math.min(index + 1, colors.length - 1)];
            const result = interpolate(colorA, colorB, factor);
            gradient += result + char;
            charIndex++;
        }
    }

    return gradient + LoggingsAnsiSpecials.reset;
};

/**
 * Returns Gradient Text in terminal colors
 * 
 * @since Loggings v3.0.0
 */
export const LoggingsGrandient = (text: string) => LOGGINGS_FORMATKITS[2](false, text);

/**
 * Default Loggings Formatkits
 */
export const LOGGINGS_FORMATKITS: LoggingsFormatKitFunction[] = [
    /**
     * Loggings Legacy colors formatkit
     * 
     * @new Fragment/Fragment
     * @version 2.5.0v
     * @since Loggings v1.0.0
     * 
     * @example "[example text].green-b"
     */
    (nocolor, input) => {
        const pattern = /\[([^\[\]]+)\]\.(\w+)(-b)?/g;
        const fragments: {
            key: string;
            count: number;
            value: string;
            bold: boolean;
        }[] = [];
        let counter = 0;
        const fragment = (input: string): string => {
            let output = input;

            while (true) {
                const match = pattern.exec(output);
                if (!match) break;

                const [matched, value, key, boldFlag] = match;
                const isBold = boldFlag === "-b";
                const count = counter++;
                fragments.push({
                    key,
                    count,
                    value,
                    bold: isBold,
                });

                const replacement = `<__LOGGINGS_$${count}>`;
                output = output.replace(matched, replacement);
                pattern.lastIndex = 0;
            }

            return output;
        };

        const text = fragment(input);
        let result = text;
        fragments.reverse().forEach(frag => {
            const key = `<__LOGGINGS_$${frag.count}>`;
            let fragmented = frag.value;
            if (frag.bold) fragmented = nocolor ? fragmented : LoggingsAnsiSpecials.bold + fragmented;

            fragmented = nocolor ? fragmented : colorpik(frag.key, fragmented);
            result = result.replace(key, fragmented);
        });

        return result;
    },
    /**
     * Loggings Bold formatkit
     * 
     * @version 1.0.0v
     */
    LoggingsFormatParser("\\*(.*?)\\*", (nocolor, _, text) => nocolor ? text : colorpik('bold', text)),
    /**
     * Loggings Strikethrough formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("~(.*?)~", (nocolor, _, text) => nocolor ? text : colorpik('strikethrough', text)),
    /**
     * Loggings Italic formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("-(.*?)-", (nocolor, _, text) => nocolor ? text : colorpik('italic', text)),
    /**
     * Loggings Underline formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("_(.*?)_", (nocolor, _, text) => nocolor ? text : colorpik('underline', text)),
    /**
     * Loggings Blink formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("!(.*?)!", (nocolor, _, text) => nocolor ? text : colorpik('blink', text)),
    /**
     * Loggings Reverse formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("#(.*?)#", (nocolor, _, text) => nocolor ? text : colorpik('reverse', text)),
    /**
     * Loggings Gradient formatkit
     * 
     * @version 1.0.0v
     * @since Loggings v3.0.0
     */
    LoggingsFormatParser("\\(([^()]+)\\)gd\\((.*?)\\)", GradientFunction),
    LoggingsFormatParser("\\(([^()]+)\\)gb\\((.*?)\\)", GradientFunction),
];

/**
 * Sprintf implementation for Loggings
 */
export function sprintf(format: string, args: any[], nocolor: boolean): { result: string; consumed: number };
export function sprintf(format: string, ...args: any[]): string;
export function sprintf(format: string, ...args: any[]): string | { result: string; consumed: number } {
    const isInternal = Array.isArray(args[0]) && typeof args[1] === 'boolean';
    const actualArgs = isInternal ? args[0] : args;
    const nocolor = isInternal ? args[1] : false;

    let consumed = 0;
    const result = format.replace(/%([a-zA-Z%])/g, (match, char) => {
        if (match === '%%') return '%';
        if (consumed >= actualArgs.length) return match;

        const arg = actualArgs[consumed++];
        switch (char) {
            case 's': return String(arg);
            case 'd': return String(Math.floor(Number(arg)));
            case 'i': return String(parseInt(String(arg)));
            case 'f': return String(parseFloat(String(arg)));
            case 'j': try { return JSON.stringify(arg); } catch { return '[Circular]'; }
            case 'o':
            case 'O': return _inspect(arg, nocolor);
            default:
                consumed--; // didn't consume
                return match;
        }
    });

    if (isInternal) {
        return { result, consumed };
    }
    return result;
}

/**
 * Loggings FormatKit Controller
 * 
 * Processes text by applying the defined FormatKits, allowing logs to be styled
 * with various formats such as colors, bold, underline, and gradients.
 * 
 * @param texts - A string or an array of texts to be formatted.
 * @param extraformats - Additional custom FormatKits.
 * @param nocolor - Determines whether formatting should be disabled (returning plain text).
 * @returns Returns a formatted string with applied styling rules.
 * @since Loggings v3.0.0
 * @new Fragment/Fragmenter of loggings
 * 
 * @example
 * ```ts
 * const formatted = LoggingsFormatKitController("Text in *bold* and ~strikethrough~");
 * console.log(formatted); // Output formatted with ANSI codes
 * ```
 */
export const LoggingsFormatKitController = (
    texts: any | any[],
    extraformats: LoggingsFormatKitFunction[] = [],
    nocolor = false
) => {
    let inputs = Array.isArray(texts) ? texts : [texts];
    const tools = [...LOGGINGS_FORMATKITS, ...extraformats];
    let output: string[] = [];

    // Sprintf Support
    if (inputs.length > 0 && typeof inputs[0] === 'string' && inputs.length > 1) {
        // Simple heuristic: if string contains %, try sprintf
        // Or always try? Node.js util.format always tries.
        const { result, consumed } = sprintf(inputs[0], inputs.slice(1), nocolor);
        output.push(result);
        // Remove consumed args + format string
        inputs = inputs.slice(1 + consumed);
    }

    // Process remaining inputs
    inputs.forEach((input: any) => {
        if (typeof input === "string") {
            output.push(input);
        } else {
            output.push(_inspect(input, nocolor));
        }
    });

    // Apply FormatKits to all string parts
    output = output.map(current => {
        let changed = false;
        let iterations = 0;
        const max = 10;
        
        do {
            changed = false;
            tools.forEach(func => {
                const nextupt = func(nocolor, current);
                if (nextupt !== current) {
                    changed = true;
                    current = nextupt;
                }
            });
            iterations++;
        } while (changed && iterations < max);
        
        return current;
    });

    return output.join(" ");
};
