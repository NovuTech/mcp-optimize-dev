import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "node:module";
import { handleOptimizeContext, optimizeContextInputSchema } from "./tools/optimizeContextTool.js";

const require = createRequire(import.meta.url);
const packageJson = require("../../package.json") as { name: string; version: string };

const start = async (): Promise<void> => {
  const server = new McpServer({
    name: packageJson.name,
    version: packageJson.version,
  });

  server.tool("optimize_context", optimizeContextInputSchema, async (args) => {
    const text = await handleOptimizeContext(args);
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
