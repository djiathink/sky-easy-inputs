"use client";

import { ChatMessage } from "@/lib/types";
import ActionButtons from "./ActionButtons";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
  onButtonClick?: (value: string) => void;
}

export default function MessageBubble({
  message,
  isLast,
  isLoading,
  onButtonClick,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showButtons =
    !isUser && isLast && !isLoading && message.buttons && message.buttons.length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-sky-dark to-sky-primary text-white rounded-br-md shadow-md shadow-sky-primary/20"
              : "bg-white text-sky-darker shadow-sm border border-sky-100 rounded-bl-md"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {formatMessage(message.content)}
          </div>
        </div>
        {showButtons && onButtonClick && (
          <ActionButtons
            buttons={message.buttons!}
            onSelect={onButtonClick}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}

function formatMessage(content: string): React.ReactNode {
  const lines = content.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${lineIdx}-${i}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
    return (
      <span key={lineIdx}>
        {lineIdx > 0 && "\n"}
        {formatted}
      </span>
    );
  });
}
