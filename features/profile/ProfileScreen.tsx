
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.ts';
import { UserProfile, AntimethodStage, AppView, AppTheme, DetailedActivityStats, Language, ActivityCategory } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon.tsx';
import { STAGE_DETAILS, ALL_REWARD_DEFINITIONS } from '../../constants.ts';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon.tsx';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon.tsx';
import { FollowListModal } from '../../components/profile/FollowListModal.tsx';
import { ActivityHistory } from './ActivityHistory.tsx';
import { Database } from '../../services/database.types.ts';
import { ExternalLinkIcon } from '../../components/icons/ExternalLinkIcon.tsx';
import { ChatBubbleLeftRightIcon } from '../../components/icons/ChatBubbleLeftRightIcon.tsx';
import { InstagramIcon } from '../../components/icons/InstagramIcon.tsx';
import { LinkIcon } from '../../components/icons/LinkIcon.tsx';

interface PublicProfileData {
    id: string;
    username: string;
    display_name: string;
    current_stage: AntimethodStage;
    avatar_url: string | null;
    theme: AppTheme | null;
    focus_points: number;
    profile_flair_id: string | null;
    learning_languages: Language[];
    learning_days_count: number; // Still present in Supabase, but we'll calculate from logs
    learning_days_by_language: Record<Language, number>; // NEW: From AppContext
    about_me: string | null;
    social_links: any | null;
    // We need custom activities to resolve names for detailed stats
    custom_activities: any | null; 
}

type ModalView = 'followers' | 'following' | null;

export const ProfileScreen: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { session, appTheme: loggedInUserTheme, getProfileFollowCounts, getDetailedActivityStats, getLearningDaysByLanguage } = useAppContext(); 

    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [modalView, setModalView] = useState<ModalView>(null);
    const [detailedStats, setDetailedStats] = useState<DetailedActivityStats | null>(null);
    const [learningDaysByLanguage, setLearningDaysByLanguage] = useState<Record<Language, number>>({});


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
                .select('id, username, display_name, current_stage, avatar_url, theme, focus_points, profile_flair_id, learning_languages, learning_days_count, about_me, social_links, custom_activities')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
              setProfile(null);
              throw new Error("Perfil no encontrado.");
            }
            
            // Fetch learning days by language from AppContext
            const daysByLang = await getLearningDaysByLanguage(profileData.id);
            setLearningDaysByLanguage(daysByLang);

            setProfile({ ...profileData, learning_days_by_language: daysByLang } as PublicProfileData);

            const counts = await getProfileFollowCounts(profileData.id);
            setFollowerCount(counts.followers);
            setFollowingCount(counts.following);

            // Pass custom activities from the fetched profile to the stats function
            const stats = await getDetailedActivityStats(profileData.id);
            setDetailedStats(stats);

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
    }, [username, session, getProfileFollowCounts, getDetailedActivityStats, getLearningDaysByLanguage]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    
    useEffect(() => {
        const originalTheme = document.documentElement.className;
        if (profile?.theme) {
            document.documentElement.className = profile.theme;
        }
        return () => {
            document.documentElement.className = originalTheme;
        };
    }, [profile]);

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
                                <p className="text-sm text-[var(--color-text-light)]">Días Adquiriendo</p>
                                {Object.keys(learningDaysByLanguage).length > 0 ? (
                                    <ul className="text-sm font-bold text-[var(--color-primary)]">
                                        {Object.entries(learningDaysByLanguage).map(([lang, days]) => (
                                            <li key={lang}>{lang}: {days} días</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-[var(--color-text-light)]">0 días</p>
                                )}
                            </div>
                            <div className="p-3">
                                <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto text-[var(--color-secondary)] mb-1" />
                                <p className="text-xl font-bold text-[var(--color-primary)]">Idiomas</p>
                                <p className="text-sm text-[var(--color-text-light)]">
                                    {profile.learning_languages && profile.learning_languages.length > 0
                                        ? profile.learning_languages.join(', ')
                                        : 'Ninguno'}
                                </p>
                            </div>
                        </div>
                         {stageDetails && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                              <BookOpenIcon className="w-8 h-8 mx-auto text-[var(--color-secondary)] mb-1" />
                              <p className="text-lg font-bold text-[var(--color-primary)]">{stageDetails.name}</p>
                              <p className="text-sm text-[var(--color-text-light)]">Etapa Actual</p>
                          </div>}
                    </Card>

                    {profile.about_me && (
                        <Card title="Acerca de Mí" className="shadow-xl mt-8">
                            <p className="text-[var(--color-text-main)] whitespace-pre-wrap">{profile.about_me}</p>
                        </Card>
                    )}

                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                        <Card title="Enlaces Sociales" className="shadow-xl mt-8">
                            <div className="flex flex-wrap justify-center gap-4">
                                {profile.social_links.twitter && (
                                    <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors flex items-center space-x-2">
                                        <ExternalLinkIcon className="w-6 h-6" />
                                        <span>Twitter</span>
                                    </a>
                                )}
                                {profile.social_links.youtube && (
                                    <a href={profile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors flex items-center space-x-2">
                                        <ExternalLinkIcon className="w-6 h-6" />
                                        <span>YouTube</span>
                                    </a>
                                )}
                                {profile.social_links.instagram && (
                                    <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors flex items-center space-x-2">
                                        <InstagramIcon className="w-6 h-6" />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {profile.social_links.website && (
                                    <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors flex items-center space-x-2">
                                        <LinkIcon className="w-6 h-6" />
                                        <span>Sitio Web</span>
                                    </a>
                                )}
                            </div>
                        </Card>
                    )}

                    {detailedStats && (
                        <Card title="Estadísticas Detalladas" className="shadow-xl mt-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Horas por Idioma:</h3>
                                    {Object.keys(detailedStats.totalHoursByLanguage).length > 0 ? (
                                        <ul className="list-disc list-inside text-[var(--color-text-main)] pl-4">
                                            {Object.entries(detailedStats.totalHoursByLanguage).map(([lang, hours]) => {
                                                const totalHours = Object.values(detailedStats.totalHoursByLanguage).reduce((sum, h) => sum + h, 0);
                                                const percentage = totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
                                                return (
                                                    <li key={lang}>{lang as Language}: {hours} horas ({percentage}%)</li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No hay datos de horas por idioma.</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Horas por Categoría:</h3>
                                    {Object.keys(detailedStats.totalHoursByCategory).length > 0 ? (
                                        <ul className="list-disc list-inside text-[var(--color-text-main)] pl-4">
                                            {Object.entries(detailedStats.totalHoursByCategory).map(([cat, hours]) => {
                                                const totalHours = Object.values(detailedStats.totalHoursByCategory).reduce((sum, h) => sum + h, 0);
                                                const percentage = totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
                                                return (
                                                    <li key={cat}>{cat as ActivityCategory}: {hours} horas ({percentage}%)</li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No hay datos de horas por categoría.</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Principales Sub-Actividades:</h3>
                                    <ul className="list-disc list-inside text-[var(--color-text-main)] pl-4">
                                        {detailedStats.topSubActivities.map((activity, index) => (
                                            <li key={activity.name || index}>{activity.name}: {activity.hours} horas</li>
                                        ))}
                                        {detailedStats.topSubActivities.length === 0 && <li className="text-gray-500">No hay datos de sub-actividades.</li>}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Activity History Section */}
                    <div className="mt-8">
                        <ActivityHistory userId={profile.id} />
                    </div>

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