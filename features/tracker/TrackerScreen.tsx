

import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { ActivityReportCharts } from './ActivityReportCharts';
import { HourMilestonesCard } from './HourMilestonesCard';
import { AnnualHeatmap } from './AnnualHeatmap';
import { UserGoal, Language, ActivityLogEntry } from '../../types.ts';
import { Button } from '../../components/Button.tsx';
import { Modal } from '../../components/Modal.tsx';
import { Card } from '../../components/Card.tsx';
import { useNavigate } from 'react-router-dom'; 
import { YearInReviewReport } from './YearInReviewReport';
import { PresentationChartLineIcon } from '../../components/icons/PresentationChartLineIcon';
import { formatDurationFromSeconds, formatTimeHHMMSS } from '../../utils/timeUtils.ts';
import { PlayIcon as ReLogIcon } from '../../components/icons/TimerIcons.tsx'; 
import { PencilIcon } from '../../components/icons/PencilIcon.tsx';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";
const progressBarBaseHeight = "h-2.5"; 

const formatDisplayDateForLogList = (isoDateString: string): string => {
    if (!isoDateString) return '';
    // Ensure date is parsed as local
    const [year, month, day] = isoDateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
};

export const TrackerScreen: React.FC = () => {
  const { userProfile, activityLogs, userGoals, addUserGoal, updateUserGoal, toggleUserGoal, deleteUserGoal, getAvailableReportYears } = useAppContext();
  const navigate = useNavigate(); 
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'Total'>(userProfile?.primaryLanguage || 'Total');
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [goalForm, setGoalForm] = useState<Partial<UserGoal>>({
    description: '',
    language: userProfile?.primaryLanguage || undefined,
    targetValue: 0,
    currentValue: 0,
    unit: '',
    achieved: false,
  });

  const [isYearInReviewModalOpen, setIsYearInReviewModalOpen] = useState(false);
  const availableReportYears = useMemo(() => getAvailableReportYears(), [activityLogs, getAvailableReportYears]);
  
  // This useEffect was removed as it prevented users from selecting a language other than their primary one.
  // The initial state is set via useState, and manual selection is now fully enabled.

  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalForm({
      description: '',
      language: userProfile?.primaryLanguage || undefined,
      targetValue: 0,
      currentValue: 0,
      unit: '',
      achieved: false,
    });
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: UserGoal) => {
    setEditingGoal(goal);
    setGoalForm({ ...goal });
    setIsGoalModalOpen(true);
  };

  const handleGoalFormChange = (field: keyof UserGoal, value: string | number | boolean) => {
    if (field === 'language') {
      const langValue = value as string; 
      setGoalForm(prev => ({...prev, language: langValue === "" ? undefined : langValue as Language }));
    } else {
      setGoalForm(prev => ({...prev, [field]: value}));
    }
  };

  const handleSaveGoal = () => {
    if (!goalForm.description?.trim()) {
      alert("La descripción de la meta es obligatoria.");
      return;
    }
    const goalDataToSave = {
        description: goalForm.description,
        language: goalForm.language,
        targetValue: Number(goalForm.targetValue) || 0,
        currentValue: Number(goalForm.currentValue) || 0,
        unit: goalForm.unit?.trim() || '',
        achieved: goalForm.achieved || false,
    };

    if (editingGoal) {
      updateUserGoal({ ...editingGoal, ...goalDataToSave });
    } else {
      addUserGoal(goalDataToSave);
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };


  const availableLangsForFilter: (Language | 'Total')[] = ['Total', ...(userProfile?.learningLanguages || [])];
  
  const filteredLogsForPeriod = useMemo(() => {
    return activityLogs
      .filter(log => {
        const langMatch = selectedLanguage === 'Total' || log.language === selectedLanguage;
        return langMatch;
      })
      .sort((a,b) => { 
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        if(a.start_time && b.start_time) {
            const timeA = parseInt(a.start_time.split(':')[0]) * 60 + parseInt(a.start_time.split(':')[1]);
            const timeB = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]);
            if (timeA !== timeB) return timeB - timeA;
        } else if (b.start_time) {
            return 1;
        } else if (a.start_time) {
            return -1;
        }
        return b.id.localeCompare(a.id); 
      });
  }, [activityLogs, selectedLanguage]);

  const totalTimeForPeriodString = useMemo(() => {
    const totalSeconds = filteredLogsForPeriod.reduce((sum, log) => sum + log.duration_seconds, 0);
    return formatTimeHHMMSS(totalSeconds);
  }, [filteredLogsForPeriod]);

  const handleReLog = (log: ActivityLogEntry) => {
    navigate('/log', { state: { reLogData: {
        sub_activity: log.sub_activity,
        category: log.category,
        custom_title: log.custom_title,
        language: log.language,
        duration_seconds: log.duration_seconds,
        notes: log.notes,
    } } });
  };

  const handleEditLog = (logId: string) => {
    navigate(`/log/${logId}`);
  };


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)] mb-1`}>
            Tracker Avanzado 
            <span className="text-xl font-medium text-[var(--color-secondary)]"> ({totalTimeForPeriodString})</span>
        </h1>
        <Button
            onClick={() => setIsYearInReviewModalOpen(true)}
            variant="accent"
            leftIcon={<PresentationChartLineIcon className="w-5 h-5" />}
            disabled={availableReportYears.length === 0}
            title={availableReportYears.length === 0 ? "Aún no hay datos para reportes anuales" : "Ver reporte anual"}
            className="mt-2 sm:mt-0"
        >
            Reporte Anual
        </Button>
      </div>


      <Card title="Filtros de Reporte">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="languageFilter" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Idioma:</label>
            <select
              id="languageFilter"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language | 'Total')}
              className={inputBaseStyle}
            >
              {availableLangsForFilter.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </div>
      </Card>
      
      <HourMilestonesCard 
        activityLogs={activityLogs} 
        selectedLanguage={selectedLanguage} 
      />

      <AnnualHeatmap logs={activityLogs} selectedLanguage={selectedLanguage} />

      <ActivityReportCharts logs={activityLogs} selectedLanguage={selectedLanguage} />
      
      <Card title="Historial Detallado de Actividad (Completo)">
        {filteredLogsForPeriod.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto pr-2"> 
            <ul className="space-y-3">
              {filteredLogsForPeriod.map(log => (
                <li key={log.id} className={`p-3 bg-[var(--color-card-bg)] rounded-md shadow-sm border border-[var(--color-border-light)] flex justify-between items-center hover:shadow-md transition-shadow`}>
                  <div>
                    {log.custom_title ? (
                      <>
                        <span className={`font-semibold text-lg text-[var(--color-primary)]`}>{log.custom_title}</span>
                        <p className={`text-sm text-[var(--color-secondary)]`}>{log.sub_activity} ({log.category})</p>
                      </>
                    ) : (
                      <span className={`font-semibold text-lg text-[var(--color-primary)]`}>{log.sub_activity} ({log.category})</span>
                    )}
                    <p className={`text-sm text-[var(--color-text-light)] mt-1`}>
                      {formatDurationFromSeconds(log.duration_seconds, 'hhmmss')} - {formatDisplayDateForLogList(log.date)}
                      {selectedLanguage === 'Total' && ` [${log.language}]`}
                    </p>
                    {log.notes && <p className={`text-xs italic mt-1 text-gray-500`}>"{log.notes}"</p>}
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditLog(log.id)}
                        aria-label={`Editar ${log.custom_title || log.sub_activity}`}
                        className="p-2"
                    >
                        <PencilIcon className="w-5 h-5 text-blue-600 hover:text-blue-500" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReLog(log)}
                        aria-label={`Re-log ${log.custom_title || log.sub_activity}`}
                        className="p-2"
                    >
                        <ReLogIcon className="w-5 h-5 text-[var(--color-accent)] hover:text-[var(--color-primary)]" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={`text-[var(--color-text-light)] text-center py-4`}>No hay actividades registradas para los filtros seleccionados.</p>
        )}
      </Card>


      <Card title="Logros y Metas Personales">
        <Button onClick={openAddGoalModal} variant="secondary" className="mb-4">
          Añadir Nueva Meta
        </Button>
        {userGoals.length > 0 ? (
          <ul className="space-y-3">
            {userGoals.filter(g => selectedLanguage === 'Total' || !g.language || g.language === selectedLanguage).map(goal => {
              const isQuantifiable = goal.targetValue && goal.targetValue > 0;
              const progressPercent = isQuantifiable ? Math.min(100, ((goal.currentValue || 0) / goal.targetValue!) * 100) : 0;
              
              return (
                <li key={goal.id} className={`p-3 rounded-md ${goal.achieved ? `bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700` : `bg-[var(--color-light-purple)] bg-opacity-20 border-[var(--color-light-purple)]` } border`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center flex-grow">
                      <input
                        id={`goal-achieved-${goal.id}`}
                        type="checkbox"
                        checked={goal.achieved}
                        onChange={() => toggleUserGoal(goal.id)}
                        className={`h-5 w-5 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-input-border)] mr-3 flex-shrink-0`}
                      />
                      <span className={`${goal.achieved ? 'line-through text-gray-500 dark:text-gray-400' : `text-[var(--color-text-main)]`}`}>
                        {goal.description} {goal.language && `(${goal.language})`}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteUserGoal(goal.id)} className={`text-[var(--color-error)] hover:bg-red-100 dark:hover:bg-red-900/30 ml-2 flex-shrink-0`}>Eliminar</Button>
                  </div>

                  {isQuantifiable && !goal.achieved && (
                    <div className="mt-1.5 pl-8"> 
                      <div className="flex justify-between text-xs text-[var(--color-text-light)] mb-0.5">
                        <span>Progreso:</span>
                        <span>{goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
                      </div>
                      <div className={`w-full bg-gray-300 dark:bg-gray-600 rounded-full ${progressBarBaseHeight} overflow-hidden`}>
                        <div 
                          className={`bg-[var(--color-accent)] ${progressBarBaseHeight} rounded-full transition-all duration-300 ease-out`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="text-right mt-1">
                     <Button variant="ghost" size="sm" onClick={() => openEditGoalModal(goal)} className={`text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30`}>Editar</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={`text-[var(--color-text-light)]`}>Aún no has añadido ninguna meta personal. ¡Define tus próximos hitos!</p>
        )}
      </Card>

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title={editingGoal ? "Editar Meta" : "Añadir Nueva Meta"}>
        <div className="space-y-4">
          <div>
            <label htmlFor="goalDescription" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Descripción:</label>
            <input
              type="text" id="goalDescription" value={goalForm.description || ''}
              onChange={(e) => handleGoalFormChange('description', e.target.value)}
              className={inputBaseStyle} placeholder="Ej: Ver mi primera película sin subtítulos"
            />
          </div>
          <div>
            <label htmlFor="goalLanguage" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Idioma (Opcional):</label>
            <select
              id="goalLanguage" value={goalForm.language || ''}
              onChange={(e) => handleGoalFormChange('language', e.target.value)}
              className={inputBaseStyle}
            >
              <option value="">Cualquier Idioma</option>
              {userProfile?.learningLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <fieldset className="border border-[var(--color-input-border)] p-3 rounded-md">
            <legend className="text-sm font-medium text-[var(--color-text-main)] px-1">Meta Cuantificable (Opcional)</legend>
            <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                    <label htmlFor="goalCurrentValue" className={`block text-xs font-medium text-[var(--color-text-main)]`}>Progreso Actual:</label>
                    <input type="number" id="goalCurrentValue" value={goalForm.currentValue || 0} min="0"
                    onChange={(e) => handleGoalFormChange('currentValue', Number(e.target.value))} className={inputBaseStyle} />
                </div>
                <div>
                    <label htmlFor="goalTargetValue" className={`block text-xs font-medium text-[var(--color-text-main)]`}>Valor Objetivo:</label>
                    <input type="number" id="goalTargetValue" value={goalForm.targetValue || 0} min="0"
                    onChange={(e) => handleGoalFormChange('targetValue', Number(e.target.value))} className={inputBaseStyle} />
                </div>
            </div>
            <div className="mt-2">
                <label htmlFor="goalUnit" className={`block text-xs font-medium text-[var(--color-text-main)]`}>Unidad:</label>
                <input type="text" id="goalUnit" value={goalForm.unit || ''}
                onChange={(e) => handleGoalFormChange('unit', e.target.value)}
                className={inputBaseStyle} placeholder="Ej: horas, libros, episodios"/>
            </div>
          </fieldset>
          {editingGoal && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="goalAchieved"
                checked={goalForm.achieved || false}
                onChange={(e) => handleGoalFormChange('achieved', e.target.checked)}
                className="h-4 w-4 text-[var(--color-accent)] border-[var(--color-input-border)] rounded focus:ring-[var(--color-accent)] mr-2"
              />
              <label htmlFor="goalAchieved" className={`text-sm font-medium text-[var(--color-text-main)]`}>Meta Cumplida</label>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveGoal}>{editingGoal ? "Guardar Cambios" : "Guardar Meta"}</Button>
          </div>
        </div>
      </Modal>

      {isYearInReviewModalOpen && availableReportYears.length > 0 && (
        <YearInReviewReport
            isOpen={isYearInReviewModalOpen}
            onClose={() => setIsYearInReviewModalOpen(false)}
            initialYear={availableReportYears[0]}
        />
      )}
       {isYearInReviewModalOpen && availableReportYears.length === 0 && (
        <Modal isOpen={isYearInReviewModalOpen} onClose={() => setIsYearInReviewModalOpen(false)} title="Reporte Anual">
            <p className="text-center text-[var(--color-text-light)] py-4">
                Aún no hay datos suficientes para generar un reporte anual.
            </p>
            <div className="flex justify-end pt-4">
                <Button onClick={() => setIsYearInReviewModalOpen(false)}>Cerrar</Button>
            </div>
        </Modal>
      )}

    </div>
  );
};