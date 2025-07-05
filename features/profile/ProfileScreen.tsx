

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.ts';
import { AntimethodStage, AppView, AppTheme } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon.tsx';
import { STAGE_DETAILS, ALL_REWARD_DEFINITIONS } from '../../constants.ts';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon.tsx';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon.tsx';
import { FollowListModal } from '../../components/profile/FollowListModal.tsx';
import { Database } from '../../services/database.types.ts';

interface PublicProfileData {
    id: string;
    username: string;
    display_name: string;
    current_stage: AntimethodStage;
    avatar_url: string | null;
    theme: AppTheme | null;
    focus_points: number;
    profile_flair_id: string | null;
    learning_languages: string[];
    learning_days_count: number;
}

type ModalView = 'followers' | 'following' | null;

export const ProfileScreen: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { session, appTheme: loggedInUserTheme, getProfileFollowCounts } = useAppContext(); 

    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [modalView, setModalView] = useState<ModalView>(null);


    const fetchProfileData = useCallback(async () => {
        if (!username) {
            setError("No se ha especificado un nombre de usuario.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, display_name, current_stage, avatar_url, theme, focus_points, profile_flair_id, learning_languages, learning_days_count')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
              setProfile(null);
              throw new Error("Perfil no encontrado.");
            }
            
            setProfile(profileData as PublicProfileData);

            const counts = await getProfileFollowCounts(profileData.id);
            setFollowerCount(counts.followers);
            setFollowingCount(counts.following);

            if (session?.user) {
                const { data: followData, error: followError } = await supabase
                    .from('relationships')
                    .select('*', { count: 'exact' })
                    .eq('follower_id', session.user.id)
                    .eq('following_id', profileData.id)
                    .maybeSingle();
                
                if (followError && followError.code !== 'PGRST116') throw followError; // PGRST116 means no rows found, which is fine
                setIsFollowing(!!followData);
            }

        } catch (err: any) {
            setError("No se pudo encontrar el perfil de este usuario.");
            console.error("Error fetching profile:", err.message);
        } finally {
            setLoading(false);
        }
    }, [username, session, getProfileFollowCounts]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    
    useEffect(() => {
        if (profile?.theme) {
            document.documentElement.className = profile.theme;
        }
        return () => {
            document.documentElement.className = loggedInUserTheme;
        };
    }, [profile, loggedInUserTheme]);

    const handleFollowToggle = async () => {
      if (!session?.user || !profile || isFollowLoading) return;

      setIsFollowLoading(true);
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('relationships')
          .delete()
          .match({ follower_id: session.user.id, following_id: profile.id });
        if (!error) {
          setIsFollowing(false);
          setFollowerCount(c => c - 1);
        }
      } else {
        // Follow
        const payload: Database['public']['Tables']['relationships']['Insert'] = {
           follower_id: session.user.id, 
           following_id: profile.id 
        };
        const { error } = await supabase
          .from('relationships')
          .insert(payload);
        if (!error) {
          setIsFollowing(true);
          setFollowerCount(c => c + 1);
        }
      }
      setIsFollowLoading(false);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-app-bg)]">
                <LoadingSpinner size="lg" text="Cargando perfil..." />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-app-bg)] p-4 text-center">
                <h1 className="text-2xl font-bold text-[var(--color-error)] mb-4">{error || "Perfil no encontrado"}</h1>
                <Link to={AppView.DASHBOARD} className="text-[var(--color-accent)] hover:underline">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    const activeFlair = profile.profile_flair_id ? ALL_REWARD_DEFINITIONS.find(r => r.id === profile.profile_flair_id) : null;
    const stageDetails = profile.current_stage ? STAGE_DETAILS[profile.current_stage as AntimethodStage] : null;
    const isOwnProfile = session?.user?.id === profile.id;

    return (
        <div className="min-h-screen bg-[var(--color-app-bg)] bg-cover bg-center bg-fixed" style={{ backgroundImage: `var(--theme-background-image-url-light)` }}>
           <div className="min-h-screen backdrop-blur-sm bg-black/10">
                <div className="max-w-4xl mx-auto p-4 sm:p-8">
                    {/* Profile Header */}
                    <div className="relative text-center mb-8">
                        <div className="relative inline-block">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full mx-auto ring-4 ring-[var(--color-accent)] ring-offset-4 ring-offset-[var(--color-app-bg)] shadow-lg" />
                            ) : (
                                <UserCircleIcon className="w-32 h-32 text-[var(--color-primary)] mx-auto" />
                            )}
                        </div>
                        <h1 className="text-4xl font-poppins font-bold mt-4 text-[var(--color-primary)]">{profile.display_name}</h1>
                        <p className="text-lg text-[var(--color-text-light)]">@{profile.username}</p>
                        {activeFlair && (
                             <span className="mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-sm">
                                {activeFlair.value}
                            </span>
                        )}
                         <div className="mt-3 flex items-center justify-center space-x-2">
                            <img src="./assets/money.png" alt="Puntos de Enfoque" className="w-6 h-6" />
                            <span className={`text-lg font-medium text-[var(--color-primary)]`}>
                                {profile.focus_points || 0} Puntos de Enfoque
                            </span>
                        </div>
                        {session && !isOwnProfile && (
                            <div className="mt-4">
                                <Button 
                                    onClick={handleFollowToggle}
                                    variant={isFollowing ? 'outline' : 'primary'}
                                    isLoading={isFollowLoading}
                                >
                                    {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Stats Section */}
                    <Card title="Resumen" className="shadow-xl">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-x divide-gray-200 dark:divide-gray-700">
                             <button onClick={() => setModalView('followers')} className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                <p className="text-3xl font-bold text-[var(--color-primary)]">{followerCount}</p>
                                <p className="text-sm text-[var(--color-text-light)]">Seguidores</p>
                            </button>
                             <button onClick={() => setModalView('following')} className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                <p className="text-3xl font-bold text-[var(--color-primary)]">{followingCount}</p>
                                <p className="text-sm text-[var(--color-text-light)]">Siguiendo</p>
                            </button>
                            <div className="p-3">
                                <CalendarDaysIcon className="w-8 h-8 mx-auto text-[var(--color-secondary)] mb-1" />
                                <p className="text-xl font-bold text-[var(--color-primary)]">{profile.learning_days_count || 0}</p>
                                <p className="text-sm text-[var(--color-text-light)]">Días Adquiriendo</p>
                            </div>
                            <div className="p-3">
                                <img src="./assets/language.png" alt="Idiomas" className="w-8 h-8 mx-auto mb-1 filter dark:invert" />
                                <p className="text-xl font-bold text-[var(--color-primary)]">{profile.learning_languages?.length || 0}</p>
                                <p className="text-sm text-[var(--color-text-light)]">Idiomas Activos</p>
                                {profile.learning_languages && profile.learning_languages.length > 0 && (
                                    <p className="text-xs text-[var(--color-text-light)] mt-1">{profile.learning_languages.join(', ')}</p>
                                )}
                            </div>
                        </div>
                         {stageDetails && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                              <BookOpenIcon className="w-8 h-8 mx-auto text-[var(--color-secondary)] mb-1" />
                              <p className="text-lg font-bold text-[var(--color-primary)]">{stageDetails.name}</p>
                              <p className="text-sm text-[var(--color-text-light)]">Etapa Actual</p>
                          </div>}
                    </Card>

                    <footer className="text-center mt-12">
                        <Link to={AppView.DASHBOARD} className="text-[var(--color-accent)] hover:underline text-sm">
                            Volver al Dashboard
                        </Link>
                    </footer>
                </div>
           </div>
           {modalView && (
                <FollowListModal
                    isOpen={!!modalView}
                    onClose={() => setModalView(null)}
                    view={modalView}
                    profileId={profile.id}
                />
           )}
        </div>
    );
};