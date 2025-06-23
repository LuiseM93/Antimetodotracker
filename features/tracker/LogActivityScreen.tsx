
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Language, ActivityCategory, ActivityLogEntry, AppView, TimerMode } from '../../types';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ACTIVITY_CATEGORIES_OPTIONS, COMMON_SUB_ACTIVITIES } from '../../constants';
import { Button } from '../../components/Button';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { Card } from '../../components/Card'; // For the placeholder

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (hours > 0) {
    formatted = `${String(hours).padStart(2, '0')}:${formatted}`;
  }
  return formatted;
};

// TimerMode type is now imported from types.ts

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const LogActivityScreen: React.FC = () => {
  const { userProfile, addActivityLog, updateActivityLog, activityLogs } = useAppContext();
  const navigate = useNavigate();
  const { logId } = useParams<{ logId?: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityLogEntry | null>(null);

  const [language, setLanguage] = useState<Language>(userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
  const [category, setCategory] = useState<ActivityCategory>(ACTIVITY_CATEGORIES_OPTIONS[0]);
  const [subActivity, setSubActivity] = useState<string>('');
  const [customSubActivity, setCustomSubActivity] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(userProfile?.defaultLogDurationMinutes || 30);
  const [notes, setNotes] = useState<string>('');
  
  const [timerMode, setTimerMode] = useState<TimerMode>(userProfile?.defaultLogTimerMode || 'manual');
  
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchIntervalRef = useRef<number | null>(null);

  const initialDefaultCountdownDuration = (userProfile?.defaultLogDurationMinutes || 30) * 60;
  const [countdownSeconds, setCountdownSeconds] = useState<number>(initialDefaultCountdownDuration);
  const [initialCountdownDuration, setInitialCountdownDuration] = useState<number>(initialDefaultCountdownDuration);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(false);
  const countdownIntervalRef = useRef<number | null>(null);
  
  const [showBulkAddInfo, setShowBulkAddInfo] = useState(false);


  const resetForm = useCallback(() => {
    setLanguage(userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
    const initialCategory = ACTIVITY_CATEGORIES_OPTIONS[0];
    setCategory(initialCategory);
    setSubActivity(COMMON_SUB_ACTIVITIES[initialCategory]?.[0] || '');
    setCustomSubActivity('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    const defaultDuration = userProfile?.defaultLogDurationMinutes || 30;
    setDurationMinutes(defaultDuration);
    setNotes('');
    setTimerMode(userProfile?.defaultLogTimerMode || 'manual');
    
    if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    setStopwatchSeconds(0);
    setIsStopwatchRunning(false);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    const initialDurationForCountdown = defaultDuration * 60;
    setCountdownSeconds(initialDurationForCountdown);
    setInitialCountdownDuration(initialDurationForCountdown);
    setIsCountdownRunning(false);
    setCountdownComplete(false);
  }, [userProfile]);

  useEffect(() => {
    if (logId) {
      const logToEdit = activityLogs.find(log => log.id === logId);
      if (logToEdit) {
        setIsEditing(true);
        setActivityToEdit(logToEdit);
        setLanguage(logToEdit.language);
        setCategory(logToEdit.category);
        
        const currentCommonSubsForCategory = COMMON_SUB_ACTIVITIES[logToEdit.category] || [];
        if (currentCommonSubsForCategory.includes(logToEdit.subActivity)) {
            setSubActivity(logToEdit.subActivity);
            setCustomSubActivity('');
        } else {
            setSubActivity('custom');
            setCustomSubActivity(logToEdit.subActivity);
        }
        
        setDate(logToEdit.date);
        setStartTime(logToEdit.startTime || '');
        setDurationMinutes(logToEdit.durationMinutes);
        setNotes(logToEdit.notes || '');
        setTimerMode('manual'); // When editing, always start in manual mode regardless of user preference

        const initialDurationForCountdown = logToEdit.durationMinutes * 60;
        setCountdownSeconds(initialDurationForCountdown);
        setInitialCountdownDuration(initialDurationForCountdown);
      } else {
        navigate(AppView.DASHBOARD); 
      }
    } else {
      setIsEditing(false);
      setActivityToEdit(null);
      resetForm(); // This will apply user preferences for new logs
    }
  }, [logId, activityLogs, navigate, resetForm]);

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = window.setInterval(() => setStopwatchSeconds(prev => prev + 1), 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => { if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current); };
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (isCountdownRunning && countdownSeconds > 0) {
      countdownIntervalRef.current = window.setInterval(() => setCountdownSeconds(prev => prev - 1), 1000);
    } else if (countdownSeconds === 0 && isCountdownRunning) {
      setIsCountdownRunning(false);
      setCountdownComplete(true);
      // new Audio('/assets/notification.mp3').play().catch(e => console.warn("Audio play failed", e));
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [isCountdownRunning, countdownSeconds]);

  useEffect(() => {
    if (timerMode === 'countdown' && !isCountdownRunning) {
        const newTotalSeconds = durationMinutes * 60;
        setCountdownSeconds(newTotalSeconds);
        setInitialCountdownDuration(newTotalSeconds);
        setCountdownComplete(false);
    }
  }, [durationMinutes, timerMode, isCountdownRunning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let currentDuration = durationMinutes;
    if (timerMode === 'stopwatch' && stopwatchSeconds > 0 && !isStopwatchRunning) {
        currentDuration = Math.max(1, Math.round(stopwatchSeconds / 60));
    } else if (timerMode === 'countdown' && (isCountdownRunning || countdownComplete)) {
         currentDuration = Math.max(1, Math.round( (initialCountdownDuration - (isCountdownRunning ? countdownSeconds : 0) ) / 60));
    }
    
    const finalSubActivity = subActivity === 'custom' ? customSubActivity.trim() : subActivity;

    if (!finalSubActivity || finalSubActivity.trim() === '' || currentDuration <= 0) {
      alert("Por favor, completa la sub-actividad y asegúrate que la duración sea positiva.");
      return;
    }
    
    const logEntryData: Omit<ActivityLogEntry, 'id'> = {
      language, category, subActivity: finalSubActivity, durationMinutes: currentDuration,
      date, startTime: startTime || undefined, notes,
    };

    if (isEditing && activityToEdit) {
      updateActivityLog({ ...activityToEdit, ...logEntryData });
    } else {
      addActivityLog(logEntryData);
    }
    navigate(AppView.DASHBOARD);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setTimerMode(newMode);
    if (isStopwatchRunning) setIsStopwatchRunning(false);
    if (isCountdownRunning) setIsCountdownRunning(false);
    setCountdownComplete(false);
    if (newMode === 'countdown') {
        // Use current durationMinutes (which might be user preference or manually set)
        const newTotalSeconds = durationMinutes * 60;
        setCountdownSeconds(newTotalSeconds);
        setInitialCountdownDuration(newTotalSeconds);
    }
  };
  
  const toggleStopwatch = () => setIsStopwatchRunning(prev => !prev);
  const resetStopwatch = () => { setIsStopwatchRunning(false); setStopwatchSeconds(0); };
  const useStopwatchTime = () => {
    setIsStopwatchRunning(false);
    setDurationMinutes(Math.max(1, Math.round(stopwatchSeconds / 60)));
  };

  const toggleCountdown = () => {
    if (durationMinutes <= 0 && !isCountdownRunning) {
        alert("Por favor, establece una duración positiva para el temporizador."); return;
    }
    if (countdownComplete) setCountdownComplete(false); // Reset complete state on new start
    // If starting from 0 and not running, re-initialize with current durationMinutes
    if (countdownSeconds === 0 && !isCountdownRunning) {
        const newTotalSeconds = durationMinutes * 60;
        setCountdownSeconds(newTotalSeconds);
        setInitialCountdownDuration(newTotalSeconds);
    }
    setIsCountdownRunning(prev => !prev);
  };
  const resetCountdown = () => { 
    setIsCountdownRunning(false); 
    // Reset to the duration currently in the durationMinutes input field
    const currentDurationInField = durationMinutes * 60;
    setCountdownSeconds(currentDurationInField); 
    setInitialCountdownDuration(currentDurationInField);
    setCountdownComplete(false); 
  };

  const currentCommonSubs = COMMON_SUB_ACTIVITIES[category] || [];
   const subActivityValue = subActivity === 'custom' 
                            ? 'custom' 
                            : (currentCommonSubs.includes(subActivity) ? subActivity : (currentCommonSubs[0] || ''));


  return (
    <div className={`min-h-screen bg-[var(--color-app-bg)] flex flex-col items-center py-6 px-4`}>
      <div className={`w-full max-w-lg bg-[var(--color-card-bg)] shadow-xl rounded-xl overflow-hidden`}>
        <header className={`flex items-center justify-between p-5 border-b border-[var(--color-light-purple)]`}>
          <Button variant="ghost" onClick={() => navigate(-1)} aria-label="Volver" className="p-2 -ml-2">
            <ChevronLeftIcon className="w-6 h-6 text-[var(--color-primary)]" />
          </Button>
          <h1 className={`text-xl font-poppins font-bold text-[var(--color-primary)]`}>
            {isEditing ? 'Editar Actividad' : 'Registrar Actividad'}
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <div className="flex border-b border-[var(--color-light-purple)]">
            {(['manual', 'stopwatch', 'countdown'] as TimerMode[]).map(mode => (
              <button 
                key={mode} 
                type="button" 
                onClick={() => handleModeChange(mode)}
                className={`flex-1 py-3 px-2 text-sm font-medium focus:outline-none transition-colors duration-150
                            ${timerMode === mode 
                                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' 
                                : 'text-[var(--color-text-light)] hover:bg-purple-50 hover:text-[var(--color-secondary)]'}`}
              >
                {mode === 'manual' ? 'Manual' : mode === 'stopwatch' ? 'Cronómetro' : 'Temporizador'}
              </button>
            ))}
        </div>
        
        <div className={`p-6 text-center space-y-4 bg-purple-50/30 min-h-[160px] flex flex-col justify-center items-center`}>
            {timerMode === 'stopwatch' && (
              <>
                <div className={`text-6xl font-mono font-bold text-[var(--color-primary)]`}>{formatTime(stopwatchSeconds)}</div>
                <div className="flex justify-center space-x-3">
                  <Button type="button" onClick={toggleStopwatch} variant={isStopwatchRunning ? "warning" : "success"} size="md" leftIcon={isStopwatchRunning ? <PauseIcon /> : <PlayIcon />}>
                    {isStopwatchRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  <Button type="button" onClick={resetStopwatch} variant="outline" size="md" disabled={isStopwatchRunning && stopwatchSeconds === 0} leftIcon={<ResetIcon />}>
                    Reiniciar
                  </Button>
                  <Button type="button" onClick={useStopwatchTime} variant="primary" size="md" disabled={isStopwatchRunning || stopwatchSeconds === 0} leftIcon={<StopIcon />}>
                    Usar Tiempo
                  </Button>
                </div>
              </>
            )}
            {timerMode === 'countdown' && (
              <>
                <div className={`text-6xl font-mono font-bold ${countdownComplete ? `text-[var(--color-success)]` : `text-[var(--color-primary)]`}`}>
                    {countdownComplete ? "¡LISTO!" : formatTime(countdownSeconds)}
                </div>
                 <div className="flex justify-center space-x-3">
                  <Button type="button" onClick={toggleCountdown} variant={isCountdownRunning ? "warning" : "success"} size="md" disabled={durationMinutes <=0 && !isCountdownRunning && !countdownComplete} leftIcon={isCountdownRunning ? <PauseIcon /> : <PlayIcon />}>
                    {isCountdownRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  <Button type="button" onClick={resetCountdown} variant="outline" size="md" disabled={isCountdownRunning && countdownSeconds === initialCountdownDuration} leftIcon={<ResetIcon />}>
                    Reiniciar
                  </Button>
                </div>
              </>
            )}
            {timerMode === 'manual' && (
                <p className={`text-lg text-[var(--color-text-light)]`}>Introduce los detalles de la actividad manualmente.</p>
            )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="language" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Idioma</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputBaseStyle}>
                {userProfile?.learningLanguages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Categoría</label>
              <select id="category" value={category}
                onChange={(e) => {
                    const newCategory = e.target.value as ActivityCategory;
                    setCategory(newCategory);
                    const newCommonSubs = COMMON_SUB_ACTIVITIES[newCategory] || [];
                    setSubActivity(newCommonSubs[0] || ''); 
                    setCustomSubActivity('');
                }} className={inputBaseStyle}>
                {ACTIVITY_CATEGORIES_OPTIONS.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="subActivity" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Sub-Actividad</label>
              <select id="subActivity" value={subActivityValue}
                onChange={(e) => {
                    const val = e.target.value;
                    setSubActivity(val);
                    if (val !== 'custom') setCustomSubActivity('');
                }} className={inputBaseStyle}>
                {currentCommonSubs.map(sub => (<option key={sub} value={sub}>{sub}</option>))}
                <option value="custom">Otra (especificar)</option>
              </select>
            </div>
            {(subActivity === 'custom') && (
              <div>
                <label htmlFor="customSubActivity" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Nombre Sub-Actividad Personalizada</label>
                <input type="text" id="customSubActivity" value={customSubActivity} onChange={(e) => setCustomSubActivity(e.target.value)}
                  className={inputBaseStyle}
                  placeholder="Ej: Ver 'La Casa de Papel'" required={subActivity === 'custom'}/>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Fecha</label>
                  <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputBaseStyle} />
                </div>
                 <div>
                  <label htmlFor="startTime" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Hora Inicio (Opcional)</label>
                  <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputBaseStyle} />
                </div>
            </div>
            <div>
              <label htmlFor="durationMinutes" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Duración (minutos)</label>
              <input type="number" id="durationMinutes" value={durationMinutes} 
                onChange={(e) => {
                    const newDuration = Math.max(0, parseInt(e.target.value,10) || 0);
                    setDurationMinutes(newDuration);
                    if (timerMode === 'countdown' && !isCountdownRunning) {
                        const newTotalSeconds = newDuration * 60;
                        setCountdownSeconds(newTotalSeconds);
                        setInitialCountdownDuration(newTotalSeconds);
                        setCountdownComplete(false); // Reset complete state if duration changes
                    }
                }} 
                min="0" step="1"
                disabled={ (timerMode === 'stopwatch' && (isStopwatchRunning || stopwatchSeconds > 0)) || (timerMode === 'countdown' && isCountdownRunning) }
                className={inputBaseStyle} />
            </div>
            <div>
              <label htmlFor="notes" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Notas (Opcional)</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className={inputBaseStyle}
                placeholder="Ej: Vi los primeros 2 episodios. Entendí el 70%." />
            </div>

          <div className="pt-3 flex flex-col sm:flex-row-reverse gap-3">
            <Button type="submit" variant="primary" 
              className="w-full sm:w-auto"
              disabled={ (timerMode === 'stopwatch' && isStopwatchRunning) || (timerMode === 'countdown' && isCountdownRunning && !countdownComplete) }
            >
              {isEditing ? "Guardar Cambios" : "Guardar Actividad"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="w-full sm:w-auto">Cancelar</Button>
          </div>
        </form>
        
        <div className="p-4 mt-4 border-t border-[var(--color-light-purple)]">
            <Button 
                variant="ghost" 
                onClick={() => setShowBulkAddInfo(!showBulkAddInfo)}
                className="text-sm text-[var(--color-accent)] hover:underline"
            >
                ¿Necesitas registrar muchas horas pasadas de golpe?
            </Button>
            {showBulkAddInfo && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    <p className="font-semibold">Registro Masivo de Actividad Pasada</p>
                    <p>Esta función te permitirá añadir bloques grandes de tiempo de inmersión o estudio que realizaste antes de usar la app o durante periodos sin acceso.</p>
                    <p className="mt-1">Puedes encontrarla en <span className="font-medium">Configuración &gt; Importar Actividad Agregada</span>.</p>
                 </div>
            )}
        </div>

      </div>
    </div>
  );
};