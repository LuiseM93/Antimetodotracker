
import React, { useState } from 'react';
import { PlacementTestAnswers, Language, AntimethodStage, GeminiPlacementResponse } from '../../types';
import { PLACEMENT_TEST_QUESTIONS, AVAILABLE_LANGUAGES_FOR_LEARNING, STAGE_DETAILS } from '../../constants';
import { Button } from '../../components/Button';
import { geminiService } from '../../services/geminiService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card } from '../../components/Card';
import { ExternalLinkIcon } from '../../components/icons/ExternalLinkIcon'; // Import ExternalLinkIcon

interface PlacementTestFormProps {
  onTestComplete: (stage: AntimethodStage, justification: string, answers: PlacementTestAnswers) => void;
}

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const PlacementTestForm: React.FC<PlacementTestFormProps> = ({ onTestComplete }) => {
  const [answers, setAnswers] = useState<Partial<PlacementTestAnswers>>({
    language: AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language, // Default to first language
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (PLACEMENT_TEST_QUESTIONS.some(q => !answers[q.id as keyof PlacementTestAnswers] && q.type !== 'text' /* text can be empty */)) {
      setError("Por favor, responde todas las preguntas.");
      return;
    }
    if (!answers.language) { // Ensure language is set
        setError("Por favor, selecciona un idioma.");
        return;
    }


    setIsLoading(true);
    try {
      const fullAnswers = answers as PlacementTestAnswers;
      let result: GeminiPlacementResponse | null = null;

      if (geminiService.isConfigured()) {
         result = await geminiService.getPlacementSuggestion(fullAnswers);
      } else {
        // Fallback logic if Gemini is not configured
        let calculatedStage = AntimethodStage.ONE; // Default to Stage 1
        
        // Progress based on understanding
        if (answers.understandsBasic === 'Sí, algunas' || answers.understandsBasic === 'Sí, bastantes') {
            // User has some basic understanding.
            if (answers.understandsWithSubs === 'Bastante bien' || answers.understandsWithSubs === 'Casi perfectamente') {
                calculatedStage = AntimethodStage.TWO;
                if (answers.understandsWithoutSubs === 'Bastante bien' || answers.understandsWithoutSubs === 'Casi perfectamente') {
                    calculatedStage = AntimethodStage.THREE;
                    // For stage FOUR, strong understanding without subs and speaking comfort are key
                    if (answers.speakingComfort === 'Muy cómodo/a') {
                         calculatedStage = AntimethodStage.FOUR;
                    }
                }
            }
        } else {
            // No basic understanding, so definitely stage ONE.
            calculatedStage = AntimethodStage.ONE;
        }

        // Downgrade if inconsistencies are found
        if (calculatedStage > AntimethodStage.TWO && 
            (answers.understandsWithSubs !== 'Casi perfectamente' && answers.understandsWithSubs !== 'Bastante bien')) {
            calculatedStage = AntimethodStage.TWO;
        }
        if (calculatedStage > AntimethodStage.ONE && 
            (answers.understandsBasic !== 'Sí, bastantes' && answers.understandsBasic !== 'Sí, algunas')) {
            calculatedStage = AntimethodStage.ONE;
        }
        
        result = {
            stage: calculatedStage, // This will be ONE, TWO, THREE, or FOUR
            justification: "Evaluación local simplificada. Para una recomendación más precisa, por favor configura la API Key de Gemini."
        };
      }
      
      if (result) {
        // Ensure stage from result is a valid AntimethodStage enum value, otherwise default to ONE.
        // This is a safeguard, as upstream logic should already ensure this.
        const finalStage = Object.values(AntimethodStage).includes(result.stage as AntimethodStage) 
                            ? result.stage as AntimethodStage 
                            : AntimethodStage.ONE;
        onTestComplete(finalStage, result.justification, fullAnswers);
      } else {
        setError("No se pudo determinar la etapa. Por favor, inténtalo de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al procesar el test. Inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Test de Ubicación" className={`bg-[var(--color-card-bg)]`}>
      <p className={`mb-3 text-[var(--color-text-main)]`}>
        Responde estas preguntas para ayudarnos a entender tu nivel actual y recomendarte la mejor etapa para comenzar con El Antimétodo.
      </p>
      <div className="mb-4 text-sm text-[var(--color-text-light)] bg-[var(--color-light-purple)] bg-opacity-20 p-3 rounded-md border border-[var(--color-light-purple)]">
        <p>
          Para una evaluación más detallada o para comparar, puedes visitar el{' '}
          <a 
            href="https://luisem93.github.io/ElAntimetodo/test-ubicacion" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline font-medium inline-flex items-center"
          >
            Test de Ubicación Original del Antimétodo
            <ExternalLinkIcon className="w-4 h-4 ml-1" />
          </a>.
        </p>
      </div>
      {!geminiService.isConfigured() && (
        <div className={`mb-4 p-3 rounded-md bg-[var(--color-warning)] bg-opacity-20 text-[var(--color-warning)] border border-[var(--color-warning)]`}>
          <p className="text-sm">La API de Gemini no está configurada. Se utilizará una evaluación simplificada.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {PLACEMENT_TEST_QUESTIONS.map(q => (
          <div key={q.id}>
            <label htmlFor={q.id} className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>{q.label}</label>
            {q.type === 'select' && (
              <select
                id={q.id}
                value={answers[q.id as keyof PlacementTestAnswers] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
                className={inputBaseStyle}
              >
                {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
            {q.type === 'radio' && q.options?.map(opt => (
              <div key={opt} className="flex items-center mt-1">
                <input
                  type="radio"
                  id={`${q.id}-${opt}`}
                  name={q.id}
                  value={opt}
                  checked={answers[q.id as keyof PlacementTestAnswers] === opt}
                  onChange={e => handleChange(q.id, e.target.value)}
                  className={`h-4 w-4 text-[var(--color-accent)] border-[var(--color-input-border)] focus:ring-[var(--color-accent)]`}
                />
                <label htmlFor={`${q.id}-${opt}`} className={`ml-2 text-sm text-[var(--color-text-light)]`}>{opt}</label>
              </div>
            ))}
            {q.type === 'text' && (
              <input
                type="text"
                id={q.id}
                value={answers[q.id as keyof PlacementTestAnswers] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className={inputBaseStyle}
              />
            )}
          </div>
        ))}
        {error && <p className={`text-sm text-[var(--color-error)]`}>{error}</p>}
        <Button type="submit" variant="accent" size="lg" isLoading={isLoading} disabled={isLoading} className="w-full">
          {isLoading ? 'Evaluando...' : 'Ver mi Etapa'}
        </Button>
      </form>
    </Card>
  );
};
