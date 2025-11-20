// src/loadTools.ts
import fs from "fs";
import path from "path";
import type { Tool } from "./types/tool.js";

async function loadLocalTools(): Promise<Tool[]> {
    const toolsDir = path.resolve(process.cwd(), "mcp-tools");
    if (!fs.existsSync(toolsDir)) return [];

    const tools: Tool[] = [];

    for (const file of fs.readdirSync(toolsDir)) {
        if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;

        try {
            const fullPath = path.join(toolsDir, file);
            const mod = await import(`file://${fullPath}`);
            const tool: Tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load tool from file ${file}:`, err);
        }
    }

    return tools;
}

async function loadNpmTools(prefix = "netmex-mcp-tool-"): Promise<Tool[]> {
    const pkgJsonPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(pkgJsonPath)) return [];

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const tools: Tool[] = [];

    for (const depName of Object.keys(deps)) {
        if (!depName.startsWith(prefix)) continue;

        try {
            const mod = await import(depName);
            const tool: Tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load npm tool ${depName}:`, err);
        }
    }

    return tools;
}

export async function loadTools(): Promise<Tool[]> {
    const localTools = await loadLocalTools();
    const npmTools = await loadNpmTools();
    return [...localTools, ...npmTools];
}
