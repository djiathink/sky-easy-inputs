"use client";

import { useState, useEffect, useRef } from "react";
import VoiceButton from "./VoiceButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    transcript,
    isListening,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (isListening) stopListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-sky-100">
      {voiceError && (
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
          {voiceError}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 p-4"
      >
        <VoiceButton
          isListening={isListening}
          isSupported={isSupported}
          onStart={startListening}
          onStop={stopListening}
        />
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Parlez maintenant..."
                : "Décrivez votre opportunité..."
            }
            className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-primary/40 focus:border-sky-primary outline-none resize-none text-sm text-sky-darker placeholder-sky-300 bg-sky-bg/30"
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-2.5 bg-gradient-to-r from-sky-dark to-sky-primary text-white rounded-xl hover:from-sky-darker hover:to-sky-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-primary/25"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
