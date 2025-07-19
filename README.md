# Audio Transcription App

This project is a web application that allows you to transcribe audio to plain text using three methods:
- Microphone (browser speech recognition)
- Uploading an audio file
- Providing an audio file URL

The app uses the Google Generative Language API (Gemini) for file and URL transcription. Microphone transcription uses your browser's built-in speech recognition (if available).

## Features
- **Language Selector:** Choose from multiple languages for transcription. The selected language is used for both Gemini and microphone transcription. English is the default.
- **Modern UI:** Responsive, mobile-friendly design with light/dark mode support and a custom color palette.
- **Tabs:** Easily switch between microphone, file upload, and URL input methods.
- **Transcript Box:** Transcript appears only after a result is available.

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
- Use the language selector to choose the language for transcription.
- For file/URL transcription, your Gemini API key is required.
- For microphone transcription, your browser must support the SpeechRecognition API.
- The transcript will appear below once transcription is complete.

## License

This project is licensed under the MIT License. You are free to use, copy, modify, and distribute this software, provided you include attribution to the original author:

Copyright (c) 2025 Miguel Carrasco

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
