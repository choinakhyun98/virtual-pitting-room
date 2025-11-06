'use server'
import { GoogleGenAI } from "@google/genai";

export async function imageCreator(userImage: string,clothImage: string) {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY as string});

  const base64Image1 = userImage.split(",")[1];
  const base64Image2 = clothImage.split(",")[1];

  const prompt = [
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image1,
      },
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image2,
      },
    },
    { text: `
        You will be provided with two images.
        first image contains a person (let's call this the 'PERSON_IMAGE').
        second image contains an article of clothing (let's call this the 'CLOTHING_IMAGE').

        Your task is to combine these two images.
        You must take the clothing from the 'CLOTHING_IMAGE' and realistically place it onto the person in the 'PERSON_IMAGE'.
        - Ensure the fit, lighting, and perspective look natural and seamless.
        - Do not alter the person’s face, body shape, or pose.
        - The clothing should drape and conform to the person's body photorealistically.
        Return only the final, high-quality, combined photorealistic image suitable for a virtual fitting room.
    ` },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  const imageData = response?.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData
  )?.inlineData?.data;

  if (!imageData) throw new Error("AI did not return image data.");

  return `data:image/png;base64,${imageData}`;
}