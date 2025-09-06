
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedItem, FeedItemType } from '../../types';
import { Card } from '../../components/Card';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { GiftIcon } from '../../components/icons/GiftIcon';
import { HeartIcon } from '../../components/icons/HeartIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { formatDurationFromSeconds } from '../../utils/timeUtils';
import { formatDistanceToNow } from '../../utils/dateUtils'; 
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import { Database } from '../../services/database.types';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';

const renderMessage = (item: FeedItem) => {
    const userName = (
        <Link to={`/profile/${item.profiles?.username}`} className="font-bold text-[var(--color-primary)] hover:underline">
            {item.profiles?.display_name || 'Alguien'}
        </Link>
    );

    switch(item.type) {
        case 'milestone_achieved':
            return (
                <p>
                    {userName} ha alcanzado un nuevo hito: ¡<strong className="text-[var(--color-accent)]">{item.content.hours} horas</strong> de inmersión en <strong className="text-[var(--color-accent)]">{item.content.language}</strong>!
                </p>
            );
        case 'reward_unlocked':
            return (
                 <p>
                    {userName} ha desbloqueado una nueva recompensa: <strong className="text-[var(--color-accent)]">{item.content.reward_name}</strong>.
                </p>
            );
        case 'activity_logged':
            const { custom_title, sub_activity, duration_seconds, language } = item.content;
            return (
                <div>
                    <p>
                        {userName} ha registrado una nueva actividad en <strong className="text-[var(--color-accent)]">{language}</strong>.
                    </p>
                    <div className="mt-2 p-3 bg-[var(--color-app-bg)] rounded-lg border border-[var(--color-border-light)]">
                        <p className="font-semibold text-md text-[var(--color-primary)]">{custom_title || sub_activity}</p>
                        {custom_title && <p className="text-sm text-[var(--color-text-light)]">{sub_activity}</p>}
                        <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)] mt-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatDurationFromSeconds(duration_seconds, 'hhmmss')}</span>
                        </div>
                    </div>
                </div>
            );
        default:
            return <p>{userName} ha completado una nueva actividad.</p>;
    }
};

const getIconForType = (type: FeedItemType) => {
    switch(type) {
        case 'milestone_achieved':
            return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
        case 'reward_unlocked':
            return <GiftIcon className="w-6 h-6 text-pink-500" />;
        default:
            return null;
    }
};

export const FeedItemCard: React.FC<{ item: FeedItem, onDelete: (itemId: string) => void }> = ({ item, onDelete }) => {
    const { user } = useAppContext();
    const [likeCount, setLikeCount] = useState(item.like_count);
    const [hasLiked, setHasLiked] = useState(item.user_has_liked);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = user?.id === item.user_id;

    const handleLikeToggle = async () => {
        if (!user || isLikeLoading) return;
        setIsLikeLoading(true);

        const originallyLiked = hasLiked;
        
        // Optimistic UI update
        setHasLiked(!originallyLiked);
        setLikeCount(c => originallyLiked ? c - 1 : c + 1);

        if (originallyLiked) {
            // Un-like
            const { error } = await supabase
                .from('feed_item_likes')
                .delete()
                .match({ feed_item_id: item.id, user_id: user.id });

            if (error) {
                // Revert on error
                setHasLiked(true);
                setLikeCount(c => c + 1);
                console.error("Error unliking post:", error);
            }
        } else {
            // Like
            const payload: Database['public']['Tables']['feed_item_likes']['Insert'] = {
                feed_item_id: item.id,
                user_id: user.id
            };
            const { error } = await supabase
                .from('feed_item_likes')
                .insert(payload);
            
            if (error) {
                // Revert on error
                setHasLiked(false);
                setLikeCount(c => c - 1);
                console.error("Error liking post:", error);
            }
        }

        setIsLikeLoading(false);
    };

    const handleDelete = async () => {
        if (!isOwner || isDeleting) return;

        const confirmation = window.confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.");
        if (!confirmation) return;

        setIsDeleting(true);
        try {
            // Primero, eliminar los likes asociados para evitar problemas de foreign key.
            await supabase.from('feed_item_likes').delete().match({ feed_item_id: item.id });

            // Luego, eliminar la publicación principal.
            const { data, error } = await supabase
                .from('feed_items')
                .delete()
                .match({ id: item.id })
                .select(); // Needed to get the deleted rows back

            if (error) {
                throw error;
            }

            // If data is empty, it means RLS prevented the deletion.
            if (!data || data.length === 0) {
                throw new Error("La política de seguridad de la base de datos (RLS) no permitió el borrado.");
            }

            onDelete(item.id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
            console.error("Error deleting feed item:", error);
            alert(`No se pudo eliminar la publicación: ${errorMessage}`);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!item.profiles) {
        return (
            <Card className="opacity-50">
                <p className="text-sm text-[var(--color-text-light)]">Entrada de feed inválida.</p>
            </Card>
        );
    }
    
    return (
        <Card className="p-0">
            <div className="flex items-start gap-4 p-4">
                <div className="flex-shrink-0">
                    <Link to={`/profile/${item.profiles.username}`}>
                        {item.profiles.avatar_url ? (
                            <img src={item.profiles.avatar_url} alt={item.profiles.display_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-12 h-12 text-[var(--color-secondary)]" />
                        )}
                    </Link>
                </div>
                <div className="flex-grow text-sm text-[var(--color-text-main)]">
                    {renderMessage(item)}
                    <p className="text-xs text-[var(--color-text-light)] mt-2">
                        {formatDistanceToNow(new Date(item.created_at))}
                    </p>
                </div>
                 <div className="flex-shrink-0">
                    {getIconForType(item.type)}
                </div>
            </div>
             <div className="border-t border-[var(--color-border-light)] px-4 py-2 flex justify-between items-center">
                <button 
                    onClick={handleLikeToggle}
                    disabled={!user || isLikeLoading}
                    className="flex items-center space-x-2 text-sm text-[var(--color-text-light)] hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                    <HeartIcon className={`w-5 h-5 ${hasLiked ? 'text-red-500' : 'text-gray-400'}`} filled={hasLiked}/>
                    <span className="font-medium">{likeCount} {likeCount === 1 ? 'Ánimo' : 'Ánimos'}</span>
                </button>
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-sm text-[var(--color-text-light)] hover:text-red-500 disabled:opacity-50 transition-colors p-1"
                        aria-label="Eliminar publicación"
                    >
                        {isDeleting ? (
                            <LoadingSpinner size="w-4 h-4" />
                        ) : (
                            <TrashIcon className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
        </Card>
    );
};
