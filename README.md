## Loggings

Loggings is a logging system for your Node.js applications, with loggings it is possible to standardize logs in a more professional and simple way, loggings has an integrated color system with practical use, currently a total of 0 dependencies.

### Installation

You can install Loggings via npm:

```bash
npm install loggings
```

### Deno Support

```typescript
import { Loggings } from "https://github.com/drysius/Loggings/blob/main/src/mod.ts";
const logger = new Loggings("Deno");
logger.log("Hello [World].blue-b")
```

### CDN Support

```js
import { Loggings } from "https://cdn.jsdelivr.net/npm/loggings@latest/dist/cdn.mjs";
const logger = new Loggings();
logger.log("Hello [World].blue-b")
```

### Configuration

The loggings itself already has an internal configuration, but it also has support for customization, the logs can be configured using a configuration file if necessary. Here are examples of how to configure the loggings:

```typescript
import { Loggings } from "loggings";
// for all instances
Loggings.config({
    register_dir: "./Logs",
})

// for instance
const logger = new Loggings("instance");
logger.config({
    register_dir: "./Logs",
})
```

### Usage

Once configured, you can start using Loggings in your Node.js application. Here's a basic example:

```typescript
import { Loggings } from "loggings";
const logger = new Loggings("Loggings","blue")
logger.error("This is an error message");
logger.warn("This is an warn message");
logger.info("This is an info message");
logger.log("This is alias of info message");
logger.debug("This is alias of info message");
logger.txt("This only registered message, not console viewer");
```

### Alternatively

Now modify the node js console to use loggings:

```typescript
import { Loggings } from "loggings";
const logger = new Loggings("Loggings","blue")
Loggings.useConsole(logger);

console.error("This is an [error].red message");
console.warn("This is an [warn].yellow message");
console.info("This is an [info].blue message");
console.log("This is alias of [info].blue message");
console.debug("This is alias of [debug].magenta message");
console.txt("This only registered message, not console viewer");
```

Use with Colors:

```typescript
import { Loggings } from "loggings";
const logger = new Loggings("Loggings","blue")
/**
 * Use [].colorname to color text
 * use -b for bold + colorname
 */

logger.info("This is [Green].green");
logger.info("This is [Green Bold].green-b");
logger.info("This is [Red Bold].red-b");
logger.info("This is [Red].red");
```

Console Args use

```typescript
import { Loggings } from "loggings";
const logger = new Loggings("Loggings","blue")

// number is blue color in terminal
logger.info(1,"is [Number].blue");

// number is green color in terminal
logger.info({loggings:{ is:"Cool"} },"is [Object].green");

// boolean is blue or red
logger.info(true,"is [Boolean].blue"); // blue
logger.info(false,"is [Boolean].red"); // red
```


### Optionals

In addition to the default configuration configured by loggings and the user, it is also possible to use personal configurations in each loggings class call, exemple:

```typescript
import { Loggings } from "loggings";
const logger = new Loggings("Loggings","blue", {
    format: '[{status}] [{hours}:{minutes}:{seconds}].magenta {message}',
    register:false, // not allow register files, only show visual messages
})
logger.error("This is an error message");
logger.warn("This is an warn message");
logger.info("This is an info message");
logger.log("This is alias of info message");
logger.debug("This is an debug message");
```

### License

This project is licensed under the MIT lincense.

### Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/drysius/loggings).

### Support

For help or questions about using Loggings, please contact us at daniel.alternight@gmail.com.
