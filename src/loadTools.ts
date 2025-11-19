// src/loadTools.ts
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import type { Tool } from "./types/tool.js";

const require = createRequire(import.meta.url);

function loadLocalTools(): Tool[] {
    const toolsDir = path.resolve(process.cwd(), "mcp-tools");
    if (!fs.existsSync(toolsDir)) return [];

    const tools: Tool[] = [];

    for (const file of fs.readdirSync(toolsDir)) {
        if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;

        try {
            const mod = require(path.join(toolsDir, file));
            const tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load tool from file ${file}:`, err);
        }
    }

    return tools;
}

function loadNpmTools(prefix = "netmex-mcp-tool-"): Tool[] {
    const pkgJsonPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(pkgJsonPath)) return [];

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const tools: Tool[] = [];

    for (const depName of Object.keys(deps)) {
        if (!depName.startsWith(prefix)) continue;

        try {
            const mod = require(depName);
            const tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load npm tool ${depName}:`, err);
        }
    }

    return tools;
}

export function loadTools(): Tool[] {
    const localTools = loadLocalTools();
    const npmTools = loadNpmTools();

    return [...localTools, ...npmTools];
}
