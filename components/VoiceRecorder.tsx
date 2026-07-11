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
  const [speechAvailable, setSpeechAvailable] = useState(true);
  // Recognized speech lands here for review/editing instead of submitting
  // directly — and the same textarea is the input for browsers without
  // speech recognition (Firefox/Safari).
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const available =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    setSpeechAvailable(available);
    if (!available) setTyping(true);
  }, []);

  function startListening() {
    if (!speechAvailable) return;
    setMicError(null);

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
        setText(transcript);
        setTyping(true);
        onStatusChange("idle");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone access denied. Check browser permissions, or type below.");
        setTyping(true);
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setMicError("Speech recognition failed. You can type instead.");
      }
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

  function submitText() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMicError(null);
    onTranscript(trimmed);
    setText("");
    if (speechAvailable) setTyping(false);
  }

  const isActive =
    status === "listening" || status === "processing" || status === "refining";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!isActive && !typing && speechAvailable && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={startListening}
            aria-label={buttonLabel}
            className="w-16 h-16 border-2 border-ink bg-white flex items-center justify-center shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
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
          <button
            onClick={() => setTyping(true)}
            className="text-muted text-xs font-display uppercase tracking-widest underline underline-offset-4 hover:text-atlas transition-colors"
          >
            Type instead
          </button>
        </div>
      )}

      {!isActive && typing && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <label htmlFor="voice-draft" className="sr-only">
            {buttonLabel}
          </label>
          <textarea
            id="voice-draft"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={listeningHint}
            rows={3}
            className="w-full border-2 border-ink bg-white text-ink text-sm px-3 py-2 resize-none focus:outline-none focus:shadow-brutal-sm"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={submitText}
              disabled={!text.trim()}
              className="border-2 border-ink bg-atlas text-white text-xs font-display uppercase tracking-widest px-4 py-2 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm transition-all"
            >
              {buttonLabel}
            </button>
            {speechAvailable && (
              <button
                onClick={() => {
                  setTyping(false);
                  setText("");
                }}
                className="text-muted text-xs font-display uppercase tracking-widest underline underline-offset-4 hover:text-atlas transition-colors"
              >
                Speak instead
              </button>
            )}
          </div>
        </div>
      )}

      {micError && !isActive && (
        <p role="alert" className="border-2 border-ink bg-red-100 text-ink text-sm px-4 py-2 max-w-sm">
          {micError}
        </p>
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
