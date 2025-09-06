import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { FeedItem, FeedItemType } from '../../types.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { FeedItemCard } from './FeedItemCard.tsx';
import { NewspaperIcon } from '../../components/icons/NewspaperIcon.tsx';
import { SearchIcon } from '../../components/icons/SearchIcon.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';

const inputBaseStyle = "w-full p-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const FeedScreen: React.FC = () => {
    const { user } = useAppContext();
    const [allFeedItems, setAllFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'activities' | 'achievements'>('all');

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
                setAllFeedItems([]);
            } else {
                setAllFeedItems((data || []) as FeedItem[]);
            }
            setLoading(false);
        };

        fetchFeed();
    }, [user]);

    const handleDeleteItem = (itemId: string) => {
        setAllFeedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const filteredFeedItems = useMemo(() => {
        let items = allFeedItems;

        if (activeFilter === 'activities') {
            items = items.filter(item => item.type === 'activity_logged');
        } else if (activeFilter === 'achievements') {
            items = items.filter(item => item.type === 'milestone_achieved' || item.type === 'reward_unlocked');
        }

        if (!searchTerm) {
            return items;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return items.filter(item => {
            if (item.profiles?.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.profiles?.display_name?.toLowerCase().includes(lowerCaseSearchTerm)) {
                return true;
            }
            if (item.type === 'activity_logged' && item.content) {
                const activityContent = item.content as { custom_title?: string, sub_activity?: string, language?: string };
                if (activityContent.custom_title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                    activityContent.sub_activity?.toLowerCase().includes(lowerCaseSearchTerm) ||
                    activityContent.language?.toLowerCase().includes(lowerCaseSearchTerm)) {
                    return true;
                }
            }
            if (item.type === 'milestone_achieved' && item.content) {
                const milestoneContent = item.content as { language?: string };
                if (milestoneContent.language?.toLowerCase().includes(lowerCaseSearchTerm)) {
                    return true;
                }
            }
            if (item.type === 'reward_unlocked' && item.content) {
                const rewardContent = item.content as { reward_name?: string };
                if (rewardContent.reward_name?.toLowerCase().includes(lowerCaseSearchTerm)) {
                    return true;
                }
            }
            return false;
        });
    }, [allFeedItems, searchTerm, activeFilter]);

    const FilterButton: React.FC<{ filterType: 'all' | 'activities' | 'achievements'; label: string; }> = ({ filterType, label }) => (
        <button
            onClick={() => setActiveFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeFilter === filterType
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-card-bg)] text-[var(--color-text-main)] hover:bg-[var(--color-card-bg-hover)]'
            }`}>
            {label}
        </button>
    );

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
                <div className="relative mb-4">
                    <input 
                        id="search-feed"
                        type="text"
                        placeholder="Buscar en el feed..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`${inputBaseStyle} pl-10`}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-placeholder-text)]" />
                </div>

                <div className="flex justify-center space-x-2 mb-6">
                    <FilterButton filterType="all" label="Todo" />
                    <FilterButton filterType="activities" label="Actividades" />
                    <FilterButton filterType="achievements" label="Logros" />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner text="Cargando feed..." />
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500 py-20">{error}</p>
                ) : filteredFeedItems.length === 0 ? (
                    <div className="text-center py-20 text-[var(--color-text-light)]">
                        <p className="font-semibold">No se encontraron resultados.</p>
                        <p className="text-sm mt-2">Intenta con otra búsqueda o filtro, o registra actividades para que tus logros aparezcan aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeedItems.map(item => (
                            <FeedItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};