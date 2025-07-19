"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

const TABS = [
  { label: "Microphone", value: "mic" },
  { label: "Upload File", value: "file" },
  { label: "Audio URL", value: "url" },
];

export default function Home() {
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("mic");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Microphone controls
  const startMicTranscribe = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
      };
      recognition.onerror = (event: any) => {
        setTranscript("Speech recognition error: " + event.error);
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      setTranscript("SpeechRecognition API not supported in this browser.");
    }
  };

  const stopMicTranscribe = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle file upload (Gemini API)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setTranscript("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcript) setTranscript(data.transcript);
      else setTranscript(data.error || "Transcription failed.");
    } catch (e: any) {
      setTranscript("Error: " + e.message);
    }
    setLoading(false);
  };

  // Handle URL input (Gemini API)
  const handleUrlTranscribe = async () => {
    if (!audioUrl) return;
    setLoading(true);
    setTranscript("");
    const formData = new FormData();
    formData.append("url", audioUrl);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcript) setTranscript(data.transcript);
      else setTranscript(data.error || "Transcription failed.");
    } catch (e: any) {
      setTranscript("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold mb-2">Audio Transcription Demo</h1>
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t.value}
              className={`px-4 py-2 rounded-t border-b-2 transition-colors font-medium ${tab === t.value ? "border-blue-600 bg-blue-50 dark:bg-blue-900" : "border-transparent bg-gray-100 dark:bg-gray-800"}`}
              onClick={() => { setTab(t.value); setTranscript(""); }}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full border rounded-b p-4 bg-white dark:bg-gray-900">
          {tab === "mic" && (
            <div className="flex flex-col gap-2 items-start">
              <button
                className={`rounded px-4 py-2 font-medium text-white ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                onClick={isRecording ? stopMicTranscribe : startMicTranscribe}
                type="button"
                disabled={loading}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              <span className="text-xs text-gray-500 mt-1">{isRecording ? "Recording..." : ""}</span>
            </div>
          )}
          {tab === "file" && (
            <div className="flex flex-col gap-2">
              <label className="font-medium">Upload Audio File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="border rounded px-2 py-1"
                disabled={loading}
              />
            </div>
          )}
          {tab === "url" && (
            <div className="flex flex-col gap-2">
              <label className="font-medium">Audio File URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={audioUrl}
                  onChange={e => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="border rounded px-2 py-1 flex-1"
                  disabled={loading}
                />
                <button
                  className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                  onClick={handleUrlTranscribe}
                  type="button"
                  disabled={loading}
                >
                  Transcribe URL
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 w-full">
          <h2 className="font-semibold mb-2">Transcript</h2>
          <div className="border rounded p-3 min-h-[80px] bg-gray-50 dark:bg-gray-900">
            {loading ? "Transcribing..." : transcript || <span className="text-gray-400">No transcript yet.</span>}
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
