

import React, { useMemo } from 'react';
import { Card } from '../../components/Card.tsx';
import { ActivityLogEntry, Language } from '../../types.ts';
import { HOUR_MILESTONES } from '../../constants.ts';
import { InformationCircleIcon } from '../../components/icons/InformationCircleIcon.tsx';

interface HourMilestonesCardProps {
  activityLogs: ActivityLogEntry[];
  selectedLanguage: Language | 'Total';
}

export const HourMilestonesCard: React.FC<HourMilestonesCardProps> = ({ activityLogs, selectedLanguage }) => {
  const relevantLogs = useMemo(() => {
    return selectedLanguage === 'Total'
      ? activityLogs
      : activityLogs.filter(log => log.language === selectedLanguage);
  }, [activityLogs, selectedLanguage]);

  const allTimeTotalHours = useMemo(() => {
    const totalSeconds = relevantLogs.reduce((sum, log) => sum + log.duration_seconds, 0);
    return parseFloat((totalSeconds / 3600).toFixed(1));
  }, [relevantLogs]);

  const {
    currentMilestoneValue,
    nextMilestoneValue,
    progressToNextMilestonePercentage,
    remainingHoursToNext,
  } = useMemo(() => {
    let lastAchieved = 0;
    let next = HOUR_MILESTONES[0];

    for (const milestone of HOUR_MILESTONES) {
      if (allTimeTotalHours >= milestone) {
        lastAchieved = milestone;
      } else {
        next = milestone;
        break;
      }
      if (milestone === HOUR_MILESTONES[HOUR_MILESTONES.length - 1] && allTimeTotalHours >= milestone) {
        next = milestone; 
      }
    }
    
    if (allTimeTotalHours >= HOUR_MILESTONES[HOUR_MILESTONES.length - 1]) {
        lastAchieved = HOUR_MILESTONES[HOUR_MILESTONES.length -1];
        next = HOUR_MILESTONES[HOUR_MILESTONES.length -1];
    }

    const rangeTotal = next - lastAchieved;
    const achievedInRange = allTimeTotalHours - lastAchieved;
    
    let progress = 0;
    if (rangeTotal > 0) {
      progress = Math.min(100, Math.max(0, (achievedInRange / rangeTotal) * 100));
    } else if (allTimeTotalHours >= next) {
      progress = 100;
    }
    
    const remaining = Math.max(0, next - allTimeTotalHours);

    return {
      currentMilestoneValue: lastAchieved,
      nextMilestoneValue: next,
      progressToNextMilestonePercentage: parseFloat(progress.toFixed(1)),
      remainingHoursToNext: parseFloat(remaining.toFixed(1)),
    };
  }, [allTimeTotalHours]);

  const { averageHoursPerDay, daysToNextMilestone } = useMemo(() => {
    if (relevantLogs.length === 0) return { averageHoursPerDay: 0, daysToNextMilestone: Infinity };

    const sortedLogs = [...relevantLogs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstLogDate = new Date(sortedLogs[0].date + "T00:00:00Z");
    const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1].date + "T00:00:00Z");
    const daySpan = Math.max(1, (lastLogDate.getTime() - firstLogDate.getTime()) / (1000 * 3600 * 24) + 1);
    
    const avgHours = allTimeTotalHours / daySpan;
    const daysToNext = (avgHours > 0 && remainingHoursToNext > 0 && nextMilestoneValue > allTimeTotalHours) ? Math.ceil(remainingHoursToNext / avgHours) : Infinity;

    return {
      averageHoursPerDay: parseFloat(avgHours.toFixed(2)),
      daysToNextMilestone: daysToNext,
    };
  }, [relevantLogs, allTimeTotalHours, remainingHoursToNext, nextMilestoneValue]);
  
  const cardClasses = `bg-[var(--color-card-bg)] text-[var(--color-text-main)] border-[var(--color-border-light)]`;
  const titleClasses = `text-[var(--color-text-main)]`;

  return (
    <Card title="Meta de horas" className={cardClasses} titleClassName={titleClasses}>
      <div className="p-3 sm:p-4 space-y-3">
        <div className="text-center">
            <p className={`text-sm text-[var(--color-text-light)]`}>Total Acumulado ({selectedLanguage}):</p>
            <p className={`text-3xl font-bold text-[var(--color-primary)]`}>{allTimeTotalHours.toLocaleString()}h</p>
        </div>

        <div>
            <div className="flex justify-between items-baseline mb-1">
                <p className={`text-md font-semibold text-[var(--color-secondary)]`}>
                    Próxima meta: {nextMilestoneValue.toLocaleString()}h
                </p>
                {allTimeTotalHours < nextMilestoneValue && (
                     <p className={`text-sm text-[var(--color-text-light)]`}>
                        Faltan: <span className="font-medium text-[var(--color-text-main)]">{remainingHoursToNext.toLocaleString()}h</span>
                     </p>
                )}
            </div>
          
            <div className="w-full bg-[var(--color-chart-grid-line)] rounded-full h-3.5 sm:h-4 overflow-hidden">
                <div 
                    className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center" 
                    style={{ width: `${progressToNextMilestonePercentage}%` }}
                >
                   {progressToNextMilestonePercentage > 15 && ( /* Show percentage if bar is wide enough */
                     <span className="text-xs font-medium text-white">
                        {progressToNextMilestonePercentage}%
                     </span>
                   )}
                </div>
            </div>
             <div className="flex justify-between text-xs text-[var(--color-text-light)] mt-1 px-1">
                <span>{currentMilestoneValue.toLocaleString()}h</span>
                <span>{nextMilestoneValue.toLocaleString()}h</span>
            </div>
        </div>
        
        {allTimeTotalHours >= HOUR_MILESTONES[HOUR_MILESTONES.length -1] && nextMilestoneValue === HOUR_MILESTONES[HOUR_MILESTONES.length -1] && (
            <p className="text-sm text-center text-green-600 font-semibold mt-2">
                ¡Felicidades! Has alcanzado o superado la última meta de {nextMilestoneValue.toLocaleString()} horas.
            </p>
        )}

        <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] text-center space-y-1">
            <p className={`text-sm text-[var(--color-text-light)]`}>
                Promedio: <strong className="text-[var(--color-text-main)]">{averageHoursPerDay.toLocaleString()}h / día</strong>
            </p>
            {daysToNextMilestone !== Infinity && (
                <p className={`text-sm text-[var(--color-text-light)]`}>
                    Al ritmo actual, alcanzarás la próxima meta en aprox. <strong className="text-[var(--color-text-main)]">{daysToNextMilestone.toLocaleString()} días</strong>.
                </p>
            )}
             <div className="group relative inline-block">
                 <InformationCircleIcon className="w-4 h-4 text-[var(--color-text-light)] inline-block ml-1 cursor-help" />
                 <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    El promedio y la estimación se basan en todo tu historial de actividad para el idioma/filtro seleccionado.
                </span>
            </div>
        </div>
      </div>
    </Card>
  );
};