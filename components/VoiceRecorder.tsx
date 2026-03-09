"use client";

import { useEffect, useRef, useState } from "react";
import { IProduct } from "@/lib/models/Product";

export interface SearchResult {
  term: string;
  products: IProduct[];
}

interface VoiceRecorderProps {
  onResults: (data: SearchResult[]) => void;
}

type Status = "idle" | "listening" | "processing" | "done";

export default function VoiceRecorder({ onResults }: VoiceRecorderProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechAvailable(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
  }, []);

  async function sendTerms(terms: string[]) {
    setStatus("processing");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(terms),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: SearchResult[] = await res.json();
      onResults(data);
    } catch (err) {
      console.error("Fetch error:", err);
      onResults([]);
    } finally {
      setStatus("done");
    }
  }

  function startListening() {
    if (!speechAvailable) return;

    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    const heard: string[] = [];

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event: any) => {
      // event.resultIndex = index of the first NEW result this firing
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript: string = event.results[i][0].transcript.trim();
        if (transcript.toLowerCase().includes("done")) {
          recognition.stop();
          const unique = heard.filter((v, i, arr) => arr.indexOf(v) === i);
          sendTerms(unique);
          return;
        }
        heard.push(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      setStatus("idle");
    };

    recognition.start();
  }

  function reset() {
    recognitionRef.current?.stop();
    setStatus("idle");
    onResults([]);
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {status === "idle" && !speechAvailable && (
        <p className="text-red-300 mt-4">
          Speech recognition requires Chrome or Edge.
        </p>
      )}

      {status === "idle" && speechAvailable && (
        <button
          onClick={startListening}
          className="bg-atlas hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
        >
          Try me out!
        </button>
      )}

      {status === "listening" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-white font-medium">Listening...</span>
          </div>
          <p className="text-gray-300 text-sm">
            Say each item, then say &ldquo;done&rdquo; when finished.
          </p>
        </div>
      )}

      {status === "processing" && (
        <div className="flex items-center gap-3 text-white">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8v8z"
              strokeWidth="4"
            />
          </svg>
          <span>Searching...</span>
        </div>
      )}

      {status === "done" && (
        <button
          onClick={reset}
          className="bg-white text-atlas hover:bg-gray-100 font-semibold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
        >
          Search again
        </button>
      )}
    </div>
  );
}
