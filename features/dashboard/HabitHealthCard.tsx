
import React from 'react';
import { Card } from '../../components/Card.tsx';
import { HeartIcon } from '../../components/icons/HeartIcon.tsx'; // Using HeartIcon
import { useAppContext } from '../../contexts/AppContext.tsx';

interface HabitHealthCardProps {
  healthPercentage: number; // This will now be overall consistency
}

export const HabitHealthCard: React.FC<HabitHealthCardProps> = ({ healthPercentage }) => {
  const { userProfile } = useAppContext();

  const getHealthColorClasses = () => {
    if (healthPercentage >= 75) return 'from-green-400 to-emerald-600 text-white';
    if (healthPercentage >= 40) return 'from-yellow-400 to-amber-600 text-white';
    return 'from-red-400 to-rose-600 text-white';
  };
  
  const healthMessage = () => {
    // Messages reflect consistency now
    if (healthPercentage >= 95) return "¡Consistencia Maestra!";
    if (healthPercentage >= 75) return "¡Muy Consistente!";
    if (healthPercentage >= 40) return "¡Buen Hábito!";
    if (healthPercentage > 0) return "Construyendo...";
    return "Define Hábitos";
  }


  return (
    <Card title="Consistencia de Hábitos" className={`bg-gradient-to-br ${getHealthColorClasses()} shadow-xl`}>
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