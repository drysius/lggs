## Lggs

Lggs is a high-performance, structured logging system for your Node.js and Browser applications. It offers a flexible plugin system, deep configuration merging, custom formatting kits (including gradients and nested styles), and zero external dependencies.

### Installation

You can install Lggs via npm:

```bash
npm install lggs
```

### Browser Support

You can use Lggs directly in the browser via ESM import:

```javascript
import { Lggs } from "https://unpkg.com/lggs/browser/browser.js"; // Example path, adjust based on CDN
// or local
// import { Lggs } from "./node_modules/lggs/browser/browser.js";

const logger = new Lggs({
    title: "Browser",
    color: "blue"
});
logger.log("Hello [World].blue-b");
```

### Usage

#### Basic Usage

```typescript
import { Lggs } from "lggs";

const logger = new Lggs({
    title: "MyApp",
    color: "green",
    level: "info"
});

logger.info("Application started");
logger.warn("Warning message");
logger.error("Error occurred");
```

#### Configuration

Lggs supports deep configuration merging. You can configure it globally or per instance.

```typescript
import { Lggs } from "lggs";

// Global Configuration (affects all new instances)
Lggs.config({
    register_dir: "./logs",
    format: "[{status}] {message}"
});

// Instance Configuration
const logger = new Lggs({
    title: "Worker",
    register_filename: "worker.log"
});

// Update instance configuration dynamically
logger.config({
    level: "debug"
});
```

#### Formatting & Colors

Lggs features a powerful formatting engine supporting legacy bracket syntax, gradients, and nested styles.

```typescript
logger.info("This is [Green].green");
logger.info("This is [Bold Red].red-b");
logger.info("Nested: [[Inner].blue Outer].green");
logger.info("(Gradient Text)gd(red,blue)"); // Gradient from red to blue
```

#### Plugins

Extend functionality with plugins. Lggs comes with `ConsolePlugin` and `RegisterPlugin` (File System) by default in Node.js.

```typescript
import { Lggs } from "lggs";
import { MyCustomPlugin } from "./my-plugin";

// Add a plugin to an instance
const logger = new Lggs({
    plugins: [MyCustomPlugin]
});

// Or dynamically
logger.plugin(MyCustomPlugin, { customOption: true });
```

### API Reference

#### Constructor

```typescript
// Option 1: Object configuration
new Lggs({
    title: "App",
    color: "blue",
    level: "info",
    plugins: []
});

// Option 2: Legacy signature
new Lggs("App", "blue", { level: "info" });
```

#### Methods

- `logger.log(...msg)` / `logger.info(...)`: Log info message.
- `logger.error(...)`: Log error message.
- `logger.warn(...)`: Log warning message.
- `logger.debug(...)`: Log debug message.
- `logger.trace(...)`: Log trace message.
- `logger.txt(...)`: Log raw text (file only by default).
- `Lggs.useConsole(logger)`: Override global console methods with this logger.

### License

This project is licensed under the MIT license.

### Contributing & Support

Contributions are welcome! Please open an issue on the [GitHub repository](https://github.com/drysius/lggs).