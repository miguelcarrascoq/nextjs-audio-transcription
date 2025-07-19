"use client";

import React, { useRef, useState } from "react";

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
	const recognitionRef = useRef<any>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Microphone controls
	const startMicTranscribe = () => {
		if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
			const recognition = new (window as any).webkitSpeechRecognition();
			recognition.lang = language;
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
		formData.append("language", language);
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
		formData.append("language", language);
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
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16">
			<main className="flex flex-col gap-8 sm:gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl">
				<h1 className="text-xl sm:text-2xl font-bold mb-2 text-center sm:text-left">
					Audio Transcription
				</h1>
				<div className="flex flex-col sm:flex-row gap-2 mb-4 w-full items-center">
					<label htmlFor="lang" className="font-medium text-sm min-w-fit">
						Language:
					</label>
					<select
						id="lang"
						className="border rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						disabled={loading}
					>
						{LANGUAGES.map((l) => (
							<option key={l.value} value={l.value}>
								{l.label}
							</option>
						))}
					</select>
				</div>
				<div className="flex gap-1 sm:gap-2 mb-4 w-full overflow-x-auto">
					{TABS.map((t) => (
						<button
							key={t.value}
							className={`flex-1 min-w-[120px] px-2 sm:px-4 py-2 rounded-t border-b-2 transition-colors font-medium text-xs sm:text-base ${
								tab === t.value
									? "border-blue-600 bg-blue-50 dark:bg-blue-900"
									: "border-transparent bg-gray-100 dark:bg-gray-800"
							}`}
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
				<div className="w-full border rounded-b p-3 sm:p-4 bg-white dark:bg-gray-900">
					{tab === "mic" && (
						<div className="flex flex-col gap-2 items-start w-full">
							<button
								className={`w-full sm:w-auto rounded px-4 py-2 font-medium text-white ${
									isRecording
										? "bg-red-600 hover:bg-red-700"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
								onClick={
									isRecording
										? stopMicTranscribe
										: startMicTranscribe
								}
								type="button"
								disabled={loading}
							>
								{isRecording ? "Stop Recording" : "Start Recording"}
							</button>
							<span className="text-xs text-gray-500 mt-1">
								{isRecording ? "Recording..." : ""}
							</span>
						</div>
					)}
					{tab === "file" && (
						<div className="flex flex-col gap-2 w-full">
							<label className="font-medium">Upload Audio File</label>
							<input
								ref={fileInputRef}
								type="file"
								accept="audio/*"
								onChange={handleFileChange}
								className="border rounded px-2 py-1 w-full"
								disabled={loading}
							/>
						</div>
					)}
					{tab === "url" && (
						<div className="flex flex-col gap-2 w-full">
							<label className="font-medium">Audio File URL</label>
							<div className="flex flex-col sm:flex-row gap-2 w-full">
								<input
									type="url"
									value={audioUrl}
									onChange={(e) => setAudioUrl(e.target.value)}
									placeholder="https://example.com/audio.mp3"
									className="border rounded px-2 py-1 flex-1 min-w-0"
									disabled={loading}
								/>
								<button
									className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 w-full sm:w-auto"
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
					<h2 className="font-semibold mb-2 text-base sm:text-lg">
						Transcript
					</h2>
					<div className="border rounded p-3 min-h-[180px] bg-gray-50 dark:bg-gray-900 text-sm sm:text-base break-words resize-y overflow-auto" style={{maxHeight: 400}}>
						{loading
							? "Transcribing..."
							: transcript || (
									<span className="text-gray-400">No transcript yet.</span>
							  )}
					</div>
				</div>
			</main>
		</div>
	);
}
