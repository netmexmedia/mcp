import { Tool } from "../types/tool.js";

export const helloTool: Tool = {
    name: "hello",
    description: "A simple greeting tool",
    inputSchema: {
        type: "object",
        properties: { name: { type: "string", description: "Optional name" } },
        required: []
    },
    handler: async (args: { name?: string }) => {
        const userName = args.name || "World";
        return {
            content: [
                { type: "text", text: `Hello, ${userName}! 👋 This is your MCP server.` }
            ]
        };
    }
};
