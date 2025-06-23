
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon';
import { DailyGoalDonutChart } from './DailyGoalDonutChart';
import { TipCard } from './TipCard';
import { HabitHealthCard } from './HabitHealthCard'; 
import { STAGE_DETAILS, AVAILABLE_LANGUAGES_FOR_LEARNING } from '../../constants';
import { ActivityLogEntry, AntimethodStage, Language, AppView, DailyActivityGoal } from '../../types';
import { Link, useNavigate } from 'react-router-dom'; 

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

const formatDisplayDate = (isoDateString: string): string => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const DashboardScreen: React.FC = () => {
  const { userProfile, activityLogs, dailyTargets, getCurrentStageDetails, isLoading, updateUserProfile } = useAppContext();
  const navigate = useNavigate(); 

  const [isEditingStage, setIsEditingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState<AntimethodStage | undefined>(userProfile?.currentStage);

  useEffect(() => {
    if (userProfile) {
        setSelectedStage(userProfile.currentStage);
    }
  }, [userProfile?.currentStage]);


  const currentStageDetailsObject = getCurrentStageDetails();
  const today = new Date().toISOString().split('T')[0];
  
  const todaysLogsForPrimaryLang = useMemo(() => {
    if (!userProfile?.primaryLanguage) return [];
    return activityLogs.filter(log => log.date === today && log.language === userProfile.primaryLanguage);
  }, [activityLogs, today, userProfile?.primaryLanguage]);

  const dailyTargetsForPrimaryLang = useMemo(() => {
    // Assuming dailyTargets are global and not language-specific in their current structure.
    return dailyTargets;
  }, [dailyTargets]);


  const habitHealthPercentage = useMemo(() => {
    if (!dailyTargetsForPrimaryLang || dailyTargetsForPrimaryLang.length === 0) return 0;

    let grandTotalTargetedMinutes = 0;
    let grandTotalEffectivelyAchievedMinutes = 0;

    dailyTargetsForPrimaryLang.forEach(habit => {
      const targetForThisHabit = habit.optimalMinutesTotal > 0 ? habit.optimalMinutesTotal : habit.minMinutesTotal;
      grandTotalTargetedMinutes += targetForThisHabit;

      const achievedForThisHabit = todaysLogsForPrimaryLang
        .filter(log => habit.components.some(c => c.category === log.category))
        .reduce((sum, log) => sum + log.durationMinutes, 0);
      
      grandTotalEffectivelyAchievedMinutes += Math.min(achievedForThisHabit, targetForThisHabit);
    });

    if (grandTotalTargetedMinutes === 0) return 0;
    return (grandTotalEffectivelyAchievedMinutes / grandTotalTargetedMinutes) * 100;

  }, [dailyTargetsForPrimaryLang, todaysLogsForPrimaryLang]);
  
  const totalHoursTodayString = useMemo(() => {
    const totalMinutes = todaysLogsForPrimaryLang.reduce((sum, log) => sum + log.durationMinutes, 0);
    return (totalMinutes / 60).toFixed(1) + " horas";
  }, [todaysLogsForPrimaryLang]);


  const recentActivities = useMemo(() => {
    if (!userProfile?.primaryLanguage) return [];
    return activityLogs
      .filter(log => log.language === userProfile.primaryLanguage)
      .sort((a,b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        if (a.startTime && b.startTime) {
            return b.startTime.localeCompare(a.startTime);
        }
        if (b.startTime) return 1;
        if (a.startTime) return -1;
        return b.id.localeCompare(a.id); 
      })
      .slice(0, 5);
  }, [activityLogs, userProfile?.primaryLanguage]);

  const handleEditLog = (log: ActivityLogEntry) => {
    navigate(`/log/${log.id}`); 
  };
  
  const openNewLogScreen = () => {
    navigate('/log'); 
  };

  const handleSaveStage = () => {
    if (userProfile && selectedStage !== undefined) {
      updateUserProfile({ currentStage: selectedStage });
      setIsEditingStage(false);
    }
  };

  const handlePrimaryLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (userProfile) {
        const newPrimaryLanguage = e.target.value as Language;
        updateUserProfile({ primaryLanguage: newPrimaryLanguage });
    }
  };
  
  const validStagesForSelection = Object.values(AntimethodStage).filter(
    val => typeof val === 'number'
  ) as AntimethodStage[];


  if (isLoading && !userProfile) {
    return <div className="p-6 text-center text-[var(--color-text-main)]">Cargando datos del usuario...</div>;
  }
  
  if (!userProfile) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--color-text-main)]">No se encontró el perfil de usuario. Por favor, completa el <Link to={AppView.ONBOARDING} className={`text-[var(--color-accent)] hover:underline`}>proceso de bienvenida</Link>.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex-grow">
          <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)]`}>
            Dashboard
          </h1>
          {userProfile.learningLanguages && userProfile.learningLanguages.length > 1 && (
            <div className="mt-2 sm:max-w-xs">
              <label htmlFor="primaryLanguageDashboardSelect" className={`block text-xs font-medium text-[var(--color-text-light)] mb-0.5`}>
                Idioma Activo:
              </label>
              <select
                id="primaryLanguageDashboardSelect"
                value={userProfile.primaryLanguage}
                onChange={handlePrimaryLanguageChange}
                className={`${inputBaseStyle} text-sm p-2 h-10`}
              >
                {userProfile.learningLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
           {currentStageDetailsObject && !isEditingStage && (
            <div className="flex items-center mt-2">
              <p className={`text-[var(--color-text-light)] mr-2 text-sm`}>
                Etapa Actual: <strong className={`text-[var(--color-secondary)]`}>{currentStageDetailsObject.name}</strong>
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedStage(userProfile.currentStage); setIsEditingStage(true); }} className={`text-[var(--color-accent)] hover:text-[var(--color-primary)] text-xs`}>
                Cambiar
              </Button>
            </div>
          )}
        </div>
        <Button onClick={openNewLogScreen} variant="primary" size="lg" leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="mt-2 sm:mt-0 self-start sm:self-center flex-shrink-0">
          Registrar Actividad
        </Button>
      </header>
        
      {isEditingStage && (
        <Card title="Cambiar Etapa Actual" className={`my-4 bg-[var(--color-light-purple)] bg-opacity-30`}>
            <div className={` p-3 border border-[var(--color-border-light)] rounded-md bg-[var(--color-card-bg)] shadow-sm w-full sm:max-w-md`}>
                <label htmlFor="stageSelect" className={`block text-sm font-medium text-[var(--color-text-main)] mb-1`}>Seleccionar nueva etapa:</label>
                <select 
                    id="stageSelect"
                    value={selectedStage} 
                    onChange={(e) => setSelectedStage(Number(e.target.value) as AntimethodStage)}
                    className={`${inputBaseStyle} mb-2`}
                >
                    {validStagesForSelection.map(stageVal => (
                    <option key={stageVal} value={stageVal}>
                        {STAGE_DETAILS[stageVal as AntimethodStage]?.name || `Etapa ${stageVal}`}
                    </option>
                    ))}
                </select>
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingStage(false)}>Cancelar</Button>
                    <Button variant="primary" size="sm" onClick={handleSaveStage}>Guardar Etapa</Button>
                </div>
            </div>
        </Card>
      )}


      {currentStageDetailsObject && (
        <Card 
          title="Tu Enfoque Actual" 
          className={`bg-[var(--color-light-purple)] bg-opacity-30 border border-[var(--color-secondary)]`}
        >
          <p className={`text-lg font-semibold text-[var(--color-secondary)] mb-1`}>{currentStageDetailsObject.objective}</p>
          <p className={`text-sm text-[var(--color-text-main)]`}>{currentStageDetailsObject.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <HabitHealthCard healthPercentage={habitHealthPercentage} />
        </div>
        <div className="md:col-span-2">
            <Card title="Progreso de Hábitos Hoy">
              {dailyTargets.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3">
                    <DailyGoalDonutChart dailyTargets={dailyTargetsForPrimaryLang} todaysLogs={todaysLogsForPrimaryLang} language={userProfile.primaryLanguage} />
                  </div>
                  <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/3 mt-4 md:mt-0 md:pl-4 text-center md:text-left">
                    <div className="mb-4">
                        <p className={`text-sm text-[var(--color-text-light)]`}>Salud General de Hábitos:</p>
                        <p className={`text-2xl font-bold text-[var(--color-primary)]`}>{Math.round(habitHealthPercentage)}%</p>
                    </div>
                    <div>
                        <p className={`text-sm text-[var(--color-text-light)]`}>Tiempo Total Registrado Hoy:</p>
                        <p className={`text-2xl font-bold text-[var(--color-primary)]`}>{totalHoursTodayString}</p>
                        {userProfile.primaryLanguage && <p className="text-xs text-[var(--color-text-light)]">en {userProfile.primaryLanguage}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-[var(--color-text-light)] text-center py-4`}>
                    No has definido hábitos diarios. Ve a la sección de{' '}
                    <Link to={AppView.ROUTINES} className={`text-[var(--color-accent)] hover:underline`}>Rutinas</Link> para configurarlos.
                </p>
              )}
            </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
          <TipCard />
      </div>
      
      <Card title="Actividad Reciente">
        {recentActivities.length > 0 ? (
          <ul className="space-y-3">
            {recentActivities.map(log => (
              <li key={log.id} className={`p-3 bg-[var(--color-card-bg)] rounded-md shadow-sm border border-[var(--color-border-light)] flex justify-between items-center hover:shadow-md transition-shadow`}>
                <div>
                  <span className={`font-semibold text-[var(--color-primary)]`}>{log.subActivity}</span> ({log.category})
                  <p className={`text-sm text-[var(--color-text-light)]`}>
                    {log.durationMinutes} min - {formatDisplayDate(log.date)}
                    {log.startTime && ` (Inicio: ${log.startTime})`}
                  </p>
                  {log.notes && <p className={`text-xs text-gray-500 italic mt-1`}>"{log.notes}"</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditLog(log)}>Editar</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-[var(--color-text-light)] text-center py-4`}>Aún no has registrado ninguna actividad para {userProfile.primaryLanguage}. ¡Empieza ahora!</p>
        )}
      </Card>
    </div>
  );
};
