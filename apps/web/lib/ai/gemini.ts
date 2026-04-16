import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }
  return client;
}

export const GEMINI_FLASH_MODEL = "gemini-2.0-flash";
