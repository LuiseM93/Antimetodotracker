

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Language, ActivityCategory, ActivityLogEntry, AppView, ActivityDetailType, Skill } from '../../types.ts';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';
import { Button } from '../../components/Button.tsx';
import { PlayIcon, PauseIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons.tsx';
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
      icon: './assets/logo.png'
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
    alert("Actividad guardada con éxito!");
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
        alert("Registro actualizado con éxito!");
    } else {
        await addActivityLog(logEntryData);
        alert("Registro guardado con éxito!");
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
  
  return (
    <div className="flex h-screen flex-col">
<header className="bg-white px-4 pt-6 pb-2 shadow-sm">
<div className="flex items-center justify-between">
<button onClick={() => navigate(-1)} className="text-gray-600">
<svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
<path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
</svg>
</button>
<h1 className="text-xl font-semibold text-gray-800">Record Activity</h1>
<button>
<img alt="Spanish flag" className="h-7 w-7 rounded-full object-cover" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlnkscape.org%5D%2F%3E%3C/svg%3E"/>
</button>
</div>
<nav className="mt-4">
<div className="flex justify-around border-b border-gray-200">
<button onClick={() => setTimerDisplayMode('stopwatch')} className={`w-full py-3 text-center text-sm font-semibold border-b-2 ${timerDisplayMode === 'stopwatch' ? 'tab-active' : 'tab-inactive'}`}>Stopwatch</button>
<button onClick={() => setTimerDisplayMode('countdown')} className={`w-full py-3 text-center text-sm font-semibold border-b-2 ${timerDisplayMode === 'countdown' ? 'tab-active' : 'tab-inactive'}`}>Timer</button>
<button onClick={() => setTimerDisplayMode('manual')} className={`w-full py-3 text-center text-sm font-semibold border-b-2 ${timerDisplayMode === 'manual' ? 'tab-active' : 'tab-inactive'}`}>Manual</button>
</div>
</nav>
</header>
<main className="flex flex-1 flex-col items-center justify-center bg-white px-4">
{timerDisplayMode === 'stopwatch' && (
<div className="flex flex-1 flex-col items-center justify-center text-center">
<p className="text-7xl font-light tracking-widest text-gray-800 tabular-nums">{formatTimeHHMMSS(stopwatchSeconds)}</p>
<button onClick={handleStartStopwatch} className="mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-[#ccbbdc] text-gray-900 shadow-lg">
{isStopwatchRunning ? <PauseIcon className="w-9 h-9"/> : <PlayIcon className="w-9 h-9"/>}
</button>
<button onClick={handleResetStopwatch} className="mt-4 text-gray-500" disabled={stopwatchSeconds === 0 && !isStopwatchRunning}>
<ResetIcon className="w-6 h-6"/>
</button>
</div>
)}
{timerDisplayMode === 'countdown' && (
<div className="flex flex-1 flex-col items-center justify-center text-center">
<div className="flex justify-center items-center my-8">
<div className="relative w-64 h-64">
<svg className="w-full h-full" viewBox="0 0 120 120">
<circle className="text-gray-200" cx="60" cy="60" fill="transparent" r="56" stroke="currentColor" strokeWidth="8"></circle>
<circle className="progress-ring__circle text-purple-500" cx="60" cy="60" fill="transparent" r="56" stroke="currentColor" strokeDasharray="351.858" strokeDashoffset={Math.PI * 2 * 56 * (1 - ((countdownInitialDurationRef.current - countdownRemainingSeconds) / countdownInitialDurationRef.current) * 100)} strokeLinecap="round" strokeWidth="8"></circle>
</svg>
<div className="absolute inset-0 flex items-center justify-center">
<span className="text-4xl font-light text-gray-800">{formatTimeHHMMSS(countdownRemainingSeconds)}</span>
</div>
</div>
</div>
<div className="flex justify-center my-8">
<button onClick={handleStartCountdown} className="bg-purple-200 rounded-full w-20 h-20 flex items-center justify-center">
{isCountdownRunning ? <PauseIcon className="w-9 h-9"/> : <PlayIcon className="w-9 h-9"/>}
</button>
<button onClick={handleResetCountdown} className="ml-4 bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center" disabled={!isCountdownRunning && countdownRemainingSeconds === (countdownSetMinutes * 60)}>
<ResetIcon className="w-9 h-9"/>
</button>
</div>
<div className="my-8 px-4">
<input className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500" max="3600" min="0" type="range" value={countdownSetMinutes * 60} onChange={(e) => setCountdownSetMinutes(parseInt(e.target.value) / 60)} disabled={isCountdownRunning}/>
</div>
</div>
)}
{timerDisplayMode === 'manual' && (
<div className="space-y-6 my-12">
<div>
<label className="sr-only" htmlFor="duration">Duration</label>
<input className="w-full p-4 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" id="duration" placeholder="Duration (e.g., '30 min')" type="text" value={manualForm.durationMinutes} onChange={e => setManualForm(p => ({...p, durationMinutes: parseInt(e.target.value)}))}/>
</div>
<div>
<label className="sr-only" htmlFor="date">Date</label>
<input className="w-full p-4 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-500" id="date" type="date" value={manualForm.date} onChange={e => setManualForm(p => ({...p, date: e.target.value}))}/>
</div>
<div>
<label className="sr-only" htmlFor="start-time">Start Time (optional)</label>
<input className="w-full p-4 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-500" id="start-time" type="time" value={manualForm.startTime} onChange={e => setManualForm(p => ({...p, startTime: e.target.value}))}/>
</div>
</div>
)}
</main>
<div className="bg-gray-50 p-4">
<div className="space-y-4">
<div>
<label className="sr-only" htmlFor="activity">Activity</label>
<select className="select-input w-full rounded-xl border-gray-300 bg-white p-4 text-base text-gray-500 shadow-sm focus:border-violet-500 focus:ring-violet-500" id="activity" name="activity" value={selectedActivityName} onChange={e => setSelectedActivityName(e.target.value)}>
<option>Select Activity</option>
{(ANTIMETHOD_ACTIVITIES_DETAILS).map(activity => (
<option key={activity.name} value={activity.name}>{activity.name}</option>
))}
</select>
</div>
<div>
<label className="sr-only" htmlFor="custom-title">Custom Title</label>
<input className="w-full rounded-xl border-gray-300 bg-white p-4 text-base text-gray-700 shadow-sm focus:border-violet-500 focus:ring-violet-500" id="custom-title" name="custom-title" placeholder="Custom Title (e.g., 'Watching S01E02')" type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)}/>
</div>
<div>
<label className="sr-only" htmlFor="notes">Notes</label>
<textarea className="w-full rounded-xl border-gray-300 bg-white p-4 text-base text-gray-700 shadow-sm focus:border-violet-500 focus:ring-violet-500" id="notes" name="notes" placeholder="Notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
</div>
</div>
<div className="mt-6">
<button onClick={timerDisplayMode === 'manual' ? handleSaveManualLog : handleSaveActivity} className="w-full rounded-full bg-[#ccbbdc] py-4 text-base font-semibold text-gray-900 shadow-sm hover:bg-violet-400">
                    Save Activity
                </button>
</div>
</div>
</div>
  );
};