
import { GoogleGenAI, Type } from "@google/genai";
import { type ColorResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        colorName: {
            type: Type.STRING,
            description: "Un nombre descriptivo y amigable para el color en español (ej. 'Azul Real', 'Verde Esmeralda')."
        },
        hexCode: {
            type: Type.STRING,
            description: "El código hexadecimal del color (ej. '#4169E1'). El formato debe ser # seguido de 6 caracteres hexadecimales."
        }
    },
    required: ["colorName", "hexCode"]
};


export async function detectColorFromImage(base64ImageData: string): Promise<ColorResult> {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    const textPart = {
        text: `Eres una herramienta experta en análisis de color para personas con daltonismo. Analiza el color predominante en el centro de esta imagen. Proporciona un nombre de color descriptivo y fácil de usar en español, y su código hexadecimal correspondiente. Por ejemplo, "Rojo Fuego" en lugar de solo "Rojo". Responde ÚNICAMENTE con un objeto JSON que coincida con el esquema proporcionado. No agregues ningún otro texto ni formato markdown.`
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2, // Lower temperature for more deterministic color names
            }
        });

        const jsonString = response.text.trim();
        const result: ColorResult = JSON.parse(jsonString);

        // Validate hex code format
        if (!/^#[0-9A-F]{6}$/i.test(result.hexCode)) {
             throw new Error(`Invalid hex code format from API: ${result.hexCode}`);
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI failed to identify the color. Please try again.");
    }
}
