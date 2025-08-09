
import type { ColorResult } from '../types';

/**
 * Calls the backend API to analyze the predominant color in a base64 encoded image.
 * This function now securely communicates with our own serverless endpoint.
 * 
 * @param base64Image The base64 encoded string of the image (JPEG format).
 * @param signal AbortSignal to allow cancellation of the fetch request.
 * @returns A promise that resolves to a ColorResult object.
 */
export async function detectColor(base64Image: string, signal: AbortSignal): Promise<ColorResult> {
    const response = await fetch('/api/detect-color', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
        signal, // Pass the signal to the fetch request for cancellation
    });

    if (!response.ok) {
        let errorData;
        try {
            // Try to parse the error message from the serverless function's JSON response
            errorData = await response.json();
        } catch {
            // If the response body isn't valid JSON, create a generic error
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        // Throw an error with the specific message from the backend
        throw new Error(errorData.message || 'Ocurrió un error en el servidor.');
    }

    // Parse the successful JSON response from the backend
    const result: ColorResult = await response.json();
    return result;
}
