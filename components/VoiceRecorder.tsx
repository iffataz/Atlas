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
  processingLabel = "Processing",
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

  const isActive =
    status === "listening" || status === "processing" || status === "refining";

  return (
    <div className="flex flex-col items-center gap-4">
      {!speechAvailable && (
        <div className="border-2 border-ink bg-red-100 px-4 py-3 text-left">
          <p className="font-display uppercase tracking-widest text-xs text-red-700 mb-1">
            Not supported
          </p>
          <p className="text-ink text-sm">
            Speech recognition requires Chrome or Edge.
          </p>
        </div>
      )}

      {speechAvailable && !isActive && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={startListening}
            disabled={status === "done"}
            aria-label={buttonLabel}
            className="w-16 h-16 border-2 border-ink bg-white flex items-center justify-center shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 transition-all"
          >
            <svg
              className="w-7 h-7 text-ink"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.92V21h-4v-2.08A7 7 0 0 1 5 12z" />
            </svg>
          </button>
          <span className="text-ink text-xs font-display uppercase tracking-widest">
            {buttonLabel}
          </span>
        </div>
      )}

      {status === "listening" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-red-600 bg-white flex items-center justify-center shadow-brutal">
            <span className="animate-pulse w-4 h-4 bg-red-600" />
          </div>
          <p className="text-muted text-sm text-center max-w-xs">{listeningHint}</p>
          <button
            onClick={stop}
            className="text-ink text-xs font-display uppercase tracking-widest underline underline-offset-4 hover:text-atlas transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {(status === "processing" || status === "refining") && (
        <p className="font-display uppercase tracking-wide text-sm text-ink">
          {processingLabel}
          <span className="inline-block w-2.5 h-3.5 bg-ink ml-2 align-baseline animate-blink" />
        </p>
      )}
    </div>
  );
}
