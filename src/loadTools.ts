// src/loadTools.ts
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import type { Tool } from "./types/tool.js";

const require = createRequire(import.meta.url);

async function loadModule(filePath: string) {
    const ext = path.extname(filePath);

    if (ext === ".ts") {
        require("ts-node/register");
        return require(filePath);
    }

    // Load pure ESM files
    if (ext === ".mjs") {
        return import(pathToFileURL(filePath).href);
    }

    if (ext === ".cjs") {
        return require(filePath);
    }

    if (ext === ".js") {
        try {
            // Try ESM first
            return await import(pathToFileURL(filePath).href);
        } catch {
            // Fallback to CJS require
            return require(filePath);
        }
    }

    return null;
}

async function loadLocalTools(): Promise<Tool[]> {
    const toolsDir = path.resolve(process.cwd(), "mcp-tools");
    if (!fs.existsSync(toolsDir)) return [];

    const tools: Tool[] = [];

    for (const file of fs.readdirSync(toolsDir)) {
        const full = path.join(toolsDir, file);
        const allowed = [".js", ".ts", ".mjs", ".cjs"];

        if (!allowed.includes(path.extname(full))) continue;

        try {
            const mod = await loadModule(full);
            if (!mod) continue;

            const tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load tool from file ${file}:`, err);
        }
    }

    return tools;
}

async function loadNpmTools(prefix = "netmex-mcp-tool-"): Promise<Tool[]> {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) return [];

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const tools: Tool[] = [];

    for (const depName of Object.keys(deps)) {
        if (!depName.startsWith(prefix)) continue;

        try {
            const mod = await loadModule(require.resolve(depName));
            const tool = mod.default ?? mod;
            tools.push(tool);
        } catch (err) {
            console.error(`Failed to load npm tool ${depName}:`, err);
        }
    }

    return tools;
}

export async function loadTools(): Promise<Tool[]> {
    const local = await loadLocalTools();
    const npm = await loadNpmTools();

    return [...local, ...npm];
}
