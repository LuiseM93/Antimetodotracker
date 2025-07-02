
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FeedItem } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { FeedItemCard } from './FeedItemCard';
import { NewspaperIcon } from '../../components/icons/NewspaperIcon';
import { useAppContext } from '../../contexts/AppContext';

export const FeedScreen: React.FC = () => {
    const { user } = useAppContext();
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex items-center space-x-3">
                <NewspaperIcon className="w-10 h-10 text-[var(--color-accent)]" />
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-[var(--color-primary)]">
                        Feed de Actividad
                    </h1>
                    <p className="text-md text-[var(--color-text-light)]">
                        Entérate de los últimos logros de la comunidad.
                    </p>
                </div>
            </header>

            <div className="max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner text="Cargando feed..." />
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500 py-20">{error}</p>
                ) : feedItems.length === 0 ? (
                    <div className="text-center py-20 text-[var(--color-text-light)]">
                        <p className="font-semibold">¡El feed de actividad está tranquilo por ahora!</p>
                        <p className="text-sm mt-2">Registra actividades para que tus logros aparezcan aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedItems.map(item => (
                            <FeedItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
