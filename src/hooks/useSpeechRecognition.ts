"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onaudiostart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  network:
    "Erreur réseau : impossible de joindre le service de reconnaissance vocale. Vérifiez votre connexion internet et que la page est en HTTPS.",
  "not-allowed":
    "Accès au microphone refusé. Autorisez le micro dans les paramètres du navigateur.",
  "no-speech":
    "Aucune parole détectée. Réessayez en parlant plus fort.",
  aborted: "Écoute annulée.",
  "audio-capture":
    "Aucun microphone détecté. Branchez un micro et réessayez.",
  "service-not-allowed":
    "Le service de reconnaissance vocale n'est pas autorisé. Utilisez Chrome ou Edge.",
};

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    setError(null);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onaudiostart = () => {
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: { error: string }) => {
      const message =
        ERROR_MESSAGES[event.error] ||
        `Erreur de reconnaissance vocale : ${event.error}`;
      setError(message);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      setTranscript("");
    } catch (e) {
      setError(
        `Impossible de démarrer la reconnaissance vocale : ${e instanceof Error ? e.message : "erreur inconnue"}`
      );
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
