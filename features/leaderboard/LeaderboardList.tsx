
import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardEntry } from '../../types.ts';
import { formatDurationFromSeconds } from '../../utils/timeUtils.ts';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon.tsx';
import { TrophyIcon } from '../../components/icons/TrophyIcon.tsx';

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  currentUserId?: string;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ data, currentUserId }) => {

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-light)]">
        <p className="font-semibold">¡Aún no hay nadie en la clasificación!</p>
        <p className="text-sm mt-2">Sé el primero en registrar una actividad para aparecer aquí.</p>
      </div>
    );
  }

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-amber-400';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-[var(--color-text-light)]';
  };

  return (
    <ul className="space-y-2">
      {data.map((entry) => {
        const isCurrentUser = entry.user_id === currentUserId;
        return (
          <li
            key={entry.user_id}
            className={`p-3 rounded-lg flex items-center gap-4 transition-all duration-200
                       ${isCurrentUser 
                         ? 'bg-[var(--color-light-purple)] border-2 border-[var(--color-accent)] scale-[1.02]' 
                         : 'bg-[var(--color-card-bg)] border border-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
          >
            <div className={`w-10 text-center flex-shrink-0 font-bold text-xl ${getRankColor(entry.rank)}`}>
              {entry.rank <= 3 ? <TrophyIcon className="w-8 h-8 mx-auto" /> : `#${entry.rank}`}
            </div>
            <Link to={`/profile/${entry.username}`} className="flex items-center gap-3 flex-grow">
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt={entry.display_name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-[var(--color-secondary)]" />
              )}
              <div className="flex-grow">
                <p className={`font-semibold text-[var(--color-primary)]`}>
                  {entry.display_name}
                </p>
                <p className={`text-sm text-[var(--color-text-light)]`}>
                  @{entry.username}
                </p>
              </div>
            </Link>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg text-[var(--color-accent)]">
                {formatDurationFromSeconds(entry.total_seconds, 'short')}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};