import { GoogleGenAI } from "@google/genai";

// Cache de estado para evitar chamadas inúteis se a cota acabar
let isQuotaExhausted = false;

// Logotipo de fallback elegante em SVG (CDS - Clínica Dente Saudável)
// Cores: Maroon (#800000) e Lilac (#B19CD9)
const LOGO_FALLBACK = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiByeD0iNjAiIGZpbGw9IiM4MDAwMDAiLz4KPHBhdGggZD0iTTI1MCAxMDBDMjEwIDEwMCAxODAgMTMwIDE4MCAxNzBDMTgwIDIyMCAyMTAgMjUwIDI1MCAyNTBDMjkwIDI1MCAzMjAgMjIwIDMyMCAxNzBDMzIwIDEzMCAyOTAgMTAwIDI1MCAxMDBaIiBmaWxsPSIjQjE5Q0Q5IiBmaWxsLW9wYWNpdHk9IjAuNyIvPgo8dGV4dCB4PSI1MCUiIHk9IjU4JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSInUGxheWZhaXIgRGlzcGxheScsIHNlcmlmIiBmb250LXNpemU9IjEyMCIgZm9udC13ZWlnaHQ9ImJvbGQiPkNEUzwvdGV4dD4KPHRleHQgeD0iNTAlIiB5PSI4MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNCMTlDRDkiIGZvbnQtZmFtaWx5PSInSW50ZXInLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgbGV0dGVyLXNwYWNpbmc9IjEwcHgiPlNBQklOQSBWQUxWRVJERTwvdGV4dD4KPC9zdmc+";

const getApiKey = () => {
  return process.env.API_KEY || "";
};

export const generateLogo = async (): Promise<string | null> => {
  const apiKey = getApiKey();
  
  if (!apiKey || isQuotaExhausted) {
    return LOGO_FALLBACK;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "A professional, ultra-clean minimalist logo for a premium dental clinic. Stylized elegant tooth shape with the acronym 'C.D.S' in bold modern font. Colors: #800000 and #B19CD9. Isolated on transparent background.",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return LOGO_FALLBACK;
  } catch (error: any) {
    if (error?.message?.includes("429") || error?.status === 429) {
      isQuotaExhausted = true;
    }
    return LOGO_FALLBACK;
  }
};

export const generateDentalImage = async (prompt: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey || isQuotaExhausted) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}, professional photography, clean dental clinic aesthetic.` }],
      },
      config: { imageConfig: { aspectRatio: "16:9" } },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error: any) {
    if (error?.message?.includes("429") || error?.status === 429) {
      isQuotaExhausted = true;
    }
    return null;
  }
};