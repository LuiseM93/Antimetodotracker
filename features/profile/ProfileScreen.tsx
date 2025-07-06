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

const ProfileScreen: React.FC = () => {
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
    const [activeTab, setActiveTab] = useState('profile'); // State for active tab

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
              <a 
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feed' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('feed')}
                href="#"
              >
                Feed
              </a>
              <a 
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaderboard' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('leaderboard')}
                href="#"
              >
                Clasificación
              </a>
              <a 
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('profile')}
                href="#"
              >
                Mi Perfil
              </a>
            </nav>
          </div>
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center space-x-4">
                <img alt="Avatar de Alex" className="h-20 w-20 rounded-full" src={profile.avatar_url || 'https://via.placeholder.com/150'}/>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{profile.display_name} {isOwnProfile && '(Tú)'}</h2>
                    <button className="text-gray-500 hover:text-gray-700">
                      <span className="material-icons">edit</span>
                    </button>
                  </div>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-purple-600">{profile.focus_points}</p>
                  <p className="text-sm text-gray-500">Puntos de Enfoque</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{profile.learning_days_count}</p>
                  <p className="text-sm text-gray-500">Días Adquiriendo</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{profile.learning_languages?.length}</p>
                  <p className="text-sm text-gray-500">Idiomas Activos</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Feed content goes here */}
              <p>Feed Content</p>
            </div>
          )}
          {activeTab === 'leaderboard' && (
            <div>
              {/* Leaderboard content goes here */}
              <p>Leaderboard Content</p>
            </div>
          )}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mi Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <span className="material-icons">task_alt</span>
                </div>
                <div>
                  <p className="font-semibold">Completaste una lección de Francés</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4">
                <div className="bg-orange-100 p-2 rounded-full">
                  <span className="material-icons">local_fire_department</span>
                </div>
                <div>
                  <p className="font-semibold">¡Racha de 50 días!</p>
                  <p className="text-sm text-gray-500">Ayer</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <span className="material-icons">mic</span>
                </div>
                <div>
                  <p className="font-semibold">Practicaste pronunciación en Alemán</p>
                  <p className="text-sm text-gray-500">Hace 3 días</p>
                </div>
              </div>
            </div>
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

export default ProfileScreen;