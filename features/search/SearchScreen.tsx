
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { UserProfile } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card } from '../../components/Card';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../../components/Button';
import { Database } from '../../services/database.types';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

interface SearchResultProfile {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_following: boolean; // Indicates if the current user is following this profile
}

export const SearchScreen: React.FC = () => {
    const { user, getProfileFollowCounts } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (term: string) => {
        if (term.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: dbError } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .ilike('username', `%${term}%`) // Case-insensitive search
                .limit(20); // Limit results for performance

            if (dbError) {
                throw dbError;
            }

            if (user) {
                // Check if current user is following each search result
                const profilesWithFollowStatus: SearchResultProfile[] = await Promise.all(
                    (data || []).map(async (profile) => {
                        const { data: followData, error: followError } = await supabase
                            .from('relationships')
                            .select('*', { count: 'exact' })
                            .eq('follower_id', user.id)
                            .eq('following_id', profile.id)
                            .maybeSingle();
                        
                        if (followError && followError.code !== 'PGRST116') {
                            console.error("Error checking follow status:", followError);
                        }
                        return {
                            ...profile,
                            is_following: !!followData,
                        };
                    })
                );
                setSearchResults(profilesWithFollowStatus);
            } else {
                setSearchResults(data || []);
            }

        } catch (err: any) {
            console.error("Error searching users:", err);
            setError("Error al buscar usuarios. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers(searchTerm);
        }, 500); // Debounce search term

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, fetchUsers]);

    const handleFollowToggle = async (profileToToggle: SearchResultProfile) => {
        if (!user) {
            setError("Debes iniciar sesión para seguir/dejar de seguir usuarios.");
            return;
        }

        setLoading(true); // Temporarily set loading for the whole screen
        
        try {
            if (profileToToggle.is_following) {
                // Unfollow
                const { error } = await supabase
                    .from('relationships')
                    .delete()
                    .match({ follower_id: user.id, following_id: profileToToggle.id });
                if (!error) {
                    setSearchResults(prev => prev.map(p => p.id === profileToToggle.id ? { ...p, is_following: false } : p));
                } else {
                    throw error;
                }
            } else {
                // Follow
                const payload: Database['public']['Tables']['relationships']['Insert'] = {
                    follower_id: user.id, 
                    following_id: profileToToggle.id 
                };
                const { error } = await supabase
                    .from('relationships')
                    .insert(payload);
                if (!error) {
                    setSearchResults(prev => prev.map(p => p.id === profileToToggle.id ? { ...p, is_following: true } : p));
                } else {
                    throw error;
                }
            }
        } catch (err: any) {
            console.error("Error toggling follow status:", err);
            setError("No se pudo actualizar el estado de seguimiento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-poppins font-bold text-[var(--color-primary)]">Buscar Usuarios</h1>
            
            <Card>
                <div className="relative">
                    <input
                        id="search-users-input"
                        type="text"
                        placeholder="Buscar por nombre de usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputBaseStyle} pl-10`}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-light)]" />
                </div>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <LoadingSpinner text="Buscando..." />
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-10">{error}</p>
            ) : searchTerm.trim().length < 2 ? (
                <p className="text-center text-[var(--color-text-light)] py-10">
                    Ingresa al menos 2 caracteres para empezar a buscar.
                </p>
            ) : searchResults.length === 0 ? (
                <p className="text-center text-[var(--color-text-light)] py-10">
                    No se encontraron usuarios con ese nombre.
                </p>
            ) : (
                <Card title="Resultados de la Búsqueda">
                    <ul className="space-y-3">
                        {searchResults.map((profile) => (
                            <li key={profile.id} className="flex items-center justify-between p-3 bg-[var(--color-card-bg)] rounded-md shadow-sm border border-[var(--color-border-light)]">
                                <Link to={`/profile/${profile.username}`} className="flex items-center space-x-3 flex-grow">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.display_name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-10 h-10 text-[var(--color-secondary)]" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-[var(--color-primary)]">{profile.display_name}</p>
                                        <p className="text-sm text-[var(--color-text-light)]">@{profile.username}</p>
                                    </div>
                                </Link>
                                {user && user.id !== profile.id && ( // Don't show follow button for own profile
                                    <Button
                                        onClick={() => handleFollowToggle(profile)}
                                        variant={profile.is_following ? 'outline' : 'primary'}
                                        size="sm"
                                        isLoading={loading} // Use a more localized loading state if possible
                                    >
                                        {profile.is_following ? 'Siguiendo' : 'Seguir'}
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};
