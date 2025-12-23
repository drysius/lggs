## Loggings

Loggings is a high-performance, structured logging system for your Node.js and Browser applications. It offers a flexible plugin system, deep configuration merging, custom formatting kits (including gradients and nested styles), and zero external dependencies.

### Installation

You can install Loggings via npm:

```bash
npm install loggings
```

### Browser Support

You can use Loggings directly in the browser via ESM import:

```javascript
import { Loggings } from "https://unpkg.com/loggings/browser/browser.js"; // Example path, adjust based on CDN
// or local
// import { Loggings } from "./node_modules/loggings/browser/browser.js";

const logger = new Loggings({
    title: "Browser",
    color: "blue"
});
logger.log("Hello [World].blue-b");
```

### Usage

#### Basic Usage

```typescript
import { Loggings } from "loggings";

const logger = new Loggings({
    title: "MyApp",
    color: "green",
    level: "info"
});

logger.info("Application started");
logger.warn("Warning message");
logger.error("Error occurred");
```

#### Configuration

Loggings supports deep configuration merging. You can configure it globally or per instance.

```typescript
import { Loggings } from "loggings";

// Global Configuration (affects all new instances)
Loggings.config({
    register_dir: "./logs",
    format: "[{status}] {message}"
});

// Instance Configuration
const logger = new Loggings({
    title: "Worker",
    register_filename: "worker.log"
});

// Update instance configuration dynamically
logger.config({
    level: "debug"
});
```

#### Formatting & Colors

Loggings features a powerful formatting engine supporting legacy bracket syntax, gradients, and nested styles.

```typescript
logger.info("This is [Green].green");
logger.info("This is [Bold Red].red-b");
logger.info("Nested: [[Inner].blue Outer].green");
logger.info("(Gradient Text)gd(red,blue)"); // Gradient from red to blue
```

#### Plugins

Extend functionality with plugins. Loggings comes with `ConsolePlugin` and `RegisterPlugin` (File System) by default in Node.js.

```typescript
import { Loggings } from "loggings";
import { MyCustomPlugin } from "./my-plugin";

// Add a plugin to an instance
const logger = new Loggings({
    plugins: [MyCustomPlugin]
});

// Or dynamically
logger.plugin(MyCustomPlugin, { customOption: true });
```

### API Reference

#### Constructor

```typescript
// Option 1: Object configuration
new Loggings({
    title: "App",
    color: "blue",
    level: "info",
    plugins: []
});

// Option 2: Legacy signature
new Loggings("App", "blue", { level: "info" });
```

#### Methods

- `logger.log(...msg)` / `logger.info(...)`: Log info message.
- `logger.error(...)`: Log error message.
- `logger.warn(...)`: Log warning message.
- `logger.debug(...)`: Log debug message.
- `logger.trace(...)`: Log trace message.
- `logger.txt(...)`: Log raw text (file only by default).
- `Loggings.useConsole(logger)`: Override global console methods with this logger.

### License

This project is licensed under the MIT license.

### Contributing & Support

Contributions are welcome! Please open an issue on the [GitHub repository](https://github.com/drysius/loggings).