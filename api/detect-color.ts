
import { GoogleGenAI, Type } from "@google/genai";

// Vercel Edge Functions are fast and efficient.
export const config = {
  runtime: 'edge',
};

// This code runs on the server, so process.env.API_KEY is secure.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    // This will cause the function to fail safely if the API key is not set.
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

const colorSchema = {
    type: Type.OBJECT,
    properties: {
        colorName: { type: Type.STRING, description: "El nombre descriptivo y común del color en español (ej. 'Rojo Carmesí', 'Azul Cielo')." },
        hexCode: { type: Type.STRING, description: "El código hexadecimal del color (ej. '#FF0000')." },
    },
    required: ["colorName", "hexCode"],
};

// The main handler for the serverless function.
export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { image: base64Image } = await req.json();

        if (!base64Image) {
            return new Response(JSON.stringify({ message: 'La información de la imagen es requerida.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
        const textPart = { text: `Eres una herramienta experta en análisis de color para personas con daltonismo. Analiza el color predominante en el centro de esta imagen. Proporciona un nombre de color descriptivo y fácil de usar en español (ej. 'Azul Real' en lugar de 'Azul'), y su código hexadecimal correspondiente. Responde ÚNICAMENTE con un objeto JSON que coincida con el esquema proporcionado. No agregues ningún otro texto ni formato markdown.` };

        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: colorSchema,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const jsonText = geminiResponse.text.trim();
        const result = JSON.parse(jsonText);

        // Server-side validation of the AI response
        if (!result.colorName || !result.hexCode || !/^#[0-9A-F]{6}$/i.test(result.hexCode)) {
             throw new Error("Respuesta de la API inválida.");
        }

        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Error in serverless function:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ message: `No se pudo analizar el color: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
