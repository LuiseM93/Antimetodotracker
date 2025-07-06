import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { LeaderboardEntry } from '../../types.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { LeaderboardList } from './LeaderboardList.tsx';
import { TrophyIcon } from '../../components/icons/TrophyIcon.tsx';
import { GlobeAltIcon } from '../../components/icons/GlobeAltIcon.tsx';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon.tsx';

type LeaderboardView = 'global' | 'friends';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

const LeaderboardScreen: React.FC = () => {
    const { user } = useAppContext();
    const [view, setView] = useState<LeaderboardView>('global');
    const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        let response;
        if (view === 'global') {
            response = await supabase.rpc('get_leaderboard', { period });
        } else { // friends view
            if (!user) {
                setError("Debes iniciar sesión para ver la tabla de clasificación de amigos.");
                setLoading(false);
                setLeaderboardData([]);
                return;
            }
            response = await supabase.rpc('get_friends_leaderboard', { p_user_id: user.id, period });
        }

        const { data, error: rpcError } = response;

        if (rpcError) {
            console.error(`Error fetching ${view} leaderboard:`, rpcError);
            setError("No se pudo cargar la tabla de clasificación. Inténtalo de nuevo más tarde.");
            setLeaderboardData([]);
        } else {
            setLeaderboardData(data || []);
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
    <div className="min-h-screen">
      <header className="bg-[#4a148c] p-4 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Comunidad</h1>
          <button className="text-white">
            <span className="material-icons">notifications</span>
          </button>
        </div>
      </header>
      <main className="p-4 container mx-auto">
        <div className="w-full">
          <div className="mb-4 border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <a className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="#">
                Feed
              </a>
              <a className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-purple-600 text-purple-600" href="#">
                Clasificación
              </a>
              <a className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" href="#">
                Mi Perfil
              </a>
            </nav>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button onClick={() => setView('global')} className={`px-4 py-2 rounded-full text-sm font-medium ${view === 'global' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>Global</button>
              <button onClick={() => setView('friends')} className={`px-4 py-2 rounded-full text-sm font-medium ${view === 'friends' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>Amigos</button>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <span className="material-icons text-sm">event</span>
              <span className="text-sm font-medium">{periodLabels[period]}</span>
              <span className="material-icons">expand_more</span>
            </div>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner text="Cargando clasificación..." />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 py-20">{error}</p>
            ) : (
              leaderboardData.map((entry, index) => (
                <div key={entry.user_id} className={`bg-white rounded-xl p-3 flex items-center space-x-4 shadow ${entry.user_id === user?.id ? 'bg-purple-100 border-2 border-purple-500' : ''}`}>
                  <span className="text-xl font-bold text-gray-500 w-6 text-center">{index + 1}</span>
                  <img alt="Avatar" className="h-10 w-10 rounded-full" src={entry.avatar_url || 'https://via.placeholder.com/150'}/>
                  <p className="font-semibold flex-1">{entry.display_name} {entry.user_id === user?.id && '(Tú)'}</p>
                  <p className="font-bold text-gray-700">{entry.total_focus_points} Pts</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <div className="pb-20"></div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md flex justify-around py-2 border-t border-gray-200">
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">dashboard</span>
          <span className="text-xs block">Dashboard</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">track_changes</span>
          <span className="text-xs block">Tracker</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">article</span>
          <span className="text-xs block">Routines</span>
        </a>
        <a className="text-center text-purple-600 font-bold" href="#">
          <span className="material-icons">people</span>
          <span className="text-xs block">Social</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">store</span>
          <span className="text-xs block">Store</span>
        </a>
      </nav>
    </div>
  );
};

export default LeaderboardScreen;