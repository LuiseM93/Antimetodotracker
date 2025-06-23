
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ActivityReportCharts } from './ActivityReportCharts';
import { HourMilestonesCard } from './HourMilestonesCard';
import { UserGoal, Language, ActivityLogEntry } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Card } from '../../components/Card';
import { useNavigate } from 'react-router-dom'; 
import { YearInReviewReport } from './YearInReviewReport'; // Import the new component
import { PresentationChartLineIcon } from '../../components/icons/PresentationChartLineIcon'; // For report button

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";
const progressBarBaseHeight = "h-2.5"; // Standard height for progress bars

type DateRangePreset = 'custom' | 'today' | 'yesterday' | 'last7' | 'last14' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'allTime';

const datePresets: { value: DateRangePreset; label: string }[] = [
  { value: 'custom', label: 'Personalizado' },
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'last7', label: 'Últimos 7 días' },
  { value: 'last14', label: 'Últimos 14 días' },
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'thisMonth', label: 'Este Mes' },
  { value: 'lastMonth', label: 'Mes Pasado' },
  { value: 'thisYear', label: 'Este Año' },
  { value: 'lastYear', label: 'Año Pasado' },
  { value: 'allTime', label: 'Todo el tiempo' },
];

const calculateDateRange = (preset: DateRangePreset): { start: string; end: string } => {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);

  switch (preset) {
    case 'today':
      break;
    case 'yesterday':
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case 'last7':
      start.setDate(today.getDate() - 6);
      break;
    case 'last14':
      start.setDate(today.getDate() - 13);
      break;
    case 'last30':
      start.setDate(today.getDate() - 29);
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'thisYear':
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
    case 'lastYear':
      start = new Date(today.getFullYear() - 1, 0, 1);
      end = new Date(today.getFullYear() - 1, 11, 31);
      break;
    case 'allTime':
      start = new Date(2000, 0, 1); // A very early date
      break;
    case 'custom': 
    default:
      return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
  }
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
};

const formatDisplayDateForLogList = (isoDateString: string): string => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
};

export const TrackerScreen: React.FC = () => {
  const { userProfile, activityLogs, userGoals, addUserGoal, updateUserGoal, toggleUserGoal, deleteUserGoal, getAvailableReportYears } = useAppContext();
  const navigate = useNavigate(); 
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'Total'>(userProfile?.primaryLanguage || 'Total');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DateRangePreset>('thisMonth');
  const [dateRange, setDateRange] = useState(calculateDateRange('thisMonth'));

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
  
  useEffect(() => {
    // This effect syncs the local selectedLanguage with the AppContext's primaryLanguage
    if (userProfile?.primaryLanguage) {
      // If the context's primary language is valid and different from the local one, update local.
      // Or if local is 'Total', always try to set it to the specific primary language.
      if (selectedLanguage !== userProfile.primaryLanguage) {
        if (userProfile.learningLanguages.includes(userProfile.primaryLanguage)) {
          setSelectedLanguage(userProfile.primaryLanguage);
        } else if (userProfile.learningLanguages.length > 0) {
          // Fallback: if userProfile.primaryLanguage is somehow not in learningLanguages,
          // but there are learningLanguages, pick the first one. This case should be rare.
          setSelectedLanguage(userProfile.learningLanguages[0]);
        } else {
          // Fallback: no learning languages, set to 'Total'.
          setSelectedLanguage('Total');
        }
      }
    } else if (userProfile && !userProfile.primaryLanguage && selectedLanguage !== 'Total') {
      // Profile exists but has no primary language set (e.g. after data issue/reset), default tracker to 'Total'.
      setSelectedLanguage('Total');
    }
    // This effect should run when the app-wide primary language or the list of learning languages changes.
  }, [userProfile?.primaryLanguage, userProfile?.learningLanguages]);


  useEffect(() => {
    if (selectedDatePreset !== 'custom') {
      setDateRange(calculateDateRange(selectedDatePreset));
    }
  }, [selectedDatePreset]);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedDatePreset(preset);
    if (preset !== 'custom') {
      setDateRange(calculateDateRange(preset));
    } else {
       const currentCustomRange = calculateDateRange('thisMonth'); 
       setDateRange(currentCustomRange);
    }
  };
  
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
      const langValue = value as string; // value from select
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
    const start = new Date(dateRange.start + 'T00:00:00');
    const end = new Date(dateRange.end + 'T23:59:59');
    return activityLogs
      .filter(log => {
        const logDate = new Date(log.date + 'T00:00:00');
        const langMatch = selectedLanguage === 'Total' || log.language === selectedLanguage;
        return langMatch && logDate >= start && logDate <= end;
      })
      .sort((a,b) => { // Sort for detailed history display
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        // Optional: sort by start time if available, then by ID as fallback
        if(a.startTime && b.startTime) return b.startTime.localeCompare(a.startTime);
        return b.id.localeCompare(a.id); 
      });
  }, [activityLogs, selectedLanguage, dateRange]);

  const totalHoursForPeriod = useMemo(() => {
    const totalMinutes = filteredLogsForPeriod.reduce((sum, log) => sum + log.durationMinutes, 0);
    return (totalMinutes / 60).toFixed(1);
  }, [filteredLogsForPeriod]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)] mb-1`}>
            Tracker Avanzado 
            <span className="text-xl font-medium text-[var(--color-secondary)]"> ({totalHoursForPeriod} horas en período)</span>
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
          <div>
            <label htmlFor="datePresetFilter" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Rango de Fechas:</label>
            <select
              id="datePresetFilter"
              value={selectedDatePreset}
              onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
              className={inputBaseStyle}
            >
              {datePresets.map(preset => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
            </select>
          </div>
          {selectedDatePreset === 'custom' && (
            <>
              <div>
                <label htmlFor="startDate" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Desde:</label>
                <input type="date" id="startDate" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} 
                  className={inputBaseStyle} />
              </div>
              <div>
                <label htmlFor="endDate" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Hasta:</label>
                <input type="date" id="endDate" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} 
                  className={inputBaseStyle} />
              </div>
            </>
          )}
        </div>
      </Card>
      
      <HourMilestonesCard 
        activityLogs={activityLogs} 
        selectedLanguage={selectedLanguage} 
      />

      <ActivityReportCharts logs={activityLogs} selectedLanguage={selectedLanguage} dateRange={dateRange} />
      
      <Card title="Historial Detallado de Actividad (Período Seleccionado)">
        {filteredLogsForPeriod.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto pr-2"> {/* Scrollable container */}
            <ul className="space-y-3">
              {filteredLogsForPeriod.map(log => (
                <li key={log.id} className={`p-3 bg-[var(--color-card-bg)] rounded-md shadow-sm border border-[var(--color-border-light)] flex justify-between items-center hover:shadow-md transition-shadow`}>
                  <div>
                    <span className={`font-semibold text-[var(--color-primary)]`}>{log.subActivity}</span> ({log.category})
                    <p className={`text-sm text-[var(--color-text-light)]`}>
                      {log.durationMinutes} min - {formatDisplayDateForLogList(log.date)}
                      {log.startTime && ` (Inicio: ${log.startTime})`}
                      {selectedLanguage === 'Total' && ` [${log.language}]`}
                    </p>
                    {log.notes && <p className={`text-xs italic mt-1 text-gray-500`}>"{log.notes}"</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/log/${log.id}`)}>Editar</Button>
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
                <li key={goal.id} className={`p-3 rounded-md ${goal.achieved ? `bg-green-100 border-green-300` : `bg-[var(--color-light-purple)] bg-opacity-20 border-[var(--color-light-purple)]`} border`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center flex-grow">
                      <input
                        type="checkbox"
                        checked={goal.achieved}
                        onChange={() => toggleUserGoal(goal.id)}
                        className={`h-5 w-5 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-input-border)] mr-3 flex-shrink-0`}
                      />
                      <span className={`${goal.achieved ? 'line-through text-gray-500' : `text-[var(--color-text-main)]`}`}>
                        {goal.description} {goal.language && `(${goal.language})`}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteUserGoal(goal.id)} className={`text-[var(--color-error)] hover:bg-red-100 ml-2 flex-shrink-0`}>Eliminar</Button>
                  </div>

                  {isQuantifiable && !goal.achieved && (
                    <div className="mt-1.5 pl-8"> {/* Indent progress bar */}
                      <div className="flex justify-between text-xs text-[var(--color-text-light)] mb-0.5">
                        <span>Progreso:</span>
                        <span>{goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
                      </div>
                      <div className={`w-full bg-gray-300 rounded-full ${progressBarBaseHeight} overflow-hidden`}>
                        <div 
                          className={`bg-[var(--color-accent)] ${progressBarBaseHeight} rounded-full transition-all duration-300 ease-out`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="text-right mt-1">
                     <Button variant="ghost" size="sm" onClick={() => openEditGoalModal(goal)} className={`text-blue-600 hover:bg-blue-100`}>Editar</Button>
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
            <Button variant="primary" onClick={handleSaveGoal}>Guardar Meta</Button>
          </div>
        </div>
      </Modal>

      {isYearInReviewModalOpen && availableReportYears.length > 0 && (
        <YearInReviewReport
            isOpen={isYearInReviewModalOpen}
            onClose={() => setIsYearInReviewModalOpen(false)}
            initialYear={availableReportYears[0]} // Pass the most recent year with data
        />
      )}
       {isYearInReviewModalOpen && availableReportYears.length === 0 && ( // Handle case where modal might be triggered but no data
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
