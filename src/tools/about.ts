import { Tool } from "../types/tool.js";

export const aboutTool: Tool = {
    name: "about",
    description: "Returns information about this MCP server",
    inputSchema: {
        type: "object",
        properties: {},
        required: []
    },
    handler: async () => ({
        content: [
            {
                type: "text",
                text: "This is the local AI Advisor MCP server (v1.0.0)."
            }
        ]
    })
};
