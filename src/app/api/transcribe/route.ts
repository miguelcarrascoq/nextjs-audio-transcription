import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const url = formData.get("url");
  const language = formData.get("language") || "en-US";
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!file && !url) {
    return NextResponse.json({ error: "No file or URL provided." }, { status: 400 });
  }

  // Helper: send audio to Gemini Generative Language API (update to use available model)
  async function transcribeWithGemini(audioBuffer: Buffer | ArrayBuffer) {
    if (!geminiApiKey) {
      return { error: "No Gemini API key provided." };
    }
    // Convert ArrayBuffer to Buffer for base64 encoding
    let nodeBuffer: Buffer;
    if (audioBuffer instanceof ArrayBuffer) {
      nodeBuffer = Buffer.from(new Uint8Array(audioBuffer));
    } else {
      nodeBuffer = Buffer.from(audioBuffer);
    }
    const base64Audio = nodeBuffer.toString("base64");
    // Use a supported Gemini model for audio (e.g., gemini-1.5-pro-latest)
    const model = "gemini-1.5-pro-latest";
    const prompt = `Transcribe this audio to plain text in ${language}.`;
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [
            { inline_data: { mime_type: "audio/wav", data: base64Audio } },
            { text: prompt }
          ] }
        ]
      })
    });
    const data = await geminiRes.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return { transcript: data.candidates[0].content.parts[0].text };
    }
    return { error: data.error?.message || "Gemini API failed." };
  }

  // If file is provided, handle file transcription
  if (file && typeof (file as File).arrayBuffer === "function") {
    const audioBuffer = await (file as File).arrayBuffer();
    const result = await transcribeWithGemini(audioBuffer);
    if (result.transcript) return NextResponse.json({ transcript: result.transcript });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // If URL is provided, download and transcribe
  if (url && typeof url === "string") {
    try {
      const audioRes = await fetch(url);
      if (!audioRes.ok) throw new Error("Failed to fetch audio from URL");
      const audioBuffer = await audioRes.arrayBuffer();
      const result = await transcribeWithGemini(audioBuffer);
      if (result.transcript) return NextResponse.json({ transcript: result.transcript });
      return NextResponse.json({ error: result.error }, { status: 500 });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message }, { status: 500 });
      }
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request." }, { status: 400 });
}
