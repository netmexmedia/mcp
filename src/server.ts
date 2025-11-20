#!/usr/bin/env node
import 'ts-node/register';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools as builtinTools } from "./tools/index.js";
import { loadTools } from "./loadTools.js";
import type { Tool } from "./types/tool.js";

(async () => {
    console.error("Starting MCP Server...");

    // Load external tools
    const externalTools: Tool[] = await loadTools();

    // Merge built-in and external tools
    const tools: Tool[] = [...builtinTools, ...externalTools];

    console.error(`Loaded ${tools.length} tools:`, tools.map(t => t.name));

    const server = new Server(
        { name: "local-ai-advisor", version: "1.0.0" },
        { capabilities: { tools: {} } }
    );

    server.fallbackRequestHandler = async (request) => {
        try {
            const { method, params, id } = request;
            console.error(`REQUEST: ${method} [${id}]`);

            if (method === "initialize") {
                return {
                    protocolVersion: "2024-11-05",
                    capabilities: { tools: {} },
                    serverInfo: { name: "local-ai-advisor", version: "1.0.0" }
                };
            }

            if (method === "tools/list") return { tools };

            if (method === "tools/call") {
                const { name, arguments: args = {} } = params || {};
                const tool = tools.find(t => t.name === name);

                if (!tool) {
                    return { error: { code: -32601, message: `Tool not found: ${name}` } };
                }

                return await tool.handler(args);
            }

            if (method === "resources/list") return { resources: [] };
            if (method === "resources/templates/list") return { resourceTemplates: [] };
            if (method === "prompts/list") return { prompts: [] };

            return {};
        } catch (error: any) {
            console.error(`ERROR: ${error.message}`);
            return {
                error: { code: -32603, message: "Internal error", data: { details: error.message } }
            };
        }
    };

    const transport = new StdioServerTransport();

    process.on("SIGTERM", () => console.error("SIGTERM received but staying alive"));

    server.connect(transport)
        .then(() => console.error("Server connected"))
        .catch(error => {
            console.error("Connection error:", error.message);
            process.exit(1);
        });
})();
