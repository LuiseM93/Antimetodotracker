import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon.tsx';
import { DailyGoalDonutChart } from './DailyGoalDonutChart.tsx';
import { TipCard } from './TipCard.tsx';
import { HabitHealthCard } from './HabitHealthCard.tsx'; 
import { CombinedStatusCard } from './CombinedStatusCard.tsx';
import { LearningDaysCard } from './LearningDaysCard.tsx'; // New card for learning days
import { STAGE_DETAILS, AVAILABLE_LANGUAGES_FOR_LEARNING, HABIT_POINTS_MAP } from '../../constants.ts';
import { ActivityLogEntry, AntimethodStage, Language, AppView, DailyActivityGoal, DashboardCardDisplayMode, UserProfile } from '../../types.ts';
import { Link, useNavigate } from 'react-router-dom'; 
import { formatDurationFromSeconds, formatTimeHHMMSS } from '../../utils/timeUtils.ts';
import { getLocalDateISOString } from '../../utils/dateUtils.ts';
import { PlayIcon as ReLogIcon } from '../../components/icons/TimerIcons.tsx'; 
import { PencilIcon } from '../../components/icons/PencilIcon.tsx';
// StreakCard is removed

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

const formatDisplayDate = (isoDateString: string): string => {
  if (!isoDateString) return '';
  const [year, month, day] = isoDateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); 
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const DashboardScreen: React.FC = () => {
  const { 
    userProfile, activityLogs, dailyTargets, getCurrentStageDetails, isLoading, 
    updateUserProfile, awardHabitPoints, getRewardById, getOverallHabitConsistency 
  } = useAppContext();
  const navigate = useNavigate(); 

  const [isEditingStage, setIsEditingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState<AntimethodStage | undefined>(userProfile?.currentStage);

  useEffect(() => {
    if (userProfile) {
        setSelectedStage(userProfile.currentStage);
    }
  }, [userProfile?.currentStage]);


  const currentStageDetailsObject = getCurrentStageDetails();
  const today = getLocalDateISOString();
  
  const todaysLogsForPrimaryLang = useMemo(() => {
    if (!userProfile?.primaryLanguage) return [];
    return activityLogs.filter(log => log.date === today && log.language === userProfile.primaryLanguage);
  }, [activityLogs, today, userProfile?.primaryLanguage]);

  const learningDaysForPrimaryLang = useMemo(() => {
    if (!userProfile?.primaryLanguage) return 0;
    const uniqueDays = new Set(
      activityLogs
        .filter(log => log.language === userProfile.primaryLanguage)
        .map(log => log.date)
    );
    return uniqueDays.size;
  }, [activityLogs, userProfile?.primaryLanguage]);

  const dailyTargetsForPrimaryLang = useMemo(() => {
    // For Dashboard display purposes, we might still want to show daily targets specific to a language,
    // but the overall consistency (getOverallHabitConsistency) will be based on all habits defined for primary lang.
    // For now, dailyTargets is global, not per-language specific in its structure.
    return dailyTargets; 
  }, [dailyTargets]);

  // For awarding points (today's health)
  const habitHealthPercentageForToday = useMemo(() => {
    if (!dailyTargetsForPrimaryLang || dailyTargetsForPrimaryLang.length === 0) return 0;

    let grandTotalMinTargetedSeconds = 0;
    let grandTotalEffectivelyAchievedSeconds = 0;

    dailyTargetsForPrimaryLang.forEach(habit => {
      const minTargetForThisHabit = habit.minSecondsTotal;
      if (minTargetForThisHabit > 0) {
        grandTotalMinTargetedSeconds += minTargetForThisHabit;

        const achievedForThisHabit = todaysLogsForPrimaryLang
          .filter(log => habit.components.some(c => c.category === log.category))
          .reduce((sum, log) => sum + log.duration_seconds, 0);
        
        // The effective achievement is capped at the minimum target for the 0-100% calculation
        grandTotalEffectivelyAchievedSeconds += Math.min(achievedForThisHabit, minTargetForThisHabit);
      }
    });

    if (grandTotalMinTargetedSeconds === 0) return 0; // Or 100 if no min targets implies success. 0 is safer.
    return (grandTotalEffectivelyAchievedSeconds / grandTotalMinTargetedSeconds) * 100;

  }, [dailyTargetsForPrimaryLang, todaysLogsForPrimaryLang]);
  
  // For display (overall consistency)
  const overallHabitConsistency = useMemo(() => {
    return getOverallHabitConsistency();
  }, [getOverallHabitConsistency]);


  // Award points for habits once per day if today's health is > 0
  useEffect(() => {
    if (userProfile && userProfile.lastHabitPointsAwardDate !== today && habitHealthPercentageForToday > 0) {
      awardHabitPoints(habitHealthPercentageForToday);
    }
  }, [habitHealthPercentageForToday, userProfile, today, awardHabitPoints]);
  
  const totalTimeTodayString = useMemo(() => {
    const totalSeconds = todaysLogsForPrimaryLang.reduce((sum, log) => sum + log.duration_seconds, 0);
    return formatTimeHHMMSS(totalSeconds);
  }, [todaysLogsForPrimaryLang]);


  const recentActivities = useMemo(() => {
    if (!userProfile?.primaryLanguage) return [];
    return activityLogs
      .filter(log => log.language === userProfile.primaryLanguage)
      .sort((a,b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        if (a.start_time && b.start_time) {
            const timeA = parseInt(a.start_time.split(':')[0]) * 60 + parseInt(a.start_time.split(':')[1]);
            const timeB = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]);
            if (timeA !== timeB) return timeB - timeA; 
        } else if (b.start_time) { 
            return 1;
        } else if (a.start_time) { 
            return -1;
        }
        return b.id.localeCompare(a.id); 
      })
      .slice(0, 5);
  }, [activityLogs, userProfile?.primaryLanguage]);

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

  const dashboardCardMode = userProfile.dashboardCardDisplayMode || 'learning_days_and_health';
  const activeFlair = userProfile.profileFlairId ? getRewardById(userProfile.profileFlairId) : null;


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex-grow">
          <div className="flex items-baseline space-x-2">
            <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)]`}>
              {userProfile.display_name ? `Dashboard de ${userProfile.display_name}` : 'Dashboard'}
            </h1>
            {activeFlair && (
              <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white shadow-sm">
                {activeFlair.value}
              </span>
            )}
          </div>
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
           <Link to={AppView.REWARDS} className="mt-2 flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded-md p-1 -ml-1">
            <img src="./assets/money.png" alt="Puntos de Enfoque" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className={`text-sm font-medium text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors`}>
                {userProfile.focusPoints} Puntos de Enfoque
            </span>
          </Link>
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
        <div className="md:col-span-1 space-y-6">
          {dashboardCardMode === 'learning_days_and_health' && (
            <>
              <LearningDaysCard learningDays={learningDaysForPrimaryLang} />
              <HabitHealthCard healthPercentage={overallHabitConsistency} />
            </>
          )}
          {dashboardCardMode === 'learning_days_only' && <LearningDaysCard learningDays={learningDaysForPrimaryLang} />}
          {dashboardCardMode === 'health_only' && <HabitHealthCard healthPercentage={overallHabitConsistency} />}
          {dashboardCardMode === 'combined' && <CombinedStatusCard learningDays={learningDaysForPrimaryLang} habitHealthPercentage={overallHabitConsistency} />}
          {/* If 'none', nothing is rendered here by these conditions */}
        </div>
        
        <div className={`md:col-span-2 ${dashboardCardMode === 'none' ? 'md:col-start-1' : ''}`}>
            <Card title="Progreso de Hábitos Hoy">
              {dailyTargets.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3">
                    <DailyGoalDonutChart dailyTargets={dailyTargetsForPrimaryLang} todaysLogs={todaysLogsForPrimaryLang} language={userProfile.primaryLanguage} />
                  </div>
                  <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/3 mt-4 md:mt-0 md:pl-4 text-center md:text-left">
                    <div className="mb-4">
                        <p className={`text-sm text-[var(--color-text-light)]`}>Salud de Hábitos (Hoy):</p>
                        <p className={`text-2xl font-bold text-[var(--color-primary)]`}>{Math.round(habitHealthPercentageForToday)}%</p>
                    </div>
                    <div>
                        <p className={`text-sm text-[var(--color-text-light)]`}>Tiempo Total Registrado Hoy:</p>
                        <p className={`text-2xl font-bold font-mono text-[var(--color-primary)]`}>{totalTimeTodayString}</p>
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
                  {log.custom_title ? (
                    <>
                      <span className={`font-semibold text-lg text-[var(--color-primary)]`}>{log.custom_title}</span>
                      <p className={`text-sm text-[var(--color-secondary)]`}>{log.sub_activity} ({log.category})</p>
                    </>
                  ) : (
                    <span className={`font-semibold text-lg text-[var(--color-primary)]`}>{log.sub_activity} ({log.category})</span>
                  )}
                  <p className={`text-sm text-[var(--color-text-light)] mt-1`}>
                    {formatDurationFromSeconds(log.duration_seconds, 'hhmmss')} - {formatDisplayDate(log.date)}
                  </p>
                  {log.notes && <p className={`text-xs text-gray-500 italic mt-1`}>"{log.notes}"</p>}
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
        ) : (
          <p className={`text-[var(--color-text-light)] text-center py-4`}>Aún no has registrado ninguna actividad para {userProfile.primaryLanguage}. ¡Empieza ahora!</p>
        )}
      </Card>
    </div>
  );
};