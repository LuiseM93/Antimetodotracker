import React from 'react';
import { Card } from '../../components/Card';
import { HeartIcon } from '../../components/icons/HeartIcon'; // Using HeartIcon
import { useAppContext } from '../../contexts/AppContext';

interface HabitHealthCardProps {
  healthPercentage: number;
}

export const HabitHealthCard: React.FC<HabitHealthCardProps> = ({ healthPercentage }) => {
  const { userProfile } = useAppContext();

  const getHealthColorClasses = () => {
    if (healthPercentage >= 75) return 'from-green-400 to-emerald-600 text-white';
    if (healthPercentage >= 40) return 'from-yellow-400 to-amber-600 text-white';
    return 'from-red-400 to-rose-600 text-white';
  };
  
  const healthMessage = () => {
    if (healthPercentage >= 95) return "¡Excelente!";
    if (healthPercentage >= 75) return "¡Muy Bien!";
    if (healthPercentage >= 40) return "¡Sigue Así!";
    if (healthPercentage > 0) return "Un Poco es Algo";
    return "¡Empieza Ahora!";
  }


  return (
    <Card title="Salud de Hábitos Hoy" className={`bg-gradient-to-br ${getHealthColorClasses()} shadow-xl`}>
      <div className="flex flex-col items-center justify-center p-2">
        <HeartIcon className="w-16 h-16 opacity-80 mb-2" />
        <p className="text-5xl font-poppins font-bold">
          {Math.round(healthPercentage)}%
        </p>
        <p className="text-sm mt-1">
          {healthMessage()}
        </p>
        {userProfile?.primaryLanguage && (
          <p className="text-xs opacity-80 mt-0.5">
            ({userProfile.primaryLanguage})
          </p>
        )}
      </div>
    </Card>
  );
};