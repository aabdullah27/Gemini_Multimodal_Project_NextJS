import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash-8b";

export class TranscriptionService {
  private model;

  constructor() {
    // Initialize with empty API key, will be updated in transcribeAudio
    const genAI = new GoogleGenerativeAI('');
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async transcribeAudio(audioBase64: string, mimeType: string = "audio/wav"): Promise<string> {
    try {
      // Get API key from localStorage or environment variable
      let apiKey = '';
      if (typeof window !== 'undefined') {
        apiKey = localStorage.getItem('gemini-api-key') || '';
      }
      apiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

      if (!apiKey) {
        throw new Error('No Gemini API key found. Please set it in the settings.');
      }

      // Create a new instance with the current API key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: "Please transcribe the spoken language in this audio accurately. Ignore any background noise or non-speech sounds." },
      ]);

      return result.response.text();
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
}