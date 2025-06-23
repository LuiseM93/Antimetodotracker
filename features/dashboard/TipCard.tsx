import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
// import { LightBulbIcon } from '../../components/icons/LightBulbIcon'; // Removed
import { geminiService } from '../../services/geminiService';
import { useAppContext } from '../../contexts/AppContext';

export const TipCard: React.FC = () => {
  const { userProfile } = useAppContext();
  const [tip, setTip] = useState<string>('');

  const loadTip = React.useCallback(() => {
    if (!userProfile) {
      setTip("Completa tu perfil para recibir consejos personalizados.");
      return;
    }
    const fetchedTip = geminiService.getTipOfTheDay(userProfile.currentStage);
    setTip(fetchedTip);
  }, [userProfile]);

  useEffect(() => {
    loadTip();
  }, [loadTip]);

  return (
    <Card title="Consejo del Día" className={`bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] text-white shadow-xl`}>
      <div className="flex items-start space-x-3">
        <img 
          src="assets/light.png" 
          alt="Consejo" 
          className="w-10 h-10 object-contain mt-1 flex-shrink-0" // Adjusted size for better fit
        />
        <p className="text-sm leading-relaxed">{tip}</p>
      </div>
    </Card>
  );
};
