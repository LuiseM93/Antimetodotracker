
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import { LeaderboardEntry } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LeaderboardList } from './LeaderboardList';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { GlobeAltIcon } from '../../components/icons/GlobeAltIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';

type LeaderboardView = 'global' | 'friends';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export const LeaderboardScreen: React.FC = () => {
    const { user } = useAppContext();
    const [view, setView] = useState<LeaderboardView>('global');
    const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        let rpcName = '';
        let rpcParams = {};

        if (view === 'global') {
            rpcName = 'get_leaderboard';
            rpcParams = { period };
        } else { // friends view
            if (!user) {
                setError("Debes iniciar sesión para ver la tabla de clasificación de amigos.");
                setLoading(false);
                setLeaderboardData([]);
                return;
            }
            rpcName = 'get_friends_leaderboard';
            rpcParams = { p_user_id: user.id, period };
        }

        const { data, error: rpcError } = await supabase.rpc(rpcName, rpcParams);

        if (rpcError) {
            console.error(`Error fetching ${view} leaderboard:`, rpcError);
            setError("No se pudo cargar la tabla de clasificación. Inténtalo de nuevo más tarde.");
            setLeaderboardData([]);
        } else {
            setLeaderboardData(data as LeaderboardEntry[]);
        }

        setLoading(false);
    }, [view, period, user]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);
    
    const periodLabels: Record<LeaderboardPeriod, string> = {
      weekly: "Semanal",
      monthly: "Mensual",
      all_time: "Histórico"
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-10 h-10 text-[var(--color-accent)]" />
                    <h1 className="text-3xl font-poppins font-bold text-[var(--color-primary)]">
                        Leaderboard
                    </h1>
                </div>
            </header>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-2">
                    {/* View Toggle */}
                    <div className="flex bg-[var(--color-light-purple)] bg-opacity-30 rounded-lg p-1">
                        <Button 
                            variant={view === 'global' ? 'secondary' : 'ghost'} 
                            onClick={() => setView('global')}
                            leftIcon={<GlobeAltIcon className="w-5 h-5"/>}
                            className="flex-1"
                        >
                            Global
                        </Button>
                        <Button 
                            variant={view === 'friends' ? 'secondary' : 'ghost'} 
                            onClick={() => setView('friends')}
                            leftIcon={<UserGroupIcon className="w-5 h-5"/>}
                             className="flex-1"
                        >
                            Amigos
                        </Button>
                    </div>

                    {/* Period Toggle */}
                    <div className="flex items-center space-x-2">
                         {(['weekly', 'monthly', 'all_time'] as LeaderboardPeriod[]).map(p => (
                            <Button 
                                key={p}
                                variant={period === p ? 'accent' : 'outline'}
                                onClick={() => setPeriod(p)}
                                size="sm"
                            >
                               {periodLabels[p]}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner text="Cargando clasificación..." />
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500 py-20">{error}</p>
                ) : (
                    <LeaderboardList data={leaderboardData} currentUserId={user?.id} />
                )}
            </Card>
        </div>
    );
};
