import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let mcpClient: Client | null = null;

async function getClient(): Promise<Client> {
  if (mcpClient) return mcpClient;

  const url = process.env.ODOO_MCP_URL;
  if (!url) throw new Error("ODOO_MCP_URL is not configured");

  const client = new Client({ name: "easy-inputs-odoo", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url));
  await client.connect(transport);
  mcpClient = client;
  return client;
}

function extractText(
  content: unknown
): string {
  if (!content || !Array.isArray(content)) return "";
  return content
    .map((c: { type: string; text?: string }) =>
      c.type === "text" ? c.text || "" : ""
    )
    .join("");
}

export async function callMcpTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const client = await getClient();
  const result = await client.callTool({ name: toolName, arguments: args });

  if (result.isError) {
    const errorText = extractText(result.content);
    throw new Error(errorText || "MCP tool call failed");
  }

  const textContent = extractText(result.content);

  try {
    return JSON.parse(textContent || "null");
  } catch {
    return textContent;
  }
}
