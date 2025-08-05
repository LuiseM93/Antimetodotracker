import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Language, ActivityCategory, ActivityLogEntry, AppView, TimerMode, ActivityDetailType, Skill } from '../../types.ts';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';
import { Button } from '../../components/Button.tsx';
import { PlayIcon, PauseIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons.tsx';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon.tsx';
import { SelectActivityModal } from './SelectActivityModal.tsx';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon.tsx';
import { Modal } from '../../components/Modal.tsx';
import { formatTimeHHMMSS } from '../../utils/timeUtils.ts';
import { addToOfflineQueue } from '../../services/offlineQueueService.ts';
import { usePersistentTimer } from '../../hooks/usePersistentTimer.ts';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

interface LocationState {
  reLogData?: Partial<ActivityLogEntry> & { language?: Language, duration_seconds?: number };
}

export const LogActivityScreen: React.FC = () => {
  const { userProfile, addActivityLog, updateActivityLog, activityLogs, addCustomActivity, deleteActivityLog, createFeedItem } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { logId } = useParams<{ logId?: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [currentLogEntry, setCurrentLogEntry] = useState<Partial<ActivityLogEntry>>({});
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [isSelectActivityModalOpenForManualLog, setIsSelectActivityModalOpenForManualLog] = useState(false);

  const defaultTimerState = useMemo(() => ({
    mode: userProfile?.defaultLogTimerMode ?? 'stopwatch',
    initialDuration: userProfile?.defaultLogDurationSeconds ?? 30 * 60,
    language: userProfile?.primaryLanguage || (userProfile?.learningLanguages && userProfile.learningLanguages.length > 0 ? userProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language),
  }), [userProfile]);

  const {
    timerState,
    displaySeconds,
    updateActivityDetails,
    setTimerMode,
    setCountdownDuration,
    start,
    pause,
    reset,
    clear,
  } = usePersistentTimer(defaultTimerState);

  const [manualForm, setManualForm] = useState<{
    language: Language,
    category: ActivityCategory | null,
    sub_activity: string,
    customTitle: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    notes: string
  }>({
    language: userProfile?.primaryLanguage || (userProfile?.learningLanguages && userProfile.learningLanguages.length > 0 ? userProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language),
    category: null,
    sub_activity: '',
    customTitle: '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().substring(0,5),
    durationMinutes: Math.round((userProfile?.defaultLogDurationSeconds || 1800) / 60),
    notes: ''
  });

  useEffect(() => {
    const currentPathState = location.state as LocationState | null;
    if (currentPathState?.reLogData && timerState?.status === 'idle') {
        const { reLogData } = currentPathState;
        updateActivityDetails({
            activityName: reLogData.sub_activity || 'Ninguna seleccionada',
            category: reLogData.category || null,
            customTitle: reLogData.custom_title || '',
            notes: reLogData.notes || '',
            language: reLogData.language || defaultTimerState.language,
            initialDuration: reLogData.duration_seconds || defaultTimerState.initialDuration,
            mode: reLogData.duration_seconds ? 'countdown' : defaultTimerState.mode,
        });
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, timerState, updateActivityDetails, navigate, defaultTimerState]);

  useEffect(() => {
    if (logId) {
        const logToEdit = activityLogs.find(log => log.id === logId);
        if (logToEdit) {
            clear(); // Clear any running timer
            setIsEditing(true);
            setCurrentLogEntry(logToEdit);
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
        } else {
            navigate(AppView.DASHBOARD);
        }
    }
  }, [logId, activityLogs, navigate, clear]);

  const showCompletionNotification = useCallback(async () => {
    if (!timerState || !("Notification" in window)) return;
    const activityDisplayName = timerState.customTitle.trim() || (timerState.activityName !== 'Ninguna seleccionada' ? timerState.activityName : 'Actividad');
    const notificationBody = `Tu sesión de '${activityDisplayName}' ha finalizado.`;
    if (Notification.permission === "granted") {
      new Notification("¡Tiempo Completado!", { body: notificationBody, icon: './assets/logo.png' });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("¡Tiempo Completado!", { body: notificationBody, icon: './assets/logo.png' });
      }
    }
    if (typeof Audio !== "undefined") new Audio('./assets/notification.mp3').play().catch(e => console.warn("Fallo al reproducir audio.", e));
  }, [timerState]);

  useEffect(() => {
    if (timerState?.status === 'completed') {
      showCompletionNotification();
    }
  }, [timerState?.status, showCompletionNotification]);

  const handleActivitySelected = (activity: ActivityDetailType) => {
    updateActivityDetails({ activityName: activity.name, category: activity.category || null });
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

  const handleSaveActivity = async () => {
    if (!timerState || !timerState.category || timerState.activityName === 'Ninguna seleccionada' || timerState.activityName.trim() === '') {
      alert("Por favor, selecciona una actividad.");
      return;
    }

    let durationToSaveSeconds = 0;
    if (timerState.mode === 'stopwatch') {
        durationToSaveSeconds = displaySeconds;
    } else { // countdown
        const elapsedSeconds = timerState.initialDuration - displaySeconds;
        if (timerState.status === 'running' || timerState.status === 'paused' || timerState.status === 'completed') {
            durationToSaveSeconds = elapsedSeconds;
        } else { // idle
            durationToSaveSeconds = timerState.initialDuration;
        }
    }
    
    if (durationToSaveSeconds <= 0) {
        alert("La duración debe ser positiva.");
        return;
    }

    const logEntryData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'> = {
      language: timerState.language,
      category: timerState.category,
      sub_activity: timerState.activityName,
      custom_title: timerState.customTitle.trim() || null,
      duration_seconds: durationToSaveSeconds,
      date: timerState.capturedDateTime?.date || new Date().toISOString().split('T')[0],
      start_time: timerState.capturedDateTime?.time || null,
      notes: timerState.notes.trim() || null,
    };
    
    const isPredefined = ANTIMETHOD_ACTIVITIES_DETAILS.some(a => a.name === timerState.activityName);
    if (!isPredefined) {
        addCustomActivity({ name: timerState.activityName, description: 'Actividad personalizada', category: timerState.category, skill: Skill.STUDY });
    }

    if (!navigator.onLine) {
        const offlineEntry: ActivityLogEntry = {
            ...logEntryData,
            id: `offline_${Date.now()}`,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
        };
        addToOfflineQueue(offlineEntry);
        alert("No tienes conexión. La actividad se ha guardado localmente y se subirá cuando vuelvas a conectarte.");
    } else {
        await addActivityLog(logEntryData);
        if (durationToSaveSeconds > 300) {
            await createFeedItem('activity_logged', {
                language: logEntryData.language,
                category: logEntryData.category,
                sub_activity: logEntryData.sub_activity,
                custom_title: logEntryData.custom_title,
                duration_seconds: logEntryData.duration_seconds
            });
        }
    }
    
    clear();
    navigate(AppView.DASHBOARD);
  };
  
  const handleSaveManualLog = async () => {
    const finalSubActivity = manualForm.sub_activity.trim();
    if (!manualForm.category || !finalSubActivity || finalSubActivity === "Ninguna seleccionada" || manualForm.durationMinutes <= 0) {
        alert("Completa la categoría, sub-actividad y asegúrate que la duración sea positiva.");
        return;
    }
    
    const durationInSeconds = manualForm.durationMinutes * 60;
    
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

    if (!navigator.onLine) {
        const offlineEntry: ActivityLogEntry = {
            ...logEntryData,
            id: `offline_${Date.now()}`,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
        };
        addToOfflineQueue(offlineEntry);
        alert("No tienes conexión. La actividad se ha guardado localmente y se subirá cuando vuelvas a conectarte.");
    } else {
        if (isEditing && currentLogEntry.id) {
            await updateActivityLog({ ...currentLogEntry, ...logEntryData, id: currentLogEntry.id } as ActivityLogEntry);
        } else {
            await addActivityLog(logEntryData);
        }
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

  if (!timerState) {
    return null; // Or a loading spinner
  }

  const { status, mode, activityName, category, customTitle, language, notes, capturedDateTime } = timerState;
  const isTimerActive = status === 'running' || status === 'paused';
  
  const renderTimerControls = () => {
    if (mode === 'stopwatch') {
      return (
        <>
          <div className={`text-7xl font-mono font-bold text-[var(--color-primary)] my-8`}>{formatTimeHHMMSS(displaySeconds)}</div>
          <div className="flex justify-center space-x-4">
             <Button onClick={status === 'running' ? pause : start} variant={status === 'running' ? "warning" : "success"} size="lg" className="px-8 py-4 rounded-full">
              {status === 'running' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
            </Button>
            <Button onClick={reset} variant="outline" size="lg" className="px-8 py-4 rounded-full" disabled={status === 'idle' && displaySeconds === 0}>
              <ResetIcon className="w-8 h-8"/>
            </Button>
          </div>
          {capturedDateTime && <p className="text-xs text-center text-[var(--color-text-light)] mt-3">Iniciado: {new Date(capturedDateTime.date + 'T' + capturedDateTime.time).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</p> }
        </>
      );
    }
    if (mode === 'countdown') {
        const progressPercent = timerState.initialDuration > 0 ? ((timerState.initialDuration - displaySeconds) / timerState.initialDuration) * 100 : 0;
        const countdownSetMinutes = Math.round(timerState.initialDuration / 60);
      return (
        <>
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 my-6">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle className="text-[var(--color-input-border)] opacity-50" strokeWidth="8" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
              <circle
                className="text-[var(--color-accent)]"
                strokeWidth="8"
                strokeDasharray={Math.PI * 2 * 52} 
                strokeDashoffset={Math.PI * 2 * 52 * (1 - progressPercent/100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="52" cx="60" cy="60"
                transform="rotate(-90 60 60)"
              />
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" className={`text-5xl font-mono font-bold ${status === 'completed' ? 'fill-green-500' : 'fill-[var(--color-primary)]'}`}>
                  {formatTimeHHMMSS(displaySeconds)}
              </text>
            </svg>
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="countdown-slider" className="text-sm text-[var(--color-text-light)]">
              Duración: {countdownSetMinutes} minutos
            </label>
            <input
              id="countdown-slider"
              type="range" min="1" max="180" step="1"
              value={countdownSetMinutes}
              onChange={(e) => setCountdownDuration(parseInt(e.target.value))}
              disabled={isTimerActive}
              className="w-full h-2 bg-[var(--color-light-purple)] rounded-lg appearance-none cursor-pointer mt-1 disabled:opacity-50"
            />
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={status === 'running' ? pause : start} variant={status === 'running' ? "warning" : "success"} size="lg" className="px-8 py-4 rounded-full" disabled={status === 'completed'}>
              {status === 'running' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
            </Button>
            <Button onClick={reset} variant="outline" size="lg" className="px-8 py-4 rounded-full" disabled={status === 'idle' && displaySeconds === timerState.initialDuration}>
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
        <div className="w-full max-w-md">
            <label htmlFor="language-select" className="block text-sm font-medium text-[var(--color-text-main)]">Idioma</label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => updateActivityDetails({ language: e.target.value as Language })}
                className={inputBaseStyle}
                disabled={isTimerActive}
            >
                {(userProfile?.learningLanguages?.length > 0 ? userProfile.learningLanguages : AVAILABLE_LANGUAGES_FOR_LEARNING).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
        </div>
        
        <div className="w-full max-w-md">
            <label htmlFor="activity-select-btn" className="block text-sm font-medium text-[var(--color-text-main)]">Actividad</label>
            <button
                id="activity-select-btn"
                onClick={() => !isTimerActive && setIsActivityModalOpen(true)}
                className={`${inputBaseStyle} text-left flex justify-between items-center`}
                disabled={isTimerActive}
            >
                <span className={activityName === 'Ninguna seleccionada' ? 'text-[var(--color-placeholder-text)]' : ''}>
                    {activityName}
                </span>
                <PlusCircleIcon className="w-5 h-5 text-gray-400" />
            </button>
            {category && (
                <p className="text-xs text-[var(--color-text-light)] mt-1">Categoría: {category}</p>
            )}
        </div>

        <div className="w-full max-w-md">
            <label htmlFor="custom-title" className="block text-sm font-medium text-[var(--color-text-main)]">Título Personalizado (Opcional)</label>
            <input 
                type="text" 
                id="custom-title"
                value={customTitle}
                onChange={e => updateActivityDetails({ customTitle: e.target.value })}
                placeholder="Ej: Viendo 'La Casa de Papel' T1 E3"
                className={inputBaseStyle}
                disabled={isTimerActive}
            />
        </div>

        <div className="w-full max-w-md flex bg-[var(--color-light-purple)] bg-opacity-30 rounded-lg p-1">
            <Button
                variant={mode === 'stopwatch' ? 'secondary' : 'ghost'}
                onClick={() => setTimerMode('stopwatch')}
                className="flex-1"
                disabled={isTimerActive}
            >
                Cronómetro
            </Button>
            <Button
                variant={mode === 'countdown' ? 'secondary' : 'ghost'}
                onClick={() => setTimerMode('countdown')}
                className="flex-1"
                 disabled={isTimerActive}
            >
                Temporizador
            </Button>
        </div>

        <div className="flex flex-col items-center justify-center w-full max-w-md">
          {renderTimerControls()}
        </div>

         <div className="w-full max-w-md">
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-main)]">Notas (Opcional)</label>
            <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={e => updateActivityDetails({ notes: e.target.value })}
                placeholder="Añade detalles sobre la actividad..."
                className={inputBaseStyle}
                disabled={isTimerActive}
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
          <Button variant="primary" size="lg" onClick={handleSaveActivity} className="flex-grow" disabled={status === 'running'}>
            Guardar Actividad
          </Button>
          <Button variant="outline" size="lg" onClick={() => setIsManualLogModalOpen(true)} className="flex-grow" disabled={isTimerActive}>
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
