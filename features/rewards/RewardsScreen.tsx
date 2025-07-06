import React, { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { AVAILABLE_REWARDS, REDEEM_CODES_MAP, MASTER_REDEEM_CODE, ALL_REWARD_DEFINITIONS } from '../../constants.ts';
import { RewardItem, AppTheme } from '../../types.ts';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { LockClosedIcon } from '../../components/icons/LockClosedIcon.tsx';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon.tsx';

interface RewardCardProps {
  reward: RewardItem;
  isUnlocked: boolean;
  canAfford?: boolean; 
  onPurchase?: (rewardId: string) => void; 
  isActiveFlair?: boolean;
  onActivateFlair: (flairId: string | null) => void;
  currentTheme?: AppTheme; 
  onActivateTheme?: (themeId: AppTheme) => void; 
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
            <svg className="w-12 h-12 mx-auto mb-3 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
              <path strokeLinecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )}
        <p className="text-sm text-[var(--color-text-light)] mb-3 min-h-[40px]">{reward.description}</p>
      </div>
      <div className="mt-auto">
        {onPurchase && canAfford !== undefined && reward.cost > 0 && ( 
          <div className="flex items-center justify-center space-x-2 mb-3">
              <img src="./assets/money.png" alt="Puntos" className="w-5 h-5" />
              <span className={`text-lg font-semibold ${!isUnlocked && !canAfford ? 'text-red-500' : 'text-[var(--color-secondary)]'}`}>
                  {reward.cost}
              </span>
          </div>
        )}
        {isUnlocked ? (
          <div className="text-center">
            {reward.category !== 'Secreto' && (
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
  const [feedbackMessage, setFeedbackMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ message, type });
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
    updateAppTheme(themeValue, true); 
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
          if (unlockRewardById(reward.id)) unlockedCount++; 
        }
      });
      ALL_REWARD_DEFINITIONS.filter(r => r.category === 'Secreto').forEach(secretReward => {
         if (!(userProfile.unlockedRewards || []).includes(secretReward.id)) {
          if (unlockRewardById(secretReward.id)) unlockedCount++; 
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
        
        const pointsToAdd = parseInt(reward.value || '0', 10);
        if (pointsToAdd > 0) {
          updateUserProfile({ focusPoints: userProfile.focusPoints + pointsToAdd });
          unlockRewardById(reward.id); 
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
    
    if (category === 'Secreto') return acc;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(reward);
    return acc;
  }, {} as Record<Exclude<RewardItem['category'], 'Secreto'>, RewardItem[]>);


  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden">
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <div className="text-[#161117] flex size-12 shrink-0 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </div>
          <h2 className="text-[#161117] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Tienda</h2>
        </div>
        <h3 className="text-[#161117] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Puntos de Enfoque</h3>
        <div className="flex items-center gap-4 bg-white px-4 min-h-14">
          <div className="text-[#161117] flex items-center justify-center rounded-lg bg-[#f3f0f4] shrink-0 size-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z"
              ></path>
            </svg>
          </div>
          <p className="text-[#161117] text-base font-normal leading-normal flex-1 truncate">{userProfile.focusPoints}</p>
        </div>
        <h3 className="text-[#161117] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Canjear Código</h3>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <input
              placeholder="Ingresa el código"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#161117] focus:outline-0 focus:ring-0 border-none bg-[#f3f0f4] focus:border-none h-14 placeholder:text-[#7c6487] p-4 text-base font-normal leading-normal"
              value={redeemCodeInput}
              onChange={(e) => setRedeemCodeInput(e.target.value)}
            />
          </label>
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-4 bg-[#67148e] text-white text-base font-bold leading-normal tracking-[0.015em] w-fit"
            onClick={handleRedeemCode}
          >
            <span className="truncate">Canjear</span>
          </button>
        </div>
        {feedbackMessage && (
          <div className={`p-3 rounded-md text-center text-sm ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {feedbackMessage.message}
          </div>
        )}
        <h3 className="text-[#161117] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Mis Recompensas Desbloqueadas</h3>
        {unlockedFlairItems.map(reward => (
          <div key={reward.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div className="text-[#161117] flex items-center justify-center rounded-lg bg-[#f3f0f4] shrink-0 size-12">
                {reward.type === 'theme' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M200.77,53.89A103.27,103.27,0,0,0,128,24h-1.07A104,104,0,0,0,24,128c0,43,26.58,79.06,69.36,94.17A32,32,0,0,0,136,192a16,16,0,0,1,16-16h46.21a31.81,31.81,0,0,0,31.2-24.88,104.43,104.43,0,0,0,2.59-24A103.28,103.28,0,0,0,200.77,53.89Zm13,93.71A15.89,15.89,0,0,1,198.21,160H152a32,32,0,0,0-32,32,16,16,0,0,1-21.31,15.07C62.49,194.3,40,164,40,128a88,88,0,0,1,87.09-88h.9a88.35,88.35,0,0,1,88,87.25A88.86,88.86,0,0,1,213.81,147.6ZM140,76a12,12,0,1,1-12-12A12,12,0,0,1,140,76ZM96,100A12,12,0,1,1,84,88,12,12,0,0,1,96,100Zm0,56a12,12,0,1,1-12-12A12,12,0,0,1,96,156Zm88-56a12,12,0,1,1-12-12A12,12,0,0,1,184,100Z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M200,112a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,112Zm-8,24H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm40-80V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Zm-80.26-34a8,8,0,1,1-15.5,4c-2.63-10.26-13.06-18-24.25-18s-21.61,7.74-24.25,18a8,8,0,1,1-15.5-4,39.84,39.84,0,0,1,17.19-23.34,32,32,0,1,1,45.12,0A39.76,39.76,0,0,1,135.75,166ZM96,136a16,16,0,1,0-16-16A16,16,0,0,0,96,136Z"></path>
                  </svg>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#161117] text-base font-medium leading-normal line-clamp-1">{reward.name}</p>
                <p className="text-[#7c6487] text-sm font-normal leading-normal line-clamp-2">{reward.description}</p>
              </div>
            </div>
            <div className="shrink-0">
              <label
                className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 ${reward.type === 'flair' && userProfile.profileFlairId === reward.id || (reward.type === 'theme' && appTheme === reward.value) ? 'bg-[#67148e]' : 'bg-[#f3f0f4]'}`}
              >
                <div className="h-full w-[27px] rounded-full bg-white" style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}></div>
                <input
                  type="checkbox"
                  className="invisible absolute"
                  checked={reward.type === 'flair' && userProfile.profileFlairId === reward.id || (reward.type === 'theme' && appTheme === reward.value)}
                  onChange={() => {
                    if (reward.type === 'flair') {
                      handleActivateFlair(userProfile.profileFlairId === reward.id ? null : reward.id);
                    } else if (reward.type === 'theme') {
                      handleActivateTheme(reward.value as AppTheme);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}
        <h3 className="text-[#161117] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Recompensas Disponibles</h3>
        {Object.entries(rewardsByCategory).map(([category, rewards]) => (
          <React.Fragment key={category}>
            {rewards.map(reward => {
              const isUnlocked = (userProfile.unlockedRewards || []).includes(reward.id);
              const canAfford = (userProfile.focusPoints || 0) >= reward.cost;
              if (isUnlocked) return null; 

              return (
                <div key={reward.id} className="flex gap-4 bg-white px-4 py-3 justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-[#161117] flex items-center justify-center rounded-lg bg-[#f3f0f4] shrink-0 size-12">
                      {reward.type === 'theme' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M200.77,53.89A103.27,103.27,0,0,0,128,24h-1.07A104,104,0,0,0,24,128c0,43,26.58,79.06,69.36,94.17A32,32,0,0,0,136,192a16,16,0,0,1,16-16h46.21a31.81,31.81,0,0,0,31.2-24.88,104.43,104.43,0,0,0,2.59-24A103.28,103.28,0,0,0,200.77,53.89Zm13,93.71A15.89,15.89,0,0,1,198.21,160H152a32,32,0,0,0-32,32,16,16,0,0,1-21.31,15.07C62.49,194.3,40,164,40,128a88,88,0,0,1,87.09-88h.9a88.35,88.35,0,0,1,88,87.25A88.86,88.86,0,0,1,213.81,147.6ZM140,76a12,12,0,1,1-12-12A12,12,0,0,1,140,76ZM96,100A12,12,0,1,1,84,88,12,12,0,0,1,96,100Zm0,56a12,12,0,1,1-12-12A12,12,0,0,1,96,156Zm88-56a12,12,0,1,1-12-12A12,12,0,0,1,184,100Z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M200,112a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,112Zm-8,24H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm40-80V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Zm-80.26-34a8,8,0,1,1-15.5,4c-2.63-10.26-13.06-18-24.25-18s-21.61,7.74-24.25,18a8,8,0,1,1-15.5-4,39.84,39.84,0,0,1,17.19-23.34,32,32,0,1,1,45.12,0A39.76,39.76,0,0,1,135.75,166ZM96,136a16,16,0,1,0-16-16A16,16,0,0,0,96,136Z"></path>
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-[#161117] text-base font-medium leading-normal">{reward.name}</p>
                      <p className="text-[#7c6487] text-sm font-normal leading-normal">Costo: {reward.cost} puntos</p>
                      <p className="text-[#7c6487] text-sm font-normal leading-normal">{reward.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#f3f0f4] text-[#161117] text-sm font-medium leading-normal w-fit"
                      onClick={() => handlePurchase(reward.id)}
                      disabled={!canAfford}
                    >
                      <span className="truncate">{canAfford ? "Comprar" : "Insuficientes"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div>
        <div className="flex justify-end overflow-hidden px-5 pb-5">
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-[#67148e] text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-2 gap-4 pl-4 pr-6"
          >
            <div className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
            </div>
          </button>
        </div>
        <div className="h-5 bg-white"></div>
      </div>
    </div>
  );
};

export default RewardsScreen;