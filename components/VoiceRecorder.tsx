"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "done" | "refining";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  status: VoiceStatus;
  onStatusChange: (s: VoiceStatus) => void;
  buttonLabel?: string;
  listeningHint?: string;
  processingLabel?: string;
}

export default function VoiceRecorder({
  onTranscript,
  status,
  onStatusChange,
  buttonLabel = "Speak your preferences",
  listeningHint = "Describe your dietary needs, then stop speaking.",
  processingLabel = "Processing...",
}: VoiceRecorderProps) {
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechAvailable(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
  }, []);

  function startListening() {
    if (!speechAvailable) return;

    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    let gotResult = false;
    onStatusChange("listening");

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.trim();
      if (transcript) {
        gotResult = true;
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      onStatusChange("idle");
    };

    recognition.onend = () => {
      if (!gotResult) onStatusChange("idle");
    };

    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  const isActive = status === "listening" || status === "processing" || status === "refining";

  return (
    <div className="flex flex-col items-center gap-4">
      {!speechAvailable && (
        <p className="text-red-300 text-sm">
          Speech recognition requires Chrome or Edge.
        </p>
      )}

      {speechAvailable && !isActive && (
        <button
          onClick={startListening}
          disabled={status === "done"}
          className="bg-atlas hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.92V21h-4v-2.08A7 7 0 0 1 5 12z" />
          </svg>
          {buttonLabel}
        </button>
      )}

      {status === "listening" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-white font-medium">Listening...</span>
          </div>
          <p className="text-gray-300 text-sm text-center max-w-xs">{listeningHint}</p>
          <button
            onClick={stop}
            className="text-gray-400 underline text-sm hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {(status === "processing" || status === "refining") && (
        <div className="flex items-center gap-3 text-white">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" strokeWidth="4" />
          </svg>
          <span>{processingLabel}</span>
        </div>
      )}
    </div>
  );
}
