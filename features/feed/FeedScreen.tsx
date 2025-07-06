import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { FeedItem } from '../../types.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { FeedItemCard } from './FeedItemCard.tsx';
import { NewspaperIcon } from '../../components/icons/NewspaperIcon.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';

const FeedScreen: React.FC = () => {
    const { user } = useAppContext();
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('feed'); // State for active tab

    useEffect(() => {
        const fetchFeed = async () => {
            if (!user) {
                setError("Debes iniciar sesión para ver el feed.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            
            const { data, error: rpcError } = await supabase.rpc('get_feed_with_likes', {
                requesting_user_id: user.id
            });

            if (rpcError) {
                console.error("Error fetching feed with likes:", rpcError);
                setError("No se pudo cargar el feed de actividad.");
                setFeedItems([]);
            } else {
                setFeedItems((data || []) as FeedItem[]);
            }
            setLoading(false);
        };

        fetchFeed();
    }, [user]);

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
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner text="Cargando feed..." />
                </div>
              ) : error ? (
                <p className="text-center text-red-500 py-20">{error}</p>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="font-semibold">¡El feed de actividad está tranquilo por ahora!</p>
                  <p className="text-sm mt-2">Registra actividades para que tus logros aparezcan aquí.</p>
                </div>
              ) : (
                feedItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-start space-x-4">
                      <img alt="Avatar" className="h-12 w-12 rounded-full" src={item.user_avatar_url || 'https://via.placeholder.com/150'}/>
                      <div className="flex-1">
                        <p><span className="font-semibold">{item.user_display_name}</span> {item.content.message}</p>
                        <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                            <span className="material-icons">favorite_border</span>
                            <span className="text-sm">{item.likes} Me gusta</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600">
                            <span className="material-icons">comment</span>
                            <span className="text-sm">{item.comments} Comentarios</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'leaderboard' && (
            <div>
              {/* Leaderboard content goes here */}
              <p>Leaderboard Content</p>
            </div>
          )}
          {activeTab === 'profile' && (
            <div>
              {/* Profile content goes here */}
              <p>Profile Content</p>
            </div>
          )}
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

export default FeedScreen;