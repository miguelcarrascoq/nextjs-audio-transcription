import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audio Transcription App",
  description: "Transcribe audio to text from microphone, file, or URL using Gemini AI. Modern, mobile-friendly, and supports multiple languages.",
  openGraph: {
    title: "Audio Transcription App",
    description: "Transcribe audio to text from microphone, file, or URL using Gemini AI. Modern, mobile-friendly, and supports multiple languages.",
    url: "https://audio-transcription-mime.vercel.app/",
    siteName: "Audio Transcription App",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "Audio Transcription App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audio Transcription App",
    description: "Transcribe audio to text from microphone, file, or URL using Gemini AI. Modern, mobile-friendly, and supports multiple languages.",
    images: ["/opengraph-image.svg"],
    creator: "@miguelCarrascoQ"
  },
};
