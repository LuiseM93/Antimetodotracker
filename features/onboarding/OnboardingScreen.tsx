
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { AntimethodStage, PlacementTestAnswers, UserProfile, AppView, Language } from '../../types';
import { ONBOARDING_SCREENS, STAGE_DETAILS, AVAILABLE_LANGUAGES_FOR_LEARNING, DEFAULT_DASHBOARD_CARD_DISPLAY_MODE } from '../../constants';
import { Button } from '../../components/Button';
import { PlacementTestForm } from './PlacementTestForm';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { HomeIcon } from '../../components/icons/HomeIcon'; 
// import { BookOpenIcon } from '../../components/icons/BookOpenIcon'; // Replaced with actual images

type OnboardingFlowState = 'initial_choice' | 'quick_setup' | 'intro_screens' | 'placement_test' | 'test_result';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";


export const OnboardingScreen: React.FC = () => {
  const [flowState, setFlowState] = useState<OnboardingFlowState>('initial_choice');
  const [currentIntroStep, setCurrentIntroStep] = useState(0);
  
  const { initializeUserProfile } = useAppContext();
  const navigate = useNavigate();

  const [testResult, setTestResult] = useState<{ stage: AntimethodStage; justification: string; answers: PlacementTestAnswers } | null>(null);

  // For Quick Setup
  const [quickSetupLanguage, setQuickSetupLanguage] = useState<Language>(AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
  const [quickSetupStage, setQuickSetupStage] = useState<AntimethodStage>(AntimethodStage.ONE); // Default to Stage 1


  const totalIntroScreens = ONBOARDING_SCREENS.length;

  const handleIntroNext = () => {
    if (currentIntroStep < totalIntroScreens - 1) {
      setCurrentIntroStep(s => s + 1);
    } else { // Last intro screen, move to test
      setFlowState('placement_test');
    }
  };

  const handleIntroPrev = () => {
    if (currentIntroStep > 0) {
      setCurrentIntroStep(s => s - 1);
    } else {
      setFlowState('initial_choice'); // Go back to the very first question
    }
  };

  const handleTestComplete = (stage: AntimethodStage, justification: string, answers: PlacementTestAnswers) => {
    setTestResult({ stage: stage, justification, answers });
    setFlowState('test_result'); 
  };

  const handleFinishOnboardingNewUser = () => {
    if (testResult) {
      const newUserProfile: UserProfile = {
        currentStage: testResult.stage, 
        learningLanguages: [testResult.answers.language],
        primaryLanguage: testResult.answers.language,
        goals: [],
        // Initialize gamification fields
        learningDaysCount: 0,
        focusPoints: 0,
        unlockedRewards: [],
        profileFlairId: null,
        lastActivityDateByLanguage: {},
        lastHabitPointsAwardDate: null,
        // Other fields like defaultLogDurationMinutes, theme, dashboardCardDisplayMode
        // will be set to defaults by initializeUserProfile if not provided or if undefined.
      };
      initializeUserProfile(newUserProfile);
      navigate(AppView.DASHBOARD);
    }
  };

  const handleFinishQuickSetup = () => {
    const userProfileData: UserProfile = {
        currentStage: quickSetupStage, 
        learningLanguages: [quickSetupLanguage],
        primaryLanguage: quickSetupLanguage,
        goals: [],
        // Initialize gamification fields
        learningDaysCount: 0,
        focusPoints: 0,
        unlockedRewards: [],
        profileFlairId: null,
        lastActivityDateByLanguage: {},
        lastHabitPointsAwardDate: null,
        // Other fields like defaultLogDurationMinutes, theme, dashboardCardDisplayMode
        // will be set to defaults by initializeUserProfile if not provided or if undefined.
    };
    initializeUserProfile(userProfileData);
    navigate(AppView.DASHBOARD);
  };
  
  const currentScreenData = ONBOARDING_SCREENS[currentIntroStep];
  const validStagesForSelection = Object.values(AntimethodStage).filter(
    val => typeof val === 'number' 
  ) as AntimethodStage[];


  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]`}>
      <div className={`bg-[var(--color-card-bg)] p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md text-center`}>
        
        {flowState === 'initial_choice' && (
          <>
            <HomeIcon className={`w-16 h-16 mx-auto mb-6 text-[var(--color-accent)]`} />
            <h1 className={`text-2xl sm:text-3xl font-poppins font-bold text-[var(--color-primary)] mb-6`}>Bienvenido/a</h1>
            <p className={`text-[var(--color-text-main)] text-base sm:text-lg mb-8`}>¿Eres nuevo/a en El Antimétodo?</p>
            <div className="space-y-4">
              <Button onClick={() => { setCurrentIntroStep(0); setFlowState('intro_screens');}} variant="primary" size="lg" className="w-full">
                Sí, soy nuevo/a
              </Button>
              <Button onClick={() => setFlowState('quick_setup')} variant="outline" size="lg" className="w-full">
                No, ya conozco El Antimétodo
              </Button>
            </div>
          </>
        )}

        {flowState === 'quick_setup' && (
          <>
            <h1 className={`text-2xl sm:text-3xl font-poppins font-bold text-[var(--color-primary)] mb-6`}>Configuración Rápida</h1>
            <p className={`text-[var(--color-text-main)] mb-6`}>Selecciona tu idioma meta y tu etapa actual para continuar.</p>
            <div className="space-y-4 text-left">
              <div>
                <label htmlFor="quickSetupLanguage" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Idioma Meta:</label>
                <select
                  id="quickSetupLanguage"
                  value={quickSetupLanguage}
                  onChange={(e) => setQuickSetupLanguage(e.target.value as Language)}
                  className={inputBaseStyle}
                >
                  {AVAILABLE_LANGUAGES_FOR_LEARNING.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="quickSetupStage" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Etapa Actual:</label>
                <select
                  id="quickSetupStage"
                  value={quickSetupStage}
                  onChange={(e) => setQuickSetupStage(Number(e.target.value) as AntimethodStage)}
                  className={inputBaseStyle}
                >
                  {validStagesForSelection.map(stageVal => (
                    <option key={stageVal} value={stageVal}>
                      {STAGE_DETAILS[stageVal as AntimethodStage]?.name || `Etapa ${stageVal}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8 flex flex-col space-y-3">
                <Button onClick={handleFinishQuickSetup} variant="primary" size="lg" className="w-full">
                    Continuar al Dashboard
                </Button>
                <Button onClick={() => setFlowState('initial_choice')} variant="ghost" size="sm" className="w-full">
                    Volver
                </Button>
            </div>
          </>
        )}

        {flowState === 'intro_screens' && currentScreenData && (
          <>
            <div className="w-full h-48 sm:h-56 rounded-lg mb-6 mx-auto overflow-hidden bg-[var(--color-light-purple)]">
              <img 
                src={currentScreenData.image} 
                alt={currentScreenData.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-poppins font-bold text-[var(--color-primary)] mb-4`}>{currentScreenData.title}</h1>
            <p className={`text-[var(--color-text-main)] text-base sm:text-lg mb-8 min-h-[60px]`}>{currentScreenData.text}</p>
            <div className="flex justify-between items-center">
              <Button onClick={handleIntroPrev} variant="ghost" size="md">
                <ChevronLeftIcon className="w-5 h-5 mr-1" /> {currentIntroStep === 0 ? 'Inicio' : 'Anterior'}
              </Button>
              <div className="flex space-x-1">
                {ONBOARDING_SCREENS.map((_, index) => (
                    <span key={index} className={`block w-2.5 h-2.5 rounded-full ${currentIntroStep === index ? `bg-[var(--color-accent)]` : `bg-[var(--color-light-purple)]`}`}></span>
                ))}
              </div>
              <Button onClick={handleIntroNext} variant="accent" size="md">
                {currentIntroStep === totalIntroScreens - 1 ? 'Empezar Test' : 'Siguiente'} <ChevronRightIcon className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </>
        )}

        {flowState === 'placement_test' && (
           <PlacementTestForm onTestComplete={handleTestComplete} />
        )}

        {flowState === 'test_result' && testResult && (
          <div className="text-center">
             <h2 className={`text-2xl font-poppins font-bold text-[var(--color-primary)] mb-3`}>¡Test Completado!</h2>
             <p className={`text-lg text-[var(--color-text-main)] mb-2`}>
                Idioma seleccionado: <strong className={`text-[var(--color-accent)]`}>{testResult.answers.language}</strong>
             </p>
             <p className={`text-lg text-[var(--color-text-main)] mb-2`}>
                Tu etapa sugerida es: <strong className={`text-[var(--color-accent)]`}>{STAGE_DETAILS[testResult.stage]?.name || `Etapa ${testResult.stage}`}</strong>
             </p>
             <p className={`text-sm text-[var(--color-text-light)] bg-[var(--color-light-purple)] bg-opacity-30 p-3 rounded-md mb-6`}>
                <em>Justificación: {testResult.justification}</em>
             </p>
             <p className={`text-[var(--color-text-main)] mb-6`}>
                Puedes ajustar tu etapa manualmente más tarde si lo deseas.
             </p>
             <Button onClick={handleFinishOnboardingNewUser} variant="primary" size="lg" className="w-full">
                ¡Empezar mi viaje!
             </Button>
          </div>
        )}
      </div>
       <p className="mt-8 text-xs text-purple-200">El Antimétodo &copy; {new Date().getFullYear()}</p>
    </div>
  );
};
