
import React from 'react';
import { Card } from '../../components/Card.tsx';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon.tsx'; // Using CalendarDaysIcon as a placeholder
import { useAppContext } from '../../contexts/AppContext.tsx';

interface LearningDaysCardProps {
  learningDays: number;
}

export const LearningDaysCard: React.FC<LearningDaysCardProps> = ({ learningDays }) => {
  const { userProfile } = useAppContext();

  return (
    <Card title="Días Adquiriendo" className="bg-gradient-to-br from-sky-400 to-cyan-600 text-white shadow-xl">
      <div className="flex flex-col items-center justify-center p-2">
        <CalendarDaysIcon className="w-16 h-16 text-sky-100 mb-2" />
        <p className="text-5xl font-poppins font-bold">
          {learningDays}
        </p>
        <p className="text-sm mt-1">
          {learningDays === 1 ? "día adquiriendo" : "días adquiriendo"}
        </p>
        {userProfile?.primaryLanguage && (
          <p className="text-xs opacity-80">
            en {userProfile.primaryLanguage}
          </p>
        )}
      </div>
      {learningDays === 0 && (
         <p className="text-xs text-center text-sky-100 mt-2">¡Registra una actividad hoy para empezar a contar!</p>
      )}
    </Card>
  );
};