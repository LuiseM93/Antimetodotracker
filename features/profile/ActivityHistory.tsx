
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ActivityLogEntry } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card } from '../../components/Card';
import { formatDurationFromSeconds } from '../../utils/timeUtils';

interface ActivityHistoryProps {
    userId: string;
}

const formatDisplayDate = (isoDateString: string): string => {
    if (!isoDateString) return '';
    const [year, month, day] = isoDateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};


export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
    const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ACTIVITIES_PER_PAGE = 20;

    const fetchActivities = async (currentPage: number) => {
        if (!userId) return;

        if (currentPage === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const from = currentPage * ACTIVITIES_PER_PAGE;
            const to = from + ACTIVITIES_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                throw error;
            }

            setActivities(prev => currentPage === 0 ? data : [...prev, ...data]);
            setHasMore(data.length === ACTIVITIES_PER_PAGE);

        } catch (err: any) {
            setError("No se pudo cargar el historial de actividades.");
            console.error("Error fetching activity history:", err.message);
        } finally {
            if (currentPage === 0) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        fetchActivities(0);
    }, [userId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(nextPage);
    };

    return (
        <Card title="Actividad Reciente">
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <LoadingSpinner text="Cargando actividades..." />
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-8">{error}</p>
            ) : activities.length === 0 ? (
                <p className="text-center text-[var(--color-text-light)] py-8">
                    Este usuario aún no tiene actividad registrada.
                </p>
            ) : (
                <>
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {activities.map(log => (
                            <li key={log.id} className="p-3 bg-[var(--color-card-bg)] rounded-md border border-[var(--color-border-light)] flex justify-between items-center">
                                <div>
                                    {log.custom_title ? (
                                        <>
                                            <span className="font-semibold text-md text-[var(--color-primary)]">{log.custom_title}</span>
                                            <p className="text-sm text-[var(--color-secondary)]">{log.sub_activity}</p>
                                        </>
                                    ) : (
                                        <span className="font-semibold text-md text-[var(--color-primary)]">{log.sub_activity}</span>
                                    )}
                                    <p className="text-sm text-[var(--color-text-light)] mt-1">
                                        {formatDisplayDate(log.date)} [{log.language}]
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-lg text-[var(--color-accent)]">{formatDurationFromSeconds(log.duration_seconds, 'hhmmss')}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {hasMore && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? 'Cargando...' : 'Cargar más'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};
