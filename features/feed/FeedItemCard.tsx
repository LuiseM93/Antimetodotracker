
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedItem, FeedItemType } from '../../types';
import { Card } from '../../components/Card';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { GiftIcon } from '../../components/icons/GiftIcon';
import { HeartIcon } from '../../components/icons/HeartIcon.tsx';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon.tsx';
import { formatDistanceToNow } from '../../utils/dateUtils'; 
import { formatDurationFromSeconds } from '../../utils/timeUtils'; // New import
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import { Database } from '../../services/database.types';

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
        case 'activity_logged': // Assuming a new type for regular activity logs
            const duration = item.content.duration_seconds ? formatDurationFromSeconds(item.content.duration_seconds, 'long') : '';
            const activityName = item.content.custom_title || item.content.sub_activity || 'una actividad';
            return (
                <p>
                    {userName} ha registrado <strong className="text-[var(--color-accent)]">{duration}</strong> de <strong className="text-[var(--color-accent)]">{activityName}</strong> en <strong className="text-[var(--color-accent)]">{item.content.language}</strong>.
                </p>
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
        case 'activity_logged':
            return <ChartBarIcon className="w-6 h-6 text-blue-500" />;
        default:
            return null;
    }
};

export const FeedItemCard: React.FC<{ item: FeedItem }> = ({ item }) => {
    const { user } = useAppContext();
    const [likeCount, setLikeCount] = useState(item.like_count);
    const [hasLiked, setHasLiked] = useState(item.user_has_liked);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

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
             <div className="border-t border-[var(--color-border-light)] px-4 py-2">
                <button 
                    onClick={handleLikeToggle}
                    disabled={!user || isLikeLoading}
                    className="flex items-center space-x-2 text-sm text-[var(--color-text-light)] hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                    <HeartIcon className={`w-5 h-5 ${hasLiked ? 'text-red-500' : 'text-gray-400'}`} filled={hasLiked}/>
                    <span className="font-medium">{likeCount} {likeCount === 1 ? 'Ánimo' : 'Ánimos'}</span>
                </button>
            </div>
        </Card>
    );
};
