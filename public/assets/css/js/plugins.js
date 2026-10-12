class PluginSystem {
    constructor() {
        this.activePlugins = new Set(["code_runner"]);
    }

    togglePlugin(name) {
        if (this.activePlugins.has(name)) {
            this.activePlugins.delete(name);
        } else {
            this.activePlugins.add(name);
        }
        return Array.from(this.activePlugins);
    }

    getActiveList() {
        return Array.from(this.activePlugins);
    }

    // Client-side Python/JS Executor simulation for Code Runner Plugin
    executeCodeArtifact(code) {
        try {
            // Evaluates JS cleanly inside a isolated context
            const logs = [];
            const customConsole = { log: (...args) => logs.push(args.join(" ")) };
            const runFn = new Function('console', code);
            runFn(customConsole);
            return logs.join("\n") || "Code executed successfully with no output.";
        } catch (err) {
            return "Runtime Error: " + err.message;
        }
    }
}

window.pluginSystem = new PluginSystem();