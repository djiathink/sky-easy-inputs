"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, OdooUser } from "@/lib/types";
import { parseAssistantResponse } from "@/lib/parse-buttons";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatInterfaceProps {
  user: OdooUser;
  onLogout: () => void;
}

export default function ChatInterface({ user, onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Bonjour ${user.name} ! Je suis votre assistant CRM.\n\nQue souhaitez-vous faire ?`,
      buttons: [
        { label: "Nouvelle opportunité", value: "Je veux créer une nouvelle opportunité", variant: "primary" },
        { label: "Mes opportunités", value: "Liste mes opportunités", variant: "secondary" },
        { label: "Changer une étape", value: "Je veux changer l'étape d'une opportunité", variant: "secondary" },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          user,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Désolé, une erreur est survenue : ${data.error || "Erreur inconnue"}`,
          },
        ]);
        return;
      }

      const parsed = parseAssistantResponse(data.content);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: parsed.text,
          buttons: parsed.buttons.length > 0 ? parsed.buttons : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Désolé, je n'ai pas pu traiter votre message. Vérifiez votre connexion et réessayez.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (value: string) => {
    handleSend(value);
  };

  return (
    <div className="flex flex-col h-screen bg-sky-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-dark to-sky-primary rounded-xl flex items-center justify-center shadow-md shadow-sky-primary/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sky-darker">
              Sky Easy Inputs
            </h1>
            <p className="text-xs text-sky-primary/60">CRM - Opportunités</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-sky-darker/70">{user.name}</span>
          <button
            onClick={onLogout}
            className="text-xs text-sky-primary/40 hover:text-sky-dark transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isLast={idx === messages.length - 1}
            isLoading={isLoading}
            onButtonClick={handleButtonClick}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-sky-100">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
