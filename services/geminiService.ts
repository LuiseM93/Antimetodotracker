
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlacementTestAnswers, GeminiPlacementResponse, AntimethodStage } from '../types';
import { STAGE_DETAILS, API_KEY_WARNING, PREDEFINED_TIPS_BY_STAGE } from "../constants";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(API_KEY_WARNING);
}

const PLACEMENT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const geminiService = {
  isConfigured: (): boolean => !!ai,

  getPlacementSuggestion: async (answers: PlacementTestAnswers): Promise<GeminiPlacementResponse | null> => {
    if (!ai) {
      console.warn("Gemini API not configured for placement. Returning default placement.");
      // Fallback for when API key is not available
      let calculatedStage = AntimethodStage.ONE; // Default to Stage 1
      if (answers.understandsWithSubs === 'Bastante bien' || answers.understandsWithSubs === 'Casi perfectamente') {
          calculatedStage = AntimethodStage.TWO;
      }
      if (answers.understandsWithoutSubs === 'Bastante bien' || answers.understandsWithoutSubs === 'Casi perfectamente') {
          calculatedStage = AntimethodStage.THREE;
      }
      if (answers.speakingComfort === 'Muy cómodo/a' && (answers.understandsWithoutSubs === 'Casi perfectamente' || answers.understandsWithoutSubs === 'Bastante bien') && calculatedStage >= AntimethodStage.THREE) {
          calculatedStage = AntimethodStage.FOUR;
      }
      // If still basic understanding after checks, ensure it's not above stage 1 or 2 without better subs understanding
      if (calculatedStage > AntimethodStage.TWO && (answers.understandsWithSubs !== 'Casi perfectamente' && answers.understandsWithSubs !== 'Bastante bien')){
        calculatedStage = AntimethodStage.TWO;
      }
       if (calculatedStage > AntimethodStage.ONE && (answers.understandsBasic !== 'Sí, bastantes' && answers.understandsBasic !== 'Sí, algunas')){
        calculatedStage = AntimethodStage.ONE;
      }

      return { stage: calculatedStage, justification: "Evaluación local simplificada. Para una recomendación más precisa, por favor configura la API Key de Gemini." };
    }

    const prompt = `
      Based on the 'El Antimétodo' philosophy, determine the user's learning stage.
      The stages are:
      Stage 1: Preparación Previa (Building basic vocabulary and comprehension with highly scaffolded content like Anki and language apps).
      Stage 2: Inmersión Total (Consuming native content with subtitles in the target language, focusing on enjoyment and volume).
      Stage 3: Free Flow Listening (Reducing reliance on subtitles, consuming content without them, sentence mining i+1).
      Stage 4: Producción (High comprehension, comfortable production, activating passive knowledge, refining nuances).

      User's answers:
      - Language: ${answers.language}
      - Experience: ${answers.experience}
      - Understands basic phrases: ${answers.understandsBasic}
      - Understands content with subtitles: ${answers.understandsWithSubs}
      - Understands content without subtitles: ${answers.understandsWithoutSubs}
      - Speaking comfort: ${answers.speakingComfort}
      - Main goal: ${answers.mainGoal}

      Respond ONLY with a JSON object containing the stage number (1, 2, 3, or 4) and a brief (1-2 sentence) justification for that stage choice.
      Format: {"stage": STAGE_NUMBER, "justification": "REASONING"}
      Example: {"stage": 1, "justification": "User is beginning to understand basic phrases and needs to build foundational vocabulary."}
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: PLACEMENT_MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3, 
        }
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      let parsedData = JSON.parse(jsonStr) as GeminiPlacementResponse;
      
      // Validate stage and justification. If stage is 0 or not in AntimethodStage enum values, default to ONE.
      if (typeof parsedData.stage !== 'number' || 
          typeof parsedData.justification !== 'string' || 
          !Object.values(AntimethodStage).includes(parsedData.stage as AntimethodStage)) {
        
        const originalJustification = parsedData.justification || "";
        parsedData.stage = AntimethodStage.ONE; // Default to Stage 1 if invalid
        parsedData.justification = `Respuesta de IA inválida o etapa no reconocida (${parsedData.stage}), asignada Etapa 1 por defecto. ${originalJustification}`.trim();
        console.warn("Invalid stage number or format from Gemini, defaulting to Stage 1", parsedData);
      }
      
      return parsedData;

    } catch (error) {
      console.error("Error getting placement suggestion from Gemini API:", error);
      return { stage: AntimethodStage.ONE, justification: "Error al contactar el servicio de IA. Se asignó la etapa inicial (Etapa 1). Puedes ajustarla manualmente." };
    }
  },

  getTipOfTheDay: (userStage: AntimethodStage): string => {
    // Ensure userStage is a valid key for PREDEFINED_TIPS_BY_STAGE
    const validStageKey = Object.values(AntimethodStage).includes(userStage) 
                            ? userStage 
                            : AntimethodStage.ONE; // Default to Stage ONE if somehow invalid

    const stageSpecificTips = PREDEFINED_TIPS_BY_STAGE[validStageKey] || [];
    const generalTips = PREDEFINED_TIPS_BY_STAGE.GENERAL || [];
    
    let allApplicableTips = [...stageSpecificTips, ...generalTips];
    
    if (allApplicableTips.length === 0) {
        // This case should ideally not be reached if PREDEFINED_TIPS_BY_STAGE.GENERAL is always populated.
        allApplicableTips = ["¡Sigue aprendiendo y disfrutando el proceso cada día!", "La constancia es clave para el éxito en los idiomas."];
    }
    
    const randomIndex = Math.floor(Math.random() * allApplicableTips.length);
    return allApplicableTips[randomIndex];
  },
};
