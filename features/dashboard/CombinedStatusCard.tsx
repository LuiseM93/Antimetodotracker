
import React from 'react';
import { Card } from '../../components/Card';
import { FireIcon } from '../../components/icons/FireIcon';
import { HeartIcon } from '../../components/icons/HeartIcon';
import { useAppContext } from '../../contexts/AppContext';

interface CombinedStatusCardProps {
  currentStreak: number;
  habitHealthPercentage: number;
}

export const CombinedStatusCard: React.FC<CombinedStatusCardProps> = ({ currentStreak, habitHealthPercentage }) => {
  const { userProfile } = useAppContext();

  const getHealthColorClassesText = () => {
    if (habitHealthPercentage >= 75) return 'text-green-500';
    if (habitHealthPercentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const healthMessage = () => {
    if (habitHealthPercentage >= 95) return "¡Excelente!";
    if (habitHealthPercentage >= 75) return "¡Muy Bien!";
    if (habitHealthPercentage >= 40) return "¡Sigue Así!";
    if (habitHealthPercentage > 0) return "Un Poco es Algo";
    return "¡Empieza Hoy!";
  }

  return (
    <Card title="Estado Diario" className="shadow-lg">
      <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--color-border-light)]">
        {/* Streak Section */}
        <div className="p-3 text-center">
          <FireIcon className="w-10 h-10 text-orange-500 mx-auto mb-1" />
          <p className="text-3xl font-poppins font-bold text-[var(--color-primary)]">
            {currentStreak}
          </p>
          <p className="text-xs text-[var(--color-text-light)] mt-0.5">
            {currentStreak === 1 ? "día de racha" : "días de racha"}
          </p>
        </div>

        {/* Habit Health Section */}
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
      {(currentStreak === 0 && habitHealthPercentage === 0) && (
         <p className="text-xs text-center text-[var(--color-text-light)] mt-1">¡Registra una actividad hoy para empezar!</p>
      )}
    </Card>
  );
};
