
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { LeaderboardEntry, UserProfile } from '../../types.ts';
import { SearchIcon } from '../../components/icons/SearchIcon.tsx';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon.tsx';
import { followUser, unfollowUser, checkFollowingStatus } from '../../services/supabaseClient.ts';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon.tsx';
import { UserMinusIcon } from '../../components/icons/UserMinusIcon.tsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { LeaderboardList } from './LeaderboardList.tsx';
import { TrophyIcon } from '../../components/icons/TrophyIcon.tsx';
import { GlobeAltIcon } from '../../components/icons/GlobeAltIcon.tsx';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon.tsx';

type LeaderboardView = 'global' | 'friends' | 'user_search';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export const LeaderboardScreen: React.FC = () => {
    const { user } = useAppContext();
    const [view, setView] = useState<LeaderboardView>('global');
    const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

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

    const handleSearchUsers = useCallback(async () => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setSearchingUsers(true);
        setSearchError(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .ilike('username', `%${searchTerm.trim()}%`)
                .limit(20);

            if (error) throw error;

            const profilesWithFollowingStatus = await Promise.all(
                (data as UserProfile[]).map(async (profile) => {
                    if (user && user.id !== profile.id) {
                        const isFollowing = await checkFollowingStatus(user.id, profile.id);
                        return { ...profile, isFollowing };
                    }
                    return profile;
                })
            );
            setSearchResults(profilesWithFollowingStatus);
        } catch (err) {
            console.error("Error searching users:", err);
            setSearchError("No se pudo buscar usuarios. Inténtalo de nuevo.");
            setSearchResults([]);
        } finally {
            setSearchingUsers(false);
        }
    }, [searchTerm, user]);

    const handleFollowToggle = useCallback(async (profileId: string, isCurrentlyFollowing: boolean) => {
        if (!user) return;

        try {
            if (isCurrentlyFollowing) {
                await unfollowUser(user.id, profileId);
            } else {
                await followUser(user.id, profileId);
            }
            // Update the specific profile's following status in searchResults
            setSearchResults(prevResults =>
                prevResults.map(profile =>
                    profile.id === profileId ? { ...profile, isFollowing: !isCurrentlyFollowing } : profile
                )
            );
        } catch (err) {
            console.error("Error toggling follow status:", err);
            alert("No se pudo actualizar el estado de seguimiento. Inténtalo de nuevo.");
        }
    }, [user]);

    useEffect(() => {
        if (view === 'user_search') {
            handleSearchUsers();
        } else {
            setSearchResults([]); // Clear search results when not in user search view
            setSearchTerm(''); // Clear search term
            fetchLeaderboard();
        }
    }, [fetchLeaderboard, handleSearchUsers, view]);
    
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
                        <Button 
                            variant={view === 'user_search' ? 'secondary' : 'ghost'} 
                            onClick={() => setView('user_search')}
                            leftIcon={<SearchIcon className="w-5 h-5"/>}
                             className="flex-1"
                        >
                            Buscar Usuarios
                        </Button>
                    </div>

                    {/* Period Toggle */}
                    {view !== 'user_search' && (
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
                    )}
                </div>
            </Card>

            {view === 'user_search' ? (
                <Card>
                    <div className="p-4 space-y-4">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Buscar usuarios por nombre de usuario..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm pl-10"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-placeholder-text)]" />
                        </div>

                        {searchingUsers ? (
                            <div className="flex justify-center items-center py-10">
                                <LoadingSpinner text="Buscando usuarios..." />
                            </div>
                        ) : searchError ? (
                            <p className="text-center text-red-500 py-10">{searchError}</p>
                        ) : searchResults.length === 0 && searchTerm.length > 0 ? (
                            <p className="text-center text-[var(--color-text-light)] py-10">No se encontraron usuarios con ese nombre.</p>
                        ) : searchResults.length === 0 && searchTerm.length === 0 ? (
                            <p className="text-center text-[var(--color-text-light)] py-10">Escribe un nombre de usuario para buscar.</p>
                        ) : (
                            <div className="space-y-3">
                                {searchResults.map(profile => (
                                    <div key={profile.id} className="flex items-center space-x-3 p-3 bg-[var(--color-card-bg)] rounded-lg shadow-sm">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.display_name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="w-10 h-10 text-[var(--color-secondary)]" />
                                        )}
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[var(--color-primary)]">{profile.display_name}</p>
                                            <p className="text-sm text-[var(--color-text-light)]">@{profile.username}</p>
                                        </div>
                                        {user && user.id !== profile.id && (
                                            <Button
                                                variant={profile.isFollowing ? "outline" : "primary"}
                                                size="sm"
                                                onClick={() => handleFollowToggle(profile.id, profile.isFollowing || false)}
                                                className="flex-shrink-0"
                                            >
                                                {profile.isFollowing ? <><UserMinusIcon className="w-4 h-4 mr-1" /> Dejar de Seguir</> : <><UserPlusIcon className="w-4 h-4 mr-1" /> Seguir</>}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
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
            )}
        </div>
    );
};