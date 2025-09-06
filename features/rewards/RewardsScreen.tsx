
import React, { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { AVAILABLE_REWARDS, REDEEM_CODES_MAP, MASTER_REDEEM_CODE, ALL_REWARD_DEFINITIONS } from '../../constants.ts';
import { RewardItem, AppTheme } from '../../types.ts';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { LockClosedIcon } from '../../components/icons/LockClosedIcon.tsx';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon.tsx';
import { StarIcon } from '../../components/icons/StarIcon.tsx'; // For active flair

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

// Placeholder for reward item icons if specific ones aren't defined in RewardItem
const DefaultRewardIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


interface RewardCardProps {
  reward: RewardItem;
  isUnlocked: boolean;
  canAfford?: boolean; // Optional, as it's not needed for "My Flairs" display
  onPurchase?: (rewardId: string) => void; // Optional for "My Flairs"
  isActiveFlair?: boolean;
  onActivateFlair: (flairId: string | null) => void;
  currentTheme?: AppTheme; // Optional for flairs
  onActivateTheme?: (themeId: AppTheme) => void; // Optional for flairs
}

const RewardCard: React.FC<RewardCardProps> = ({ 
    reward, isUnlocked, canAfford, onPurchase, 
    isActiveFlair, onActivateFlair, currentTheme, onActivateTheme
}) => {
  const handleActivate = () => {
    if (reward.type === 'flair') {
      onActivateFlair(isActiveFlair ? null : reward.id);
    } else if (reward.type === 'theme' && reward.value && onActivateTheme) {
      onActivateTheme(reward.value as AppTheme);
    }
  };

  const isThemeActive = reward.type === 'theme' && currentTheme === reward.value;

  return (
    <Card 
        title={reward.name} 
        className={`flex flex-col justify-between h-full shadow-lg border-2 ${isUnlocked ? 'border-green-500 dark:border-green-600' : 'border-[var(--color-border-light)]'}`}
        titleClassName={isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-[var(--color-primary)]'}
    >
      <div>
        {reward.icon ? (
            <img src={reward.icon} alt={reward.name} className="w-12 h-12 mx-auto mb-3 object-contain filter dark:brightness-0 dark:invert" />
        ) : (
            <DefaultRewardIcon className="w-12 h-12 mx-auto mb-3 text-[var(--color-accent)]" />
        )}
        <p className="text-sm text-[var(--color-text-light)] mb-3 min-h-[40px]">{reward.description}</p>
      </div>
      <div className="mt-auto">
        {onPurchase && canAfford !== undefined && reward.cost > 0 && ( // Only show cost if it's a purchasable context
          <div className="flex items-center justify-center space-x-2 mb-3">
              <img src="./assets/money.png" alt="Puntos" className="w-5 h-5" />
              <span className={`text-lg font-semibold ${!isUnlocked && !canAfford ? 'text-red-500' : 'text-[var(--color-secondary)]'}`}>
                  {reward.cost}
              </span>
          </div>
        )}
        {isUnlocked ? (
          <div className="text-center">
            {reward.category !== 'Secreto' && ( // Don't show "Unlocked" for secret flairs in main store, they won't be there
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 mr-1"/> Desbloqueado
                </p>
            )}
            {reward.type === 'flair' && (
              <Button onClick={handleActivate} variant={isActiveFlair ? "secondary" : "outline"} size="sm" className="mt-2 w-full">
                {isActiveFlair ? "Desactivar Título" : "Activar Título"}
              </Button>
            )}
            {reward.type === 'theme' && reward.value && onActivateTheme && (
              <Button onClick={handleActivate} variant={isThemeActive ? "secondary" : "outline"} size="sm" className="mt-2 w-full" disabled={isThemeActive}>
                {isThemeActive ? "Tema Activo" : "Activar Tema"}
              </Button>
            )}
          </div>
        ) : (
          onPurchase && canAfford !== undefined && reward.cost > 0 && (
            <Button 
                onClick={() => onPurchase(reward.id)} 
                variant="primary" 
                disabled={!canAfford}
                className="w-full"
                leftIcon={!canAfford ? <LockClosedIcon className="w-4 h-4"/> : undefined}
            >
                {canAfford ? "Comprar" : "Insuficientes"}
            </Button>
          )
        )}
      </div>
    </Card>
  );
};


export const RewardsScreen: React.FC = () => {
  const { userProfile, purchaseReward, activateFlair, appTheme, updateAppTheme, unlockRewardById, updateUserProfile, getRewardById } = useAppContext();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handlePurchase = (rewardId: string) => {
    const success = purchaseReward(rewardId);
    if (success) {
      showFeedback("¡Recompensa desbloqueada y activada!");
    } else {
      const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
      if (reward && userProfile && userProfile.focusPoints < reward.cost) {
        showFeedback("No tienes suficientes Puntos de Enfoque.", "error");
      } else {
        showFeedback("No se pudo desbloquear la recompensa o ya la tienes.", "error");
      }
    }
  };

  const handleActivateFlair = (flairId: string | null) => {
    activateFlair(flairId);
    showFeedback(flairId ? "Título activado." : "Título desactivado.");
  };

  const handleActivateTheme = (themeValue: AppTheme) => {
    updateAppTheme(themeValue, true); // true indicates it's from a reward/code
    showFeedback(`Tema "${themeValue}" activado.`);
  };

  const handleRedeemCode = useCallback(() => {
    if (!userProfile) return;

    const now = Date.now();
    if (userProfile.lastRedeemAttemptTimestamp && (now - userProfile.lastRedeemAttemptTimestamp) < 3000) {
        showFeedback("Por favor, espera un momento antes de intentarlo de nuevo.", "error");
        return;
    }
    updateUserProfile({ lastRedeemAttemptTimestamp: now });


    const code = redeemCodeInput.trim().toUpperCase();
    if (!code) {
      showFeedback("Por favor, ingresa un código.", "error");
      return;
    }

    const rewardId = REDEEM_CODES_MAP[code];

    if (code === MASTER_REDEEM_CODE.toUpperCase()) {
      let unlockedCount = 0;
      AVAILABLE_REWARDS.forEach(reward => {
        if (!(userProfile.unlockedRewards || []).includes(reward.id)) {
          if (unlockRewardById(reward.id, true, true)) unlockedCount++; // bypassCost, silent
        }
      });
      ALL_REWARD_DEFINITIONS.filter(r => r.category === 'Secreto').forEach(secretReward => {
         if (!(userProfile.unlockedRewards || []).includes(secretReward.id)) {
          if (unlockRewardById(secretReward.id, true, true)) unlockedCount++; // bypassCost, silent
        }
      });
      showFeedback(unlockedCount > 0 ? `¡Código maestro! ${unlockedCount} recompensas desbloqueadas.` : "¡Código maestro! Todas las recompensas base y secretas disponibles ya estaban desbloqueadas.");
    } else if (rewardId) {
      const reward = getRewardById(rewardId);
      if (!reward) {
        showFeedback("No se encontró la recompensa asociada al código.", "error");
        return;
      }

      if ((userProfile.unlockedRewards || []).includes(rewardId)) {
        showFeedback("Ya has desbloqueado esta recompensa.", "error");
      } else if (reward.type === 'points') {
        // Handle points redemption
        const pointsToAdd = parseInt(reward.value || '0', 10);
        if (pointsToAdd > 0) {
          updateUserProfile({ focusPoints: userProfile.focusPoints + pointsToAdd });
          unlockRewardById(reward.id, true, true); // Mark as unlocked, bypass cost, silent
          showFeedback(`¡Has canjeado ${pointsToAdd} Puntos de Enfoque!`);
        } else {
          showFeedback("No se pudo canjear el código de puntos.", "error");
        }
      } else {
        const success = unlockRewardById(rewardId);
        if (success) {
          showFeedback(`¡"${reward?.name || 'Recompensa'}" desbloqueada y activada!`);
        } else {
          showFeedback("No se pudo canjear el código.", "error");
        }
      }
    } else {
      showFeedback("Código inválido.", "error");
    }
    setRedeemCodeInput('');
  }, [userProfile, redeemCodeInput, unlockRewardById, updateUserProfile]);


  if (!userProfile) {
    return <p className="p-4 text-center">Cargando perfil...</p>;
  }

  const unlockedFlairItems = useMemo(() => {
    return (userProfile.unlockedRewards || [])
      .map(id => getRewardById(id))
      .filter(reward => reward && reward.type === 'flair') as RewardItem[];
  }, [userProfile.unlockedRewards, getRewardById]);


  const rewardsByCategory = AVAILABLE_REWARDS.reduce((acc, reward) => {
    const category = reward.category;
    // Exclude 'Secreto' category from main store display
    if (category === 'Secreto' || reward.type === 'points') return acc;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(reward);
    return acc;
  }, {} as Record<Exclude<RewardItem['category'], 'Secreto'>, RewardItem[]>);


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--color-card-bg)] p-4 rounded-lg shadow">
        <h1 className="text-3xl font-poppins font-bold text-[var(--color-primary)] mb-2 sm:mb-0">
          Tienda y Mis Títulos
        </h1>
        <div className="flex items-center space-x-2">
          <img src="./assets/money.png" alt="Puntos de Enfoque" className="w-8 h-8" />
          <span className="text-2xl font-semibold text-[var(--color-accent)]">
            {userProfile.focusPoints}
          </span>
          <span className="text-sm text-[var(--color-text-light)]">Puntos de Enfoque</span>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3 rounded-md text-center text-sm ${feedbackMessage.includes("desbloqueada") || feedbackMessage.includes("activado") || feedbackMessage.includes("maestro") ? 'bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-700/30 text-red-700 dark:text-red-300'}`}>
          {feedbackMessage}
        </div>
      )}

      <Card title="Canjear Código">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <input 
                id="redeem-code"
                type="text"
                value={redeeemCodeInput}
                onChange={(e) => setRedeemCodeInput(e.target.value)}
                placeholder="Ingresa tu código promocional"
                className={`${inputBaseStyle} flex-grow`}
                aria-label="Código promocional"
            />
            <Button onClick={handleRedeemCode} variant="accent" className="sm:w-auto w-full">
                Canjear
            </Button>
        </div>
      </Card>

      {unlockedFlairItems.length > 0 && (
        <Card title="Mis Títulos Desbloqueados" className="border-t-4 border-[var(--color-accent)]">
          <p className="text-sm text-[var(--color-text-light)] mb-4">Activa un título para mostrarlo en tu Dashboard.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unlockedFlairItems.map(flair => (
              <div 
                key={flair.id} 
                className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
                           ${userProfile.profileFlairId === flair.id 
                             ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-lg scale-105' 
                             : 'bg-[var(--color-card-bg)] hover:bg-purple-50 dark:hover:bg-purple-900/40 border-[var(--color-border-light)]'}`}
                onClick={() => handleActivateFlair(userProfile.profileFlairId === flair.id ? null : flair.id)}
              >
                {flair.icon && <img src={flair.icon} alt="" className="w-8 h-8 mb-1.5 filter dark:brightness-0 dark:invert opacity-75"/>}
                <p className={`font-semibold text-sm ${userProfile.profileFlairId === flair.id ? 'text-white' : 'text-[var(--color-primary)]'}`}>{flair.name.replace("Título: ", "")}</p>
                {userProfile.profileFlairId === flair.id && <span className="text-xs mt-1">(Activo)</span>}
              </div>
            ))}
          </div>
        </Card>
      )}


      {Object.entries(rewardsByCategory).map(([category, rewards]) => (
        <section key={category}>
          <h2 className="text-2xl font-poppins font-semibold text-[var(--color-primary)] mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {rewards.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                isUnlocked={(userProfile.unlockedRewards || []).includes(reward.id)}
                canAfford={(userProfile.focusPoints || 0) >= reward.cost}
                onPurchase={handlePurchase}
                isActiveFlair={reward.type === 'flair' && userProfile.profileFlairId === reward.id}
                onActivateFlair={handleActivateFlair}
                currentTheme={appTheme}
                onActivateTheme={handleActivateTheme}
              />
            ))}
          </div>
        </section>
      ))}
       <p className="text-center text-xs text-[var(--color-text-light)] mt-8">
            Más recompensas y personalizaciones se añadirán pronto. ¡Sigue acumulando Puntos de Enfoque!
        </p>
    </div>
  );
};