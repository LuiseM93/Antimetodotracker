
import React from 'react';
import { Card } from '../../components/Card';
import { FireIcon } from '../../components/icons/FireIcon';
import { useAppContext } from '../../contexts/AppContext';
import { ActivityLogEntry, Language } from '../../types';

interface StreakCardProps {
  currentStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ currentStreak }) => {
  const { userProfile } = useAppContext();

  return (
    <Card title="Racha Diaria" className="bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-xl">
      <div className="flex flex-col items-center justify-center p-2">
        <FireIcon className="w-16 h-16 text-yellow-300 mb-2" />
        <p className="text-5xl font-poppins font-bold">
          {currentStreak}
        </p>
        <p className="text-sm mt-1">
          {currentStreak === 1 ? "día consecutivo" : "días consecutivos"}
        </p>
        {userProfile?.primaryLanguage && (
          <p className="text-xs opacity-80">
            en {userProfile.primaryLanguage}
          </p>
        )}
      </div>
      {currentStreak === 0 && (
         <p className="text-xs text-center text-yellow-100 mt-2">¡Registra una actividad hoy para iniciar tu racha!</p>
      )}
    </Card>
  );
};
