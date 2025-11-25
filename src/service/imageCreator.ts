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
        Combine the two provided images. 
        In the final result, the person from the first image should be realistically wearing the clothing shown in the second image. 
        Ensure that the fit, lighting, and perspective look natural and seamless. 
        Do not alter the person’s face, body shape, or pose—only overlay the clothing to look like they are truly wearing it. 
        Return a photorealistic, high-quality output suitable for a virtual fitting room preview.
        Ensure that the fit, lighting, and perspective look natural and seamless, as if the person is truly wearing the outfit in a real-world fitting room setting. 
        Do not alter the person’s face, body shape, or pose—only apply the clothing to look like they are genuinely wearing it. 
        The clothing should drape and conform to the person's body in a photorealistic manner, taking into account fabric textures and wrinkles. 
        Return a high-quality, photorealistic output suitable for a virtual fitting room preview, with a clean background.
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