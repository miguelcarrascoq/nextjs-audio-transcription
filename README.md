# Audio Transcription App

This project is a web application that allows you to transcribe audio to plain text using three methods:
- Microphone (browser speech recognition)
- Uploading an audio file
- Providing an audio file URL

The app uses the Google Generative Language API (Gemini) for file and URL transcription. Microphone transcription uses your browser's built-in speech recognition (if available).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Gemini API key to a `.env.local` file:
   ```bash
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Use the tabs to select your preferred transcription method.
- For file/URL transcription, your Gemini API key is required.
- For microphone transcription, your browser must support the SpeechRecognition API.
