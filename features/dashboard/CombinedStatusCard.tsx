
import React from 'react';
import { Card } from '../../components/Card';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon'; // Changed from FireIcon
import { HeartIcon } from '../../components/icons/HeartIcon';
import { useAppContext } from '../../contexts/AppContext';

interface CombinedStatusCardProps {
  learningDays: number; // Changed from currentStreak
  habitHealthPercentage: number; // This will be overall consistency
}

export const CombinedStatusCard: React.FC<CombinedStatusCardProps> = ({ learningDays, habitHealthPercentage }) => {
  const { userProfile, dailyTargets } = useAppContext(); // Added dailyTargets from context

  const getHealthColorClassesText = () => {
    if (habitHealthPercentage >= 75) return 'text-green-500 dark:text-green-400';
    if (habitHealthPercentage >= 40) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };
  
  const healthMessage = () => {
    // Messages reflect consistency
    if (habitHealthPercentage >= 95) return "¡Consistencia Maestra!";
    if (habitHealthPercentage >= 75) return "¡Muy Consistente!";
    if (habitHealthPercentage >= 40) return "¡Buen Hábito!";
    if (habitHealthPercentage > 0) return "Construyendo...";
    return "Define Hábitos";
  }

  return (
    <Card title="Estado General" className="shadow-lg">
      <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--color-border-light)]">
        {/* Learning Days Section */}
        <div className="p-3 text-center">
          <CalendarDaysIcon className="w-10 h-10 text-sky-500 dark:text-sky-400 mx-auto mb-1" />
          <p className="text-3xl font-poppins font-bold text-[var(--color-primary)]">
            {learningDays}
          </p>
          <p className="text-xs text-[var(--color-text-light)] mt-0.5">
            {learningDays === 1 ? "día adquiriendo" : "días adquiriendo"}
          </p>
        </div>

        {/* Habit Health Section (Consistency) */}
        <div className="p-3 text-center">
          <HeartIcon className={`w-10 h-10 ${getHealthColorClassesText()} mx-auto mb-1 opacity-80`} />
          <p className={`text-3xl font-poppins font-bold ${getHealthColorClassesText()}`}>
            {Math.round(habitHealthPercentage)}%
          </p>
          <p className="text-xs text-[var(--color-text-light)] mt-0.5">
            {healthMessage()}
          </p>
        </div>
      </div>
      {userProfile?.primaryLanguage && (
        <p className="text-xs text-[var(--color-text-light)] text-center mt-2 pt-2 border-t border-[var(--color-border-light)]">
          en {userProfile.primaryLanguage}
        </p>
      )}
      {(learningDays === 0 && habitHealthPercentage === 0 && dailyTargets && dailyTargets.length > 0) && ( // check if dailyTargets exist
         <p className="text-xs text-center text-[var(--color-text-light)] mt-1">¡Registra una actividad hoy para empezar!</p>
      )}
      {dailyTargets && dailyTargets.length === 0 && (
         <p className="text-xs text-center text-[var(--color-text-light)] mt-1">Define hábitos en Rutinas para ver tu consistencia.</p>
      )}
    </Card>
  );
};