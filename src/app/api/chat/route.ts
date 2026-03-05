import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ODOO_TOOLS, SYSTEM_PROMPT } from "@/lib/claude-tools";
import { handleToolCall } from "@/lib/tool-handlers";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { messages, user } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `${SYSTEM_PROMPT}

## Contexte de la session
- Commercial connecté : ${user?.name || "Inconnu"} (ID: ${user?.id || "?"}, Email: ${user?.email || "?"})
- Quand tu crées une opportunité, assigne toujours user_id = ${user?.id || "false"}`;

    const apiMessages: Anthropic.Messages.MessageParam[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    let response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools: ODOO_TOOLS,
      messages: apiMessages,
    });

    // Agentic loop: handle tool calls
    const fullMessages = [...apiMessages];

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use"
      );

      fullMessages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        try {
          const result = await handleToolCall(
            toolUse.name,
            toolUse.input as Record<string, unknown>
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: result,
          });
        } catch (error) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
            is_error: true,
          });
        }
      }

      fullMessages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        tools: ODOO_TOOLS,
        messages: fullMessages,
      });
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text"
    );
    const responseText = textBlocks.map((b) => b.text).join("\n");

    return new Response(
      JSON.stringify({ content: responseText }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({
        error: `Erreur lors du traitement de votre message: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
