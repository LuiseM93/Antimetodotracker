

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Language, ActivityCategory, ActivityLogEntry, AppView, TimerMode, ActivityDetailType, Skill } from '../../types.ts';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';
import { Button } from '../../components/Button.tsx';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons.tsx';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon.tsx';
import { SelectActivityModal } from './SelectActivityModal.tsx';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon.tsx';
import { Modal } from '../../components/Modal.tsx';
import { formatTimeHHMMSS } from '../../utils/timeUtils.ts';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

type TimerDisplayMode = 'stopwatch' | 'countdown';

interface LocationState {
  reLogData?: Partial<ActivityLogEntry> & { language?: Language, duration_seconds?: number };
}

export const LogActivityScreen: React.FC = () => {
  const { userProfile, addActivityLog, updateActivityLog, activityLogs, addCustomActivity, deleteActivityLog } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { logId } = useParams<{ logId?: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [currentLogEntry, setCurrentLogEntry] = useState<Partial<ActivityLogEntry>>({});

  const [selectedActivityName, setSelectedActivityName] = useState<string>('Ninguna seleccionada');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [currentLanguageForLog, setCurrentLanguageForLog] = useState<Language>(
    userProfile?.primaryLanguage || (userProfile?.learningLanguages && userProfile.learningLanguages.length > 0 ? userProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language)
  );
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [timerDisplayMode, setTimerDisplayMode] = useState<TimerDisplayMode>(userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch');
  const defaultDurationSeconds = userProfile?.defaultLogDurationSeconds || 30 * 60;

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchIntervalRef = useRef<number | null>(null);
  const stopwatchTrueStartTimestampRef = useRef<number | null>(null); // For robust timing

  // Countdown state
  const [countdownSetMinutes, setCountdownSetMinutes] = useState<number>(Math.round(defaultDurationSeconds / 60));
  const [countdownRemainingSeconds, setCountdownRemainingSeconds] = useState<number>(countdownSetMinutes * 60);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);
  const countdownInitialDurationRef = useRef<number>(countdownSetMinutes * 60); // Stores the duration when countdown started
  const countdownIntervalRef = useRef<number | null>(null);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(false);
  const countdownTargetTimestampRef = useRef<number | null>(null); // For robust timing

  const lastPauseTimestampRef = useRef<number | null>(null); // For manual pauses of either timer
  
  const [notes, setNotes] = useState<string>('');
  const [capturedDateTime, setCapturedDateTime] = useState<{date: string, time: string} | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState<{
    language: Language,
    category: ActivityCategory | null,
    sub_activity: string,
    customTitle: string,
    date: string,
    startTime: string,
    durationMinutes: number, // Still use minutes for the manual form UI for simplicity
    notes: string
  }>({
    language: userProfile?.primaryLanguage || (userProfile?.learningLanguages && userProfile.learningLanguages.length > 0 ? userProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language),
    category: null,
    sub_activity: '',
    customTitle: '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().substring(0,5),
    durationMinutes: Math.round(defaultDurationSeconds / 60),
    notes: ''
  });

  const [isSelectActivityModalOpenForManualLog, setIsSelectActivityModalOpenForManualLog] = useState(false);
  const reLogProcessedRef = useRef(false);

  // Effect to handle initialization from logId or reLogData
  useEffect(() => {
    const currentPathState = location.state as LocationState | null;
    const defaultDurationMins = Math.round((userProfile?.defaultLogDurationSeconds || 1800) / 60);

    const resetTimersState = (defaultDurationMinsForTimer: number) => {
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setStopwatchSeconds(0);
        setIsStopwatchRunning(false);
        stopwatchTrueStartTimestampRef.current = null;

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        const defaultSecondsForTimer = defaultDurationMinsForTimer * 60;
        setCountdownSetMinutes(defaultDurationMinsForTimer);
        setCountdownRemainingSeconds(defaultSecondsForTimer);
        countdownInitialDurationRef.current = defaultSecondsForTimer;
        setIsCountdownRunning(false);
        setCountdownComplete(false);
        countdownTargetTimestampRef.current = null;
        
        lastPauseTimestampRef.current = null;
        setCapturedDateTime(null);
    };
    
    const activeLearningLanguages = userProfile?.learningLanguages || [];

    if (currentPathState?.reLogData) {
        const { reLogData } = currentPathState;
        setIsEditing(false); 
        setCurrentLogEntry({}); 

        setSelectedActivityName(reLogData.sub_activity || 'Ninguna seleccionada');
        setSelectedCategory(reLogData.category || null);
        setCustomTitle(reLogData.custom_title || '');
        setNotes(reLogData.notes || '');
        setCurrentLanguageForLog(reLogData.language || userProfile?.primaryLanguage || (activeLearningLanguages.length > 0 ? activeLearningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language));
        
        let reLogTimerDurationMins = Math.round((reLogData.duration_seconds ?? defaultDurationSeconds) / 60);
        resetTimersState(reLogTimerDurationMins);
        setTimerDisplayMode(reLogData.duration_seconds && reLogData.duration_seconds > 0 ? 'countdown' : (userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch'));
        
        reLogProcessedRef.current = true;
        navigate(location.pathname, { replace: true, state: {} });

    } else if (logId) {
        reLogProcessedRef.current = false;
        const logToEdit = activityLogs.find(log => log.id === logId);
        if (logToEdit) {
            setIsEditing(true);
            setCurrentLogEntry(logToEdit);
            setSelectedActivityName(logToEdit.sub_activity);
            setSelectedCategory(logToEdit.category);
            setCustomTitle(logToEdit.custom_title || '');
            setCurrentLanguageForLog(logToEdit.language);
            setNotes(logToEdit.notes || '');
            
            setManualForm({
                language: logToEdit.language,
                category: logToEdit.category,
                sub_activity: logToEdit.sub_activity, 
                customTitle: logToEdit.custom_title || '',
                date: logToEdit.date,
                startTime: logToEdit.start_time || new Date().toTimeString().substring(0,5),
                durationMinutes: Math.round(logToEdit.duration_seconds / 60),
                notes: logToEdit.notes || ''
            });
            setIsManualLogModalOpen(true);
            resetTimersState(defaultDurationMins); // Timers not active in edit mode

        } else {
            navigate(AppView.DASHBOARD); 
        }
    } else {
        if (reLogProcessedRef.current) {
            reLogProcessedRef.current = false;
            return; 
        }
        setIsEditing(false);
        setCurrentLogEntry({});
        setSelectedActivityName('Ninguna seleccionada');
        setSelectedCategory(null);
        setCustomTitle('');
        setCurrentLanguageForLog(userProfile?.primaryLanguage || (activeLearningLanguages.length > 0 ? activeLearningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language));
        setNotes('');
        resetTimersState(defaultDurationMins);
        setTimerDisplayMode(userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logId, location.state, userProfile, activityLogs, navigate]);


  const handleActivitySelected = (activity: ActivityDetailType) => {
    setSelectedActivityName(activity.name);
    setSelectedCategory(activity.category || null); 
    setIsActivityModalOpen(false);
  };
  
  const handleManualLogActivitySelected = (activity: ActivityDetailType) => {
    setManualForm(prev => ({
      ...prev,
      sub_activity: activity.name,
      category: activity.category || null,
    }));
    setIsSelectActivityModalOpenForManualLog(false);
  };

  const showCountdownCompletionNotification = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio.");
      return;
    }

    const activityDisplayName = customTitle.trim() || (selectedActivityName !== 'Ninguna seleccionada' ? selectedActivityName : 'Actividad');
    const notificationBody = `Tu sesión de '${activityDisplayName}' ha finalizado.`;
    const notificationOptions = {
      body: notificationBody,
      icon: '/assets/logo-iqOCGSoa.png'
    };

    if (Notification.permission === "granted") {
      new Notification("¡Tiempo Completado!", notificationOptions);
    } else if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification("¡Tiempo Completado!", notificationOptions);
        } else {
          console.warn("Permiso para notificaciones denegado por el usuario.");
        }
      } catch (error) {
        console.error("Error al solicitar permiso de notificación:", error);
      }
    } else {
        console.warn("Permiso para notificaciones ya ha sido denegado.");
    }
  }, [customTitle, selectedActivityName]);

  // Stopwatch interval
  useEffect(() => {
    if (isStopwatchRunning && stopwatchTrueStartTimestampRef.current !== null) {
      stopwatchIntervalRef.current = window.setInterval(() => {
        setStopwatchSeconds(Math.floor((Date.now() - stopwatchTrueStartTimestampRef.current!) / 1000));
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => { if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current); };
  }, [isStopwatchRunning]);

  // Countdown interval
  useEffect(() => {
    if (isCountdownRunning && countdownTargetTimestampRef.current !== null) {
      countdownIntervalRef.current = window.setInterval(() => {
        const remaining = Math.max(0, Math.floor((countdownTargetTimestampRef.current! - Date.now()) / 1000));
        setCountdownRemainingSeconds(remaining);
        if (remaining === 0) {
          setIsCountdownRunning(false); 
          setCountdownComplete(true);
          if (typeof Audio !== "undefined") {
            new Audio('./assets/notification.mp3').play().catch(e => console.warn("Fallo al reproducir audio.", e));
          }
          showCountdownCompletionNotification();
        }
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [isCountdownRunning, showCountdownCompletionNotification]);

  // Handle countdown duration changes from slider
  useEffect(() => {
    if (!isCountdownRunning) {
      const newDurationSeconds = countdownSetMinutes * 60;
      countdownInitialDurationRef.current = newDurationSeconds;
      setCountdownRemainingSeconds(newDurationSeconds);
      setCountdownComplete(false);
      countdownTargetTimestampRef.current = null; // Will be reset on next start
    }
  }, [countdownSetMinutes, isCountdownRunning]);


  // Page Visibility API handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Timers will be throttled by browser. No specific action needed here
        // as intervals recalculate from absolute timestamps when visible.
      } else {
        // Page is visible, correct timers
        if (isStopwatchRunning && stopwatchTrueStartTimestampRef.current !== null) {
          setStopwatchSeconds(Math.floor((Date.now() - stopwatchTrueStartTimestampRef.current) / 1000));
        }
        if (isCountdownRunning && countdownTargetTimestampRef.current !== null) {
          const remaining = Math.max(0, Math.floor((countdownTargetTimestampRef.current - Date.now()) / 1000));
          setCountdownRemainingSeconds(remaining);
          if (remaining === 0 && !countdownComplete) {
            setIsCountdownRunning(false);
            setCountdownComplete(true);
            if (typeof Audio !== "undefined") {
              new Audio('./assets/notification.mp3').play().catch(e => console.warn("Fallo al reproducir audio.", e));
            }
            showCountdownCompletionNotification();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isStopwatchRunning, isCountdownRunning, countdownComplete, showCountdownCompletionNotification]);


  const startTimerCommonLogic = () => {
    const now = new Date();
    setCapturedDateTime({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0,5)
    });
  };

  const handleStartStopwatch = () => {
    if (!isStopwatchRunning) { // About to start or resume
      if (stopwatchTrueStartTimestampRef.current === null) { // First start or after reset
        stopwatchTrueStartTimestampRef.current = Date.now();
      } else { // Resuming from pause
        if (lastPauseTimestampRef.current) {
          const pauseDuration = Date.now() - lastPauseTimestampRef.current;
          stopwatchTrueStartTimestampRef.current! += pauseDuration;
          lastPauseTimestampRef.current = null;
        }
      }
      if (stopwatchSeconds === 0 && !capturedDateTime) startTimerCommonLogic();
      setIsStopwatchRunning(true);
    } else { // About to pause
      lastPauseTimestampRef.current = Date.now();
      setIsStopwatchRunning(false);
    }
  };

  const handleResetStopwatch = () => { 
    setIsStopwatchRunning(false); 
    setStopwatchSeconds(0); 
    stopwatchTrueStartTimestampRef.current = null;
    lastPauseTimestampRef.current = null;
    setCapturedDateTime(null); 
  };

  const handleStartCountdown = () => {
    if (countdownSetMinutes <= 0) { alert("Establece una duración positiva."); return; }

    if (!isCountdownRunning) { // About to start or resume
      if (countdownTargetTimestampRef.current === null || countdownRemainingSeconds === countdownInitialDurationRef.current) { 
        // This means it's a fresh start for this duration, or duration was changed
        countdownTargetTimestampRef.current = Date.now() + countdownRemainingSeconds * 1000;
        countdownInitialDurationRef.current = countdownRemainingSeconds; // Ensure initial duration is set
      } else { // Resuming from pause
        if (lastPauseTimestampRef.current) {
          const pauseDuration = Date.now() - lastPauseTimestampRef.current;
          countdownTargetTimestampRef.current! += pauseDuration;
          lastPauseTimestampRef.current = null;
        }
      }
      if (countdownRemainingSeconds === countdownInitialDurationRef.current && !capturedDateTime) startTimerCommonLogic();
      setIsCountdownRunning(true);
      if (countdownComplete) setCountdownComplete(false);
    } else { // About to pause
      lastPauseTimestampRef.current = Date.now();
      setIsCountdownRunning(false);
    }
  };

  const handleResetCountdown = () => {
    setIsCountdownRunning(false);
    const newRemaining = countdownSetMinutes * 60; // Reset to the currently set minutes on slider
    setCountdownRemainingSeconds(newRemaining); 
    countdownInitialDurationRef.current = newRemaining;
    setCountdownComplete(false);
    countdownTargetTimestampRef.current = null; // Important: will be recalculated on next start
    lastPauseTimestampRef.current = null;
    setCapturedDateTime(null);
  };

  const handleSaveActivity = async () => {
    if (!selectedCategory || selectedActivityName === 'Ninguna seleccionada' || selectedActivityName.trim() === '') {
      alert("Por favor, selecciona una actividad.");
      return;
    }

    let durationToSaveSeconds = 0;
    let dateToSave = capturedDateTime ? capturedDateTime.date : new Date().toISOString().split('T')[0];
    let timeToSave = capturedDateTime ? capturedDateTime.time : undefined;

    if (timerDisplayMode === 'stopwatch' && stopwatchSeconds > 0) {
      durationToSaveSeconds = stopwatchSeconds;
    } else if (timerDisplayMode === 'countdown') {
      const elapsedSeconds = countdownInitialDurationRef.current - countdownRemainingSeconds;
      if (isCountdownRunning || countdownComplete || elapsedSeconds > 0) {
        durationToSaveSeconds = elapsedSeconds;
      } else if (countdownSetMinutes > 0 && !isCountdownRunning && !countdownComplete && countdownRemainingSeconds === (countdownSetMinutes*60)) {
        durationToSaveSeconds = countdownSetMinutes * 60;
        dateToSave = new Date().toISOString().split('T')[0];
        timeToSave = new Date().toTimeString().substring(0,5);
      } else {
         alert("No hay tiempo registrado por el temporizador o la duración es cero.");
         return;
      }
    } else {
      alert("Modo de temporizador no reconocido o sin tiempo.");
      return;
    }
    
    if (durationToSaveSeconds <= 0) {
        alert("La duración debe ser positiva.");
        return;
    }
    
    // If it's a custom activity not in predefined list, add it to user profile
    const isPredefined = ANTIMETHOD_ACTIVITIES_DETAILS.some(a => a.name === selectedActivityName);
    if (!isPredefined) {
        addCustomActivity({ name: selectedActivityName, description: 'Actividad personalizada', category: selectedCategory, skill: Skill.STUDY });
    }

    const logEntryData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'> = {
      language: currentLanguageForLog,
      category: selectedCategory,
      sub_activity: selectedActivityName,
      custom_title: customTitle.trim() || null,
      duration_seconds: durationToSaveSeconds,
      date: dateToSave,
      start_time: timeToSave || null,
      notes: notes.trim() || null,
    };

    await addActivityLog(logEntryData);
    navigate(AppView.DASHBOARD);
  };
  
  const handleSaveManualLog = async () => {
    const finalSubActivity = manualForm.sub_activity.trim();
    if (!manualForm.category || !finalSubActivity || finalSubActivity === "Ninguna seleccionada" || manualForm.durationMinutes <= 0) {
        alert("Completa la categoría, sub-actividad y asegúrate que la duración sea positiva.");
        return;
    }
    
    const durationInSeconds = manualForm.durationMinutes * 60;
    
    // If it's a custom activity not in predefined list, add it to user profile
    const isPredefined = ANTIMETHOD_ACTIVITIES_DETAILS.some(a => a.name === finalSubActivity);
    if (!isPredefined) {
        addCustomActivity({ name: finalSubActivity, description: 'Actividad personalizada', category: manualForm.category, skill: Skill.STUDY });
    }

    const logEntryData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'> = {
      language: manualForm.language,
      category: manualForm.category,
      sub_activity: finalSubActivity,
      custom_title: manualForm.customTitle.trim() || null,
      duration_seconds: durationInSeconds,
      date: manualForm.date,
      start_time: manualForm.startTime || null,
      notes: manualForm.notes.trim() || null,
    };

    if (isEditing && currentLogEntry.id) {
        await updateActivityLog({ ...currentLogEntry, ...logEntryData, id: currentLogEntry.id } as ActivityLogEntry);
    } else {
        await addActivityLog(logEntryData);
    }
    setIsManualLogModalOpen(false);
    navigate(AppView.DASHBOARD); 
  };
  
  const handleDeleteLog = async () => {
    if (isEditing && currentLogEntry.id && window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
        await deleteActivityLog(currentLogEntry.id);
        setIsManualLogModalOpen(false);
        navigate(AppView.DASHBOARD);
    }
  };

  const closeManualLogModal = () => {
    setIsManualLogModalOpen(false);
    if (isEditing) {
      navigate(-1); 
    }
  };
  
  const renderTimerControls = () => {
    if (timerDisplayMode === 'stopwatch') {
      return (
        <>
          <div className={`text-7xl font-mono font-bold text-[var(--color-primary)] my-8`}>{formatTimeHHMMSS(stopwatchSeconds)}</div>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleStartStopwatch} variant={isStopwatchRunning ? "warning" : "success"} size="lg" className="px-8 py-4 rounded-full">
              {isStopwatchRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
            </Button>
            <Button onClick={handleResetStopwatch} variant="outline" size="lg" className="px-8 py-4 rounded-full" disabled={stopwatchSeconds === 0 && !isStopwatchRunning}>
              <ResetIcon className="w-8 h-8"/>
            </Button>
          </div>
          {capturedDateTime && <p className="text-xs text-center text-[var(--color-text-light)] mt-3">Iniciado: {new Date(capturedDateTime.date + 'T' + capturedDateTime.time).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</p> }
           <p className="text-xs text-[var(--color-text-light)] mt-2 px-4">Nota: El cronómetro puede pausarse si la aplicación pasa a segundo plano en móviles.</p>
        </>
      );
    }
    if (timerDisplayMode === 'countdown') {
        const progressPercent = countdownInitialDurationRef.current > 0 ? ((countdownInitialDurationRef.current - countdownRemainingSeconds) / countdownInitialDurationRef.current) * 100 : 0;
      return (
        <>
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 my-6">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle
                className="text-[var(--color-input-border)] opacity-50"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="52" 
                cx="60"
                cy="60"
              />
              <circle
                className="text-[var(--color-accent)]"
                strokeWidth="8"
                strokeDasharray={Math.PI * 2 * 52} 
                strokeDashoffset={Math.PI * 2 * 52 * (1 - progressPercent/100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                transform="rotate(-90 60 60)"
              />
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" className={`text-5xl font-mono font-bold ${countdownComplete ? 'fill-green-500' : 'fill-[var(--color-primary)]'}`}>
                  {formatTimeHHMMSS(countdownRemainingSeconds)}
              </text>
            </svg>
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="countdown-slider" className="text-sm text-[var(--color-text-light)]">
              Duración: {countdownSetMinutes} minutos
            </label>
            <input
              id="countdown-slider"
              type="range"
              min="1"
              max="180"
              step="1"
              value={countdownSetMinutes}
              onChange={(e) => setCountdownSetMinutes(parseInt(e.target.value))}
              disabled={isCountdownRunning}
              className="w-full h-2 bg-[var(--color-light-purple)] rounded-lg appearance-none cursor-pointer mt-1 disabled:opacity-50"
            />
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handleStartCountdown} variant={isCountdownRunning ? "warning" : "success"} size="lg" className="px-8 py-4 rounded-full">
              {isCountdownRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
            </Button>
            <Button onClick={handleResetCountdown} variant="outline" size="lg" className="px-8 py-4 rounded-full" disabled={!isCountdownRunning && countdownRemainingSeconds === (countdownSetMinutes * 60)}>
              <ResetIcon className="w-8 h-8"/>
            </Button>
          </div>
          {capturedDateTime && <p className="text-xs text-center text-[var(--color-text-light)] mt-3">Iniciado: {new Date(capturedDateTime.date + 'T' + capturedDateTime.time).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</p> }
        </>
      );
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-[var(--color-app-bg)]">
      <header className="flex items-center p-4 border-b border-[var(--color-border-light)] sticky top-0 bg-[var(--color-app-bg)] z-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2 p-2">
          <ChevronLeftIcon className="w-6 h-6 text-[var(--color-text-main)]" />
        </Button>
        <h1 className="text-xl font-poppins font-semibold text-[var(--color-primary)]">
          {isEditing ? 'Editar Registro' : 'Registrar Actividad'}
        </h1>
      </header>

      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col items-center">
        {/* Language Selection */}
        <div className="w-full max-w-md">
            <label htmlFor="language-select" className="block text-sm font-medium text-[var(--color-text-main)]">
                Idioma
            </label>
            <select
                id="language-select"
                value={currentLanguageForLog}
                onChange={(e) => setCurrentLanguageForLog(e.target.value as Language)}
                className={inputBaseStyle}
            >
                {userProfile?.learningLanguages && userProfile.learningLanguages.length > 0
                    ? userProfile.learningLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))
                    : AVAILABLE_LANGUAGES_FOR_LEARNING.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))
                }
            </select>
        </div>
        
        {/* Activity Selection */}
        <div className="w-full max-w-md">
            <label htmlFor="activity-select-btn" className="block text-sm font-medium text-[var(--color-text-main)]">
                Actividad
            </label>
            <button
                id="activity-select-btn"
                onClick={() => setIsActivityModalOpen(true)}
                className={`${inputBaseStyle} text-left flex justify-between items-center`}
            >
                <span className={selectedActivityName === 'Ninguna seleccionada' ? 'text-[var(--color-placeholder-text)]' : ''}>
                    {selectedActivityName}
                </span>
                <PlusCircleIcon className="w-5 h-5 text-gray-400" />
            </button>
            {selectedCategory && (
                <p className="text-xs text-[var(--color-text-light)] mt-1">Categoría: {selectedCategory}</p>
            )}
        </div>

        {/* Custom Title */}
        <div className="w-full max-w-md">
            <label htmlFor="custom-title" className="block text-sm font-medium text-[var(--color-text-main)]">
                Título Personalizado (Opcional)
            </label>
            <input 
                type="text" 
                id="custom-title"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="Ej: Viendo 'La Casa de Papel' T1 E3"
                className={inputBaseStyle}
            />
        </div>

        {/* Timer Mode Toggle */}
        <div className="w-full max-w-md flex bg-[var(--color-light-purple)] bg-opacity-30 rounded-lg p-1">
            <Button
                variant={timerDisplayMode === 'stopwatch' ? 'secondary' : 'ghost'}
                onClick={() => setTimerDisplayMode('stopwatch')}
                className="flex-1"
                disabled={isStopwatchRunning || isCountdownRunning}
            >
                Cronómetro
            </Button>
            <Button
                variant={timerDisplayMode === 'countdown' ? 'secondary' : 'ghost'}
                onClick={() => setTimerDisplayMode('countdown')}
                className="flex-1"
                 disabled={isStopwatchRunning || isCountdownRunning}
            >
                Temporizador
            </Button>
        </div>

        {/* Timer Display and Controls */}
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          {renderTimerControls()}
        </div>

        {/* Notes */}
         <div className="w-full max-w-md">
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-main)]">
                Notas (Opcional)
            </label>
            <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Añade detalles sobre la actividad..."
                className={inputBaseStyle}
            />
        </div>

        {isActivityModalOpen && (
            <SelectActivityModal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onActivitySelected={handleActivitySelected}
            />
        )}
      </div>

      <footer className="p-4 border-t border-[var(--color-border-light)] sticky bottom-0 bg-[var(--color-app-bg)] z-10">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="primary" size="lg" onClick={handleSaveActivity} className="flex-grow">
            Guardar Actividad
          </Button>
          <Button variant="outline" size="lg" onClick={() => setIsManualLogModalOpen(true)} className="flex-grow">
            Entrada Manual
          </Button>
        </div>
      </footer>

      {isManualLogModalOpen && (
          <Modal
            isOpen={isManualLogModalOpen}
            onClose={closeManualLogModal}
            title={isEditing ? 'Editar Registro Manual' : 'Añadir Registro Manual'}
            footerContent={
              <div className="flex justify-between w-full">
                {isEditing && (
                    <Button variant="danger" onClick={handleDeleteLog}>Eliminar</Button>
                )}
                <div className={`flex gap-2 ${isEditing ? '' : 'ml-auto'}`}>
                    <Button variant="ghost" onClick={closeManualLogModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveManualLog}>
                        {isEditing ? 'Guardar Cambios' : 'Guardar Registro'}
                    </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
                {/* Manual form fields */}
                <div>
                    <label htmlFor="manual-lang" className="block text-sm font-medium text-[var(--color-text-main)]">Idioma</label>
                    <select id="manual-lang" value={manualForm.language} onChange={e => setManualForm(p => ({...p, language: e.target.value as Language}))} className={inputBaseStyle}>
                        {(userProfile?.learningLanguages || AVAILABLE_LANGUAGES_FOR_LEARNING).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)]">Actividad</label>
                    <button onClick={() => setIsSelectActivityModalOpenForManualLog(true)} className={`${inputBaseStyle} text-left`}>
                        {manualForm.sub_activity || 'Seleccionar actividad...'}
                    </button>
                    {manualForm.category && <p className="text-xs text-[var(--color-text-light)] mt-1">Categoría: {manualForm.category}</p>}
                </div>
                <div>
                    <label htmlFor="manual-title" className="block text-sm font-medium text-[var(--color-text-main)]">Título (Opcional)</label>
                    <input type="text" id="manual-title" value={manualForm.customTitle} onChange={e => setManualForm(p => ({...p, customTitle: e.target.value}))} className={inputBaseStyle}/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="manual-date" className="block text-sm font-medium text-[var(--color-text-main)]">Fecha</label>
                        <input type="date" id="manual-date" value={manualForm.date} onChange={e => setManualForm(p => ({...p, date: e.target.value}))} className={inputBaseStyle}/>
                    </div>
                     <div>
                        <label htmlFor="manual-time" className="block text-sm font-medium text-[var(--color-text-main)]">Hora de Inicio (Opcional)</label>
                        <input type="time" id="manual-time" value={manualForm.startTime} onChange={e => setManualForm(p => ({...p, startTime: e.target.value}))} className={inputBaseStyle}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="manual-duration" className="block text-sm font-medium text-[var(--color-text-main)]">Duración (minutos)</label>
                    <input type="number" id="manual-duration" min="1" value={manualForm.durationMinutes} onChange={e => setManualForm(p => ({...p, durationMinutes: Number(e.target.value)}))} className={inputBaseStyle}/>
                </div>
                <div>
                    <label htmlFor="manual-notes" className="block text-sm font-medium text-[var(--color-text-main)]">Notas (Opcional)</label>
                    <textarea id="manual-notes" rows={2} value={manualForm.notes} onChange={e => setManualForm(p => ({...p, notes: e.target.value}))} className={inputBaseStyle}/>
                </div>

                 {isSelectActivityModalOpenForManualLog && (
                    <SelectActivityModal
                        isOpen={isSelectActivityModalOpenForManualLog}
                        onClose={() => setIsSelectActivityModalOpenForManualLog(false)}
                        onActivitySelected={handleManualLogActivitySelected}
                    />
                )}
            </div>
          </Modal>
      )}
    </div>
  );
};