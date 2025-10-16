
import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedImage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const generateImageFromPrompt = async (prompt: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 2,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        return response.generatedImages.map(img => {
            const base64ImageBytes: string = img.image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        });
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check your prompt or API key.");
    }
};

export const editImageWithPrompt = async (prompt: string, images: UploadedImage[]): Promise<string[]> => {
    if (images.length === 0) {
        throw new Error("At least one image is required for editing.");
    }

    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.dataUrl.split(',')[1],
                mimeType: image.mimeType,
            },
        }));

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    ...imageParts,
                    textPart,
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const generatedImages: string[] = [];
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                generatedImages.push(imageUrl);
            }
        }
        
        if (generatedImages.length === 0) {
          throw new Error("The model did not return an image. Try a different prompt or image.");
        }

        return generatedImages;

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. The model might not support the request.");
    }
};
