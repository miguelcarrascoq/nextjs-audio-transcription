"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface WebkitSpeechRecognition extends EventTarget {
  lang: string;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

const TABS = [
	{ label: "Microphone", value: "mic" },
	{ label: "Upload File", value: "file" },
	{ label: "Audio URL", value: "url" },
];

const LANGUAGES = [
	{ label: "English", value: "en-US" },
	{ label: "Spanish", value: "es-ES" },
	{ label: "French", value: "fr-FR" },
	{ label: "German", value: "de-DE" },
	{ label: "Italian", value: "it-IT" },
	{ label: "Portuguese", value: "pt-PT" },
	{ label: "Chinese", value: "zh-CN" },
	{ label: "Japanese", value: "ja-JP" },
	{ label: "Korean", value: "ko-KR" },
	// Add more as needed
];

export default function Home() {
	const [audioUrl, setAudioUrl] = useState("");
	const [transcript, setTranscript] = useState("");
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState("mic");
	const [isRecording, setIsRecording] = useState(false);
	const [language, setLanguage] = useState("en-US");
	const recognitionRef = useRef<WebkitSpeechRecognition | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Microphone controls
	const startMicTranscribe = () => {
		if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
			const recognition = new (window as { webkitSpeechRecognition: new () => unknown }).webkitSpeechRecognition() as WebkitSpeechRecognition;
			recognition.lang = language;
			recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
				setTranscript(event.results[0][0].transcript);
			};
			recognition.onerror = (event: { error: string }) => {
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
		formData.append("language", language);
		try {
			const res = await fetch("/api/transcribe", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (data.transcript) setTranscript(data.transcript);
			else setTranscript(data.error || "Transcription failed.");
		} catch (e) {
			if (e instanceof Error) {
				setTranscript("Error: " + e.message);
			} else {
				setTranscript("Unknown error");
			}
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
		formData.append("language", language);
		try {
			const res = await fetch("/api/transcribe", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (data.transcript) setTranscript(data.transcript);
			else setTranscript(data.error || "Transcription failed.");
		} catch (e) {
			if (e instanceof Error) {
				setTranscript("Error: " + e.message);
			} else {
				setTranscript("Unknown error");
			}
		}
		setLoading(false);
	};

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 bg-gradient-to-br from-sky-100 via-indigo-100 to-fuchsia-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
			<main className="flex flex-col gap-8 sm:gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
				<div className="flex items-center gap-3 mb-2">
					<Image
						src="/logo.svg"
						alt="App Logo"
						width={40}
						height={40}
						priority
					/>
					<h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left text-indigo-900 dark:text-fuchsia-200">
						Audio Transcription
					</h1>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 mb-4 w-full items-center">
					<label htmlFor="lang" className="font-medium text-sm min-w-fit text-indigo-800 dark:text-fuchsia-200">
						Language:
					</label>
					<select
						id="lang"
						className="border border-indigo-300 dark:border-fuchsia-700 rounded-lg px-2 py-1 text-sm flex-1 min-w-[120px] bg-white dark:bg-slate-900 text-indigo-900 dark:text-fuchsia-200 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-fuchsia-500"
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						disabled={loading}
					>
						{LANGUAGES.map((l) => (
							<option key={l.value} value={l.value} className="bg-white dark:bg-slate-900 text-indigo-900 dark:text-fuchsia-200">
								{l.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<div className="flex gap-1 sm:gap-2 mb-0 w-full overflow-x-auto bg-transparent rounded-t-xl border-b-2 border-indigo-300 dark:border-fuchsia-700 shadow-sm">
						{TABS.map((t) => (
							<button
								key={t.value}
								className={`flex-1 min-w-[120px] px-2 sm:px-4 py-2 rounded-t-xl font-medium text-xs sm:text-base transition-colors border-b-4
                ${tab === t.value
										? "border-fuchsia-600 bg-gradient-to-tr from-indigo-400 to-fuchsia-400 text-white dark:from-fuchsia-700 dark:to-indigo-700 dark:text-white shadow-lg"
										: "border-transparent bg-indigo-100 dark:bg-slate-800 text-indigo-800 dark:text-fuchsia-200 hover:bg-indigo-200 dark:hover:bg-fuchsia-900"}
              `}
								onClick={() => {
									setTab(t.value);
									setTranscript("");
								}}
								type="button"
							>
								{t.label}
							</button>
						))}
					</div>
					<div className={`w-full border rounded-b-xl p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 ${tab === 'mic' ? 'border-indigo-400' : tab === 'file' ? 'border-fuchsia-400' : 'border-sky-400'} dark:border-fuchsia-700`}> 
						{tab === "mic" && (
							<div className="flex flex-col gap-2 items-start w-full">
								<button
									className={`w-full sm:w-auto rounded-lg px-4 py-2 font-medium text-white shadow-md transition-colors ${isRecording
										? "bg-fuchsia-600 hover:bg-fuchsia-700"
										: "bg-indigo-600 hover:bg-indigo-700"}`}
									onClick={isRecording ? stopMicTranscribe : startMicTranscribe}
									type="button"
									disabled={loading}
								>
									{isRecording ? "Stop Recording" : "Start Recording"}
								</button>
								<span className="text-xs text-fuchsia-700 dark:text-fuchsia-300 mt-1">
									{isRecording ? "Recording..." : ""}
								</span>
							</div>
						)}
						{tab === "file" && (
							<div className="flex flex-col gap-2 w-full">
								<label className="font-medium text-indigo-800 dark:text-fuchsia-200">Upload Audio File</label>
								<input
									ref={fileInputRef}
									type="file"
									accept="audio/*"
									onChange={handleFileChange}
									className="border border-indigo-300 dark:border-fuchsia-700 rounded-lg px-2 py-1 w-full bg-white dark:bg-slate-900 text-indigo-900 dark:text-fuchsia-200 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-fuchsia-500"
									disabled={loading}
								/>
							</div>
						)}
						{tab === "url" && (
							<div className="flex flex-col gap-2 w-full">
								<label className="font-medium text-indigo-800 dark:text-fuchsia-200">Audio File URL</label>
								<div className="flex flex-col sm:flex-row gap-2 w-full">
									<input
										type="url"
										value={audioUrl}
										onChange={(e) => setAudioUrl(e.target.value)}
										placeholder="https://example.com/audio.mp3"
										className="border border-indigo-300 dark:border-fuchsia-700 rounded-lg px-2 py-1 flex-1 min-w-0 bg-white dark:bg-slate-900 text-indigo-900 dark:text-fuchsia-200 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-fuchsia-500"
										disabled={loading}
									/>
									<button
										className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white rounded-lg px-4 py-2 hover:from-indigo-600 hover:to-fuchsia-600 w-full sm:w-auto font-medium shadow-md transition-colors"
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
				</div>
				{(transcript || loading) && (
					<div className="mt-6 w-full">
						<h2 className="font-semibold mb-2 text-base sm:text-lg text-indigo-900 dark:text-fuchsia-200">
							Transcript
						</h2>
						<div className="border border-indigo-200 dark:border-fuchsia-700 rounded-xl p-3 min-h-[180px] bg-white/90 dark:bg-slate-900/90 text-sm sm:text-base break-words resize-y overflow-auto" style={{ maxHeight: 400 }}>
							{loading
								? "Transcribing..."
								: transcript}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
