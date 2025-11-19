# Netmex MCP

A lightweight and extendable Model Context Protocol (MCP) server toolkit for building custom tools that integrate with AI assistants.

This package provides a ready-to-use MCP server, a clean structure for defining tools, and the option for developers to add their own tools without modifying the package.

## Installation
```bash
npm install @netmex/mcp
```

##### Or with yarn:
```bash
yarn add @netmex/mcp
```

## Usage
After installing, you can run the MCP server using:
```bash
npx netmex-mcp
```

## Creating Custom Tools
To add your own tools, create a tool file inside a mcp-tools/ directory in your project root:

Example Tool (TypeScript)
```typescript
import type { Tool } from "@netmex/mcp/types";

const GreetTool: Tool = {
    name: "greet",
    description: "Returns a friendly greeting",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string", description: "Name to greet" }
        },
        required: ["name"]
    },
    handler: async ({ name }) => ({
        content: [
            {
                type: "text",
                text: `Hello, ${name}!`
            }
        ]
    })
};

export default GreetTool;
```
### Using Tools Inside Your Project
Once placed inside mcp-tools/, tools are automatically discovered by the loader and exposed to MCP clients.

No registration needed.
No editing package code.
Just drop the tool file in place.

## Accessing Tool Input
Each tool receives structured arguments, validated according to its ```inputSchema```.

## Recommended Directory Layout
```text
your-project/
├── mcp-tools/
│   ├── GreetTool.ts
│   └── AnotherTool.ts
├── node_modules/
├── package.json
└── ...
```

## NPM Plugin Tools
You can also install tools from npm.
Any dependency whose name starts with:
```text
netmex-mcp-tool-
```
will be auto-loaded by the server.

Example:
```text
npm install netmex-mcp-tool-analytics
```

### Handling Errors
If a tool throws or returns an invalid value, the server automatically returns a JSON-RPC error:

```json
{
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": { "details": "Something went wrong" }
  }
}
```
Use try/catch inside handlers for custom error responses.

## Built-In Tools
This package includes a few tools by default:
- about
- hello
- (more coming soon)

## Development
To build the MCP server locally:
```text
npm install
npm run build
```

To start it directly:
```text
npm run start
```

## More About MCP
For more information on the Model Context Protocol, visit the [official MCP documentation](https://modelcontextprotocol.io/).

## License
This project is licensed under the MIT License.
