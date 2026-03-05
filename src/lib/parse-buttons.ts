import { ActionButton } from "./types";

interface ParsedResponse {
  text: string;
  buttons: ActionButton[];
}

export function parseAssistantResponse(content: string): ParsedResponse {
  const buttonPattern = /\[BUTTONS:(\{[\s\S]*?\})\]\s*$/;
  const match = content.match(buttonPattern);

  if (!match) {
    return { text: content.trim(), buttons: [] };
  }

  // Remove the buttons marker and any trailing --- separator
  let text = content.slice(0, match.index).trim();
  if (text.endsWith("---")) {
    text = text.slice(0, -3).trim();
  }

  try {
    const parsed = JSON.parse(match[1]);
    const buttons: ActionButton[] = (parsed.buttons || []).map(
      (b: { label: string; value: string; variant?: string }) => ({
        label: b.label,
        value: b.value,
        variant: (b.variant as ActionButton["variant"]) || "secondary",
      })
    );
    return { text, buttons };
  } catch {
    return { text: content.trim(), buttons: [] };
  }
}
