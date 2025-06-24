
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Language, ActivityCategory, ActivityLogEntry, AppView, TimerMode, ActivityDetailType } from '../../types';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants';
import { Button } from '../../components/Button';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { SelectActivityModal } from './SelectActivityModal';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon';
import { Modal } from '../../components/Modal';
import { formatTimeHHMMSS } from '../../utils/timeUtils';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

type TimerDisplayMode = 'stopwatch' | 'countdown';

interface LocationState {
  reLogData?: Partial<ActivityLogEntry> & { language?: Language, durationMinutes?: number };
}

export const LogActivityScreen: React.FC = () => {
  const { userProfile, addActivityLog, updateActivityLog, activityLogs } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { logId } = useParams<{ logId?: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [currentLogEntry, setCurrentLogEntry] = useState<Partial<ActivityLogEntry>>({});

  const [selectedActivityName, setSelectedActivityName] = useState<string>('Ninguna seleccionada');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [currentLanguageForLog, setCurrentLanguageForLog] = useState<Language>(
    userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language
  );
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [timerDisplayMode, setTimerDisplayMode] = useState<TimerDisplayMode>(userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch');

  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchIntervalRef = useRef<number | null>(null);

  const [countdownSetMinutes, setCountdownSetMinutes] = useState<number>(userProfile?.defaultLogDurationMinutes || 30);
  const [countdownRemainingSeconds, setCountdownRemainingSeconds] = useState<number>(countdownSetMinutes * 60);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);
  const countdownInitialDurationRef = useRef<number>(countdownSetMinutes * 60);
  const countdownIntervalRef = useRef<number | null>(null);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(false);
  
  const [notes, setNotes] = useState<string>('');
  const [capturedDateTime, setCapturedDateTime] = useState<{date: string, time: string} | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [initialManualDuration, setInitialManualDuration] = useState<number>(userProfile?.defaultLogDurationMinutes || 30);
  const [manualForm, setManualForm] = useState<{
    language: Language,
    category: ActivityCategory | null,
    subActivity: string,
    customTitle: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    notes: string
  }>({
    language: userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language,
    category: null,
    subActivity: '',
    customTitle: '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().substring(0,5),
    durationMinutes: userProfile?.defaultLogDurationMinutes || 30,
    notes: ''
  });

  const [isSelectActivityModalOpenForManualLog, setIsSelectActivityModalOpenForManualLog] = useState(false);
  const reLogProcessedRef = useRef(false); // Ref to track if reLogData was just processed

  useEffect(() => {
    const currentPathState = location.state as LocationState | null;

    if (currentPathState?.reLogData) {
        const { reLogData } = currentPathState;
        setIsEditing(false); 
        setCurrentLogEntry({}); 

        setSelectedActivityName(reLogData.subActivity || 'Ninguna seleccionada');
        setSelectedCategory(reLogData.category || null);
        setCustomTitle(reLogData.customTitle || '');
        setNotes(reLogData.notes || '');
        setCurrentLanguageForLog(reLogData.language || userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
        setInitialManualDuration(reLogData.durationMinutes ?? userProfile?.defaultLogDurationMinutes ?? 30);

        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setStopwatchSeconds(0);
        setIsStopwatchRunning(false);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setIsCountdownRunning(false);
        setCountdownComplete(false);

        let initialSeconds;
        if (reLogData.durationMinutes && reLogData.durationMinutes > 0) {
            setTimerDisplayMode('countdown');
            setCountdownSetMinutes(reLogData.durationMinutes);
            initialSeconds = reLogData.durationMinutes * 60;
        } else {
            const defaultMode = userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch';
            setTimerDisplayMode(defaultMode);
            const defaultDuration = userProfile?.defaultLogDurationMinutes || 30;
            setCountdownSetMinutes(defaultDuration);
            initialSeconds = defaultDuration * 60;
        }
        countdownInitialDurationRef.current = initialSeconds;
        setCountdownRemainingSeconds(initialSeconds);
        
        setCapturedDateTime(null);
        
        reLogProcessedRef.current = true; // Mark as processed
        navigate(location.pathname, { replace: true, state: {} }); // Clear state, will re-trigger effect

    } else if (logId) {
        reLogProcessedRef.current = false; // Reset for other scenarios
        const logToEdit = activityLogs.find(log => log.id === logId);
        if (logToEdit) {
            setIsEditing(true);
            setCurrentLogEntry(logToEdit);
            setSelectedActivityName(logToEdit.subActivity);
            setSelectedCategory(logToEdit.category);
            setCustomTitle(logToEdit.customTitle || '');
            setCurrentLanguageForLog(logToEdit.language);
            setNotes(logToEdit.notes || '');
            setInitialManualDuration(logToEdit.durationMinutes);
            
            setManualForm({
                language: logToEdit.language,
                category: logToEdit.category,
                subActivity: logToEdit.subActivity, 
                customTitle: logToEdit.customTitle || '',
                date: logToEdit.date,
                startTime: logToEdit.startTime || new Date().toTimeString().substring(0,5),
                durationMinutes: logToEdit.durationMinutes,
                notes: logToEdit.notes || ''
            });
            setIsManualLogModalOpen(true);

            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
            setStopwatchSeconds(0); setIsStopwatchRunning(false);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            const defaultDurationForEdit = userProfile?.defaultLogDurationMinutes || 30;
            setCountdownSetMinutes(defaultDurationForEdit); 
            setCountdownRemainingSeconds(defaultDurationForEdit * 60); setIsCountdownRunning(false); setCountdownComplete(false);
            setCapturedDateTime(null);

        } else {
            navigate(AppView.DASHBOARD); 
        }
    } else {
        // This block is for a brand new log, or if the effect re-runs after reLogData was cleared
        if (reLogProcessedRef.current) {
            // Re-log was just processed and state cleared, skip resetting fields
            reLogProcessedRef.current = false; // Reset the flag for next time
            return; // Exit effect early
        }
        // Proceed with new log initialization
        setIsEditing(false);
        setCurrentLogEntry({});
        setSelectedActivityName('Ninguna seleccionada');
        setSelectedCategory(null);
        setCustomTitle('');
        setCurrentLanguageForLog(userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
        setNotes('');
        
        const defaultDurationNew = userProfile?.defaultLogDurationMinutes || 30;
        setInitialManualDuration(defaultDurationNew);
        setTimerDisplayMode(userProfile?.defaultLogTimerMode === 'countdown' ? 'countdown' : 'stopwatch');
        
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setStopwatchSeconds(0); setIsStopwatchRunning(false);
        
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdownSetMinutes(defaultDurationNew);
        const initialSecondsNew = defaultDurationNew * 60;
        setCountdownRemainingSeconds(initialSecondsNew);
        countdownInitialDurationRef.current = initialSecondsNew;
        setIsCountdownRunning(false); setCountdownComplete(false);
        
        setCapturedDateTime(null);
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
      subActivity: activity.name,
      category: activity.category || null,
    }));
    setIsSelectActivityModalOpenForManualLog(false);
  };


  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = window.setInterval(() => setStopwatchSeconds(prev => prev + 1), 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => { if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current); };
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (!isCountdownRunning) {
        countdownInitialDurationRef.current = countdownSetMinutes * 60;
        setCountdownRemainingSeconds(countdownInitialDurationRef.current);
        setCountdownComplete(false); 
    }
  }, [countdownSetMinutes, isCountdownRunning]); 

  useEffect(() => {
    if (isCountdownRunning && countdownRemainingSeconds > 0) {
      countdownIntervalRef.current = window.setInterval(() => setCountdownRemainingSeconds(prev => prev - 1), 1000);
    } else if (countdownRemainingSeconds === 0 && isCountdownRunning) {
      setIsCountdownRunning(false);
      setCountdownComplete(true);
      if (typeof Audio !== "undefined") {
        new Audio('assets/notification.mp3').play().catch(e => console.warn("Fallo al reproducir audio.", e));
      }
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [isCountdownRunning, countdownRemainingSeconds]);


  const startTimerCommonLogic = () => {
    const now = new Date();
    setCapturedDateTime({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0,5)
    });
  };

  const handleStartStopwatch = () => {
    if (!isStopwatchRunning && stopwatchSeconds === 0) startTimerCommonLogic();
    setIsStopwatchRunning(prev => !prev);
  };
  const handleResetStopwatch = () => { setIsStopwatchRunning(false); setStopwatchSeconds(0); setCapturedDateTime(null); };

  const handleStartCountdown = () => {
    if (countdownSetMinutes <= 0) { alert("Establece una duración positiva."); return; }
    if (!isCountdownRunning && countdownRemainingSeconds === countdownInitialDurationRef.current) startTimerCommonLogic();
    setIsCountdownRunning(prev => !prev);
    if (countdownComplete) setCountdownComplete(false); 
  };
  const handleResetCountdown = () => {
    setIsCountdownRunning(false);
    setCountdownRemainingSeconds(countdownInitialDurationRef.current); 
    setCountdownComplete(false);
    setCapturedDateTime(null);
  };

  const handleSaveActivity = () => {
    if (!selectedCategory || selectedActivityName === 'Ninguna seleccionada' || selectedActivityName.trim() === '') {
      alert("Por favor, selecciona una actividad.");
      return;
    }

    let durationToSave = 0;
    let dateToSave = capturedDateTime ? capturedDateTime.date : new Date().toISOString().split('T')[0];
    let timeToSave = capturedDateTime ? capturedDateTime.time : undefined;

    if (timerDisplayMode === 'stopwatch' && stopwatchSeconds > 0) {
      durationToSave = Math.max(1, Math.round(stopwatchSeconds / 60));
    } else if (timerDisplayMode === 'countdown') {
      if (isCountdownRunning || countdownComplete || (countdownInitialDurationRef.current > 0 && countdownRemainingSeconds < countdownInitialDurationRef.current)) { 
        durationToSave = Math.max(1, Math.round((countdownInitialDurationRef.current - (isCountdownRunning ? countdownRemainingSeconds : 0)) / 60));
      } else if (countdownSetMinutes > 0 && !isCountdownRunning && !countdownComplete && countdownRemainingSeconds === countdownInitialDurationRef.current) {
        durationToSave = countdownSetMinutes;
        dateToSave = new Date().toISOString().split('T')[0];
        timeToSave = new Date().toTimeString().substring(0,5);
      } else {
         alert("No hay tiempo registrado por el temporizador/cronómetro o la duración es cero.");
         return;
      }
    } else {
      alert("Modo de temporizador no reconocido o sin tiempo.");
      return;
    }
    
    if (durationToSave <= 0) {
        alert("La duración debe ser positiva.");
        return;
    }

    const logEntryData: Omit<ActivityLogEntry, 'id'> = {
      language: currentLanguageForLog,
      category: selectedCategory,
      subActivity: selectedActivityName,
      customTitle: customTitle.trim() || undefined,
      durationMinutes: durationToSave,
      date: dateToSave,
      startTime: timeToSave,
      notes: notes.trim() || undefined,
    };

    addActivityLog(logEntryData);
    navigate(AppView.DASHBOARD);
  };
  
  const handleSaveManualLog = () => {
    const finalSubActivity = manualForm.subActivity.trim();
    if (!manualForm.category || !finalSubActivity || finalSubActivity === "Ninguna seleccionada" || manualForm.durationMinutes <= 0) {
        alert("Completa la categoría, sub-actividad y asegúrate que la duración sea positiva.");
        return;
    }

    const logEntryData: Omit<ActivityLogEntry, 'id'> = {
      language: manualForm.language,
      category: manualForm.category,
      subActivity: finalSubActivity,
      customTitle: manualForm.customTitle.trim() || undefined,
      durationMinutes: manualForm.durationMinutes,
      date: manualForm.date,
      startTime: manualForm.startTime || undefined,
      notes: manualForm.notes.trim() || undefined,
    };

    if (isEditing && currentLogEntry.id) {
        updateActivityLog({ ...currentLogEntry, ...logEntryData, id: currentLogEntry.id } as ActivityLogEntry);
    } else {
        addActivityLog(logEntryData);
    }
    setIsManualLogModalOpen(false);
    navigate(AppView.DASHBOARD); 
  };

  const closeManualLogModal = () => {
    setIsManualLogModalOpen(false);
    if (isEditing) {
      navigate(-1); // Go back to the previous screen (Dashboard or Tracker)
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
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" className={`text-3xl sm:text-4xl font-mono font-bold ${countdownComplete ? "fill-[var(--color-success)]" : "fill-[var(--color-primary)]"}`}>
                {countdownComplete ? "¡LISTO!" : formatTimeHHMMSS(countdownRemainingSeconds)}
              </text>
            </svg>
          </div>

          {!isCountdownRunning && !countdownComplete && (
            <div className="flex items-center space-x-2 mb-4 w-full max-w-xs px-2">
                <Button onClick={() => setCountdownSetMinutes(m => Math.max(1, m - 5))} size="sm" variant="ghost" className="p-1.5">-5m</Button>
                <input 
                    type="range" 
                    min="1" 
                    max="180" 
                    value={countdownSetMinutes} 
                    onChange={e => setCountdownSetMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--color-light-purple)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-50"
                    aria-label="Duración del temporizador"
                />
                <Button onClick={() => setCountdownSetMinutes(m => Math.min(180, m + 5))} size="sm" variant="ghost" className="p-1.5">+5m</Button>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button onClick={handleStartCountdown} variant={isCountdownRunning ? "warning" : "success"} size="lg" className="px-8 py-4 rounded-full">
              {isCountdownRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
            </Button>
            <Button onClick={handleResetCountdown} variant="outline" size="lg" className="px-8 py-4 rounded-full" disabled={countdownRemainingSeconds === countdownInitialDurationRef.current && !isCountdownRunning && !countdownComplete}>
               <ResetIcon className="w-8 h-8"/>
            </Button>
          </div>
          {capturedDateTime && <p className="text-xs text-center text-[var(--color-text-light)] mt-3">Iniciado: {new Date(capturedDateTime.date + 'T' + capturedDateTime.time).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</p>}
        </>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen bg-[var(--color-app-bg)] flex flex-col items-center justify-between py-0`}>
      <header className={`w-full flex items-center justify-between p-4 bg-[var(--color-nav-bg)] text-[var(--color-nav-text)]`}>
        <Button variant="ghost" onClick={() => navigate(-1)} aria-label="Volver" className="p-2 -ml-2 text-current">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className={`text-lg font-poppins font-semibold`}>
          {isEditing ? 'Editar Actividad' : 'Registrar Actividad'}
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      <div className="w-full flex-grow flex flex-col items-center justify-center p-4 text-center">
        <Button 
          variant="outline" 
          onClick={() => setIsActivityModalOpen(true)} 
          className="mb-3 py-3 px-6 text-lg border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-purple-50 dark:hover:bg-purple-900/30"
          disabled={isEditing} 
        >
          {selectedActivityName}
        </Button>
        
        <input
            type="text"
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            placeholder="Título (ej: Friends)"
            className={`${inputBaseStyle} mb-6 text-sm max-w-xs mx-auto`}
            aria-label="Título personalizado para la actividad"
            disabled={isEditing}
        />


        <div className="flex border-b border-[var(--color-light-purple)] mb-6 w-full max-w-sm">
            {(['stopwatch', 'countdown'] as TimerDisplayMode[]).map(mode => (
              <button 
                key={mode} 
                type="button" 
                onClick={() => {
                    if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
                    setStopwatchSeconds(0); setIsStopwatchRunning(false);
                    
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    const currentSetDurationSeconds = countdownSetMinutes * 60;
                    setCountdownRemainingSeconds(currentSetDurationSeconds); 
                    countdownInitialDurationRef.current = currentSetDurationSeconds;
                    setIsCountdownRunning(false); setCountdownComplete(false);
                    
                    setCapturedDateTime(null); 
                    setTimerDisplayMode(mode);
                }}
                className={`flex-1 py-3 px-2 text-sm font-medium focus:outline-none transition-colors duration-150
                            ${timerDisplayMode === mode 
                                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold' 
                                : 'text-[var(--color-text-light)] hover:bg-purple-50 hover:text-[var(--color-secondary)] dark:hover:bg-purple-900/20'}`}
                 disabled={isEditing}
              >
                {mode === 'stopwatch' ? 'Cronómetro' : 'Temporizador'}
              </button>
            ))}
        </div>
        
        {!isEditing && renderTimerControls()}
        {isEditing && <p className="text-center text-[var(--color-text-light)] my-8">Editando detalles manualmente. Los temporizadores no están activos.</p>}

      </div>

      <div className="w-full p-4 space-y-3 border-t border-[var(--color-border-light)] bg-[var(--color-card-bg)]">
        <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Notas (opcional)..." 
            rows={2}
            className={`${inputBaseStyle} text-sm`}
            disabled={isEditing}
        />
        <div className="grid grid-cols-2 gap-3">
             <Button 
                variant="outline" 
                onClick={() => {
                    let formDate, formStartTime, formDuration, formLang, formCat, formSubAct, formCustTitle, formLogNotes;

                    if (isEditing && currentLogEntry.id) { 
                        formDate = currentLogEntry.date || new Date().toISOString().split('T')[0];
                        formStartTime = currentLogEntry.startTime || new Date().toTimeString().substring(0,5);
                        formDuration = currentLogEntry.durationMinutes || initialManualDuration;
                        formLang = currentLogEntry.language || currentLanguageForLog;
                        formCat = currentLogEntry.category || selectedCategory;
                        formSubAct = currentLogEntry.subActivity || (selectedActivityName !== "Ninguna seleccionada" ? selectedActivityName : '');
                        formCustTitle = currentLogEntry.customTitle || customTitle;
                        formLogNotes = currentLogEntry.notes || notes;
                    } else { 
                        formDate = new Date().toISOString().split('T')[0];
                        formStartTime = new Date().toTimeString().substring(0,5);
                        formDuration = initialManualDuration; 
                        formLang = currentLanguageForLog;     
                        formCat = selectedCategory;           
                        formSubAct = (selectedActivityName !== "Ninguna seleccionada" ? selectedActivityName : ''); 
                        formCustTitle = customTitle;          
                        formLogNotes = notes;                 
                    }

                    setManualForm({
                        language: formLang,
                        category: formCat,
                        subActivity: formSubAct,
                        customTitle: formCustTitle,
                        notes: formLogNotes,
                        date: formDate,
                        startTime: formStartTime,
                        durationMinutes: formDuration,
                    });
                    setIsManualLogModalOpen(true);
                }}
                className="py-3 text-base"
            >
                {isEditing ? "Ver/Editar Detalles" : "Registro Manual"}
            </Button>
            <Button 
                variant="primary" 
                onClick={handleSaveActivity} 
                disabled={isEditing || (!isStopwatchRunning && stopwatchSeconds === 0 && timerDisplayMode === 'stopwatch') || 
                            (!isCountdownRunning && !countdownComplete && timerDisplayMode === 'countdown' && !(timerDisplayMode === 'countdown' && countdownSetMinutes > 0 && countdownRemainingSeconds === (countdownSetMinutes*60) )) || 
                            selectedCategory === null || selectedActivityName === 'Ninguna seleccionada'}
                className="py-3 text-base"
            >
                Guardar Actividad
            </Button>
        </div>
      </div>

      <SelectActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onActivitySelected={handleActivitySelected}
      />
      
      <Modal 
        isOpen={isManualLogModalOpen} 
        onClose={closeManualLogModal} 
        title={isEditing ? "Editar Registro Manual" : "Registro Manual Detallado"}
    >
        <div className="space-y-4">
            <div className="text-sm text-[var(--color-text-main)] mb-1">Actividad:</div>
            <Button
                variant="outline"
                onClick={() => setIsSelectActivityModalOpenForManualLog(true)}
                className="w-full py-3 text-left justify-start"
            >
                {manualForm.subActivity || "Seleccionar Actividad"}
                {manualForm.category && <span className="ml-2 text-xs text-[var(--color-text-light)]">({manualForm.category})</span>}
            </Button>
            
            <div>
              <label htmlFor="manualCustomTitle" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Título Específico (Opcional)</label>
              <input type="text" id="manualCustomTitle" value={manualForm.customTitle} 
                onChange={(e) => setManualForm(p => ({...p, customTitle: e.target.value}))} 
                className={inputBaseStyle} placeholder="Título (ej: Friends S01E01)"/>
            </div>

          <div>
            <label htmlFor="manualLanguage" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Idioma</label>
            <select id="manualLanguage" value={manualForm.language} onChange={(e) => setManualForm(p => ({...p, language: e.target.value as Language}))} className={inputBaseStyle}>
              {(userProfile?.learningLanguages.length ? userProfile.learningLanguages : AVAILABLE_LANGUAGES_FOR_LEARNING).map(lang => (<option key={lang} value={lang}>{lang}</option>))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualDate" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Fecha</label>
              <input type="date" id="manualDate" value={manualForm.date} onChange={(e) => setManualForm(p => ({...p, date: e.target.value}))} className={inputBaseStyle} />
            </div>
            <div>
              <label htmlFor="manualStartTime" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Hora Inicio (Opcional)</label>
              <input type="time" id="manualStartTime" value={manualForm.startTime} onChange={(e) => setManualForm(p => ({...p, startTime: e.target.value}))} className={inputBaseStyle} />
            </div>
          </div>
          <div>
            <label htmlFor="manualDurationMinutes" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Duración (minutos)</label>
            <input type="number" id="manualDurationMinutes" value={manualForm.durationMinutes} 
              onChange={(e) => setManualForm(p => ({...p, durationMinutes: Math.max(0, parseInt(e.target.value,10) || 0)}))} 
              min="0" step="1" className={inputBaseStyle} />
          </div>
          <div>
            <label htmlFor="manualNotes" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Notas (Opcional)</label>
            <textarea id="manualNotes" value={manualForm.notes} onChange={(e) => setManualForm(p => ({...p, notes: e.target.value}))} rows={2}
              className={inputBaseStyle} />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={closeManualLogModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveManualLog}>{isEditing ? "Guardar Cambios" : "Guardar Registro Manual"}</Button>
          </div>
        </div>
      </Modal>

      <SelectActivityModal
        isOpen={isSelectActivityModalOpenForManualLog}
        onClose={() => setIsSelectActivityModalOpenForManualLog(false)}
        onActivitySelected={handleManualLogActivitySelected}
      />

    </div>
  );
};
