import React from 'react';
import { Card } from '../../components/Card.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Link } from 'react-router-dom';
import { AppView } from '../../types.ts';

export const GoalsCard: React.FC = () => {
  const { userGoals, toggleUserGoal, userProfile } = useAppContext();

  const progressBarBaseHeight = "h-2.5";

  const goalsToDisplay = userGoals.filter(goal => {
    if ((userProfile?.primaryLanguage as string) === 'Total') {
      return true; // Show all goals if 'Total' is selected
    }
    return (userProfile?.primaryLanguage && goal.language === userProfile.primaryLanguage) ||
           (!userProfile?.primaryLanguage && !goal.language);
  });

  return (
    <Card title="Mis Metas Personales">
      {goalsToDisplay.length > 0 ? (
        <ul className="space-y-3">
          {goalsToDisplay.map(goal => {
            const isQuantifiable = goal.targetValue && goal.targetValue > 0;
            const progressPercent = isQuantifiable ? Math.min(100, ((goal.currentValue || 0) / goal.targetValue!) * 100) : 0;
            
            return (
              <li key={goal.id} className={`p-3 rounded-md ${goal.achieved ? `bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700` : `bg-[var(--color-light-purple)] bg-opacity-20 border-[var(--color-light-purple)]` } border`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center flex-grow">
                    <input
                      type="checkbox"
                      checked={goal.achieved}
                      onChange={() => toggleUserGoal(goal.id)}
                      className={`h-5 w-5 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-input-border)] mr-3 flex-shrink-0`}
                    />
                    <span className={`${goal.achieved ? 'line-through text-gray-500 dark:text-gray-400' : `text-[var(--color-text-main)]`}`}>
                      {goal.description} {goal.language && `(${goal.language})`}
                    </span>
                  </div>
                </div>

                {isQuantifiable && !goal.achieved && (
                  <div className="mt-1.5 pl-8"> 
                    <div className="flex justify-between text-xs text-[var(--color-text-light)] mb-0.5">
                      <span>Progreso:</span>
                      <span>{goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
                    </div>
                    <div className={`w-full bg-gray-300 dark:bg-gray-600 rounded-full ${progressBarBaseHeight} overflow-hidden`}>
                      <div 
                        className={`bg-[var(--color-accent)] ${progressBarBaseHeight} rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="text-right mt-1">
                   <Link to={AppView.TRACKER} className="text-[var(--color-accent)] hover:underline text-sm">Ver detalles</Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={`text-[var(--color-text-light)]`}>Aún no has añadido ninguna meta personal. ¡Define tus próximos hitos en la sección de <Link to={AppView.TRACKER} className="text-[var(--color-accent)] hover:underline">Tracker</Link>!</p>
      )}
    </Card>
  );
};
