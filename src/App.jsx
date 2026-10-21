import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userQuery, targetPlatform, mode, language } = await req.json();
    
    // Kunci API aman diambil dari Environment Variable server Vercel (TANPA awalan VITE_)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY belum diatur di server Vercel" }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `Kamu adalah AI Expert Prompt Engineer untuk "Goprompt". 
Klasifikasikan input ke: DESIGN, IMAGE, VIDEO, WRITING, BUSINESS, EDUCATION, CODING, AI_PRODUCTIVITY, atau GENERAL.
Target Platform: ${targetPlatform}. Mode Detail: ${mode}. Bahasa Output: ${language === 'EN' ? 'English' : 'Bahasa Indonesia'}.
Kembalikan DALAM FORMAT JSON SAJA:
{
  "category": "DESIGN",
  "goal": "...",
  "outputType": "...",
  "detectedStyle": "...",
  "targetAudience": "...",
  "placeholders": [{"tag": "[ NAMA ]", "label": "Label", "defaultValue": "Contoh"}],
  "generatedPrompt": "Teks prompt..."
}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Input pengguna: "${userQuery}"` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API Error: ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      return NextResponse.json(parsed);
    }

    throw new Error("Respon kosong dari Gemini");
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
