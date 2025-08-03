

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { FeedItem, FeedItemType } from '../../types.ts';
import { LoadingSpinner } from '../../components/LoadingSpinner.tsx';
import { FeedItemCard } from './FeedItemCard.tsx';
import { NewspaperIcon } from '../../components/icons/NewspaperIcon.tsx';
import { SearchIcon } from '../../components/icons/SearchIcon.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';

const inputBaseStyle = "w-full p-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";


// ... (imports)

export const FeedScreen: React.FC = () => {
    // ... (estados y useEffect)

    const handleDeleteItem = (itemId: string) => {
        setAllFeedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    // ... (filteredFeedItems y FilterButton)

    return (
        // ... (JSX del contenedor y cabecera)

            <div className="max-w-2xl mx-auto w-full">
                {/* ... (input de búsqueda y botones de filtro) */}

                {loading ? (
                    // ... (spinner de carga)
                ) : error ? (
                    // ... (mensaje de error)
                ) : filteredFeedItems.length === 0 ? (
                    // ... (mensaje de no resultados)
                ) : (
                    <div className="space-y-4">
                        {filteredFeedItems.map(item => (
                            <FeedItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
                        ))}
                    </div>
                )}
            </div>
        // ... (cierre de JSX)
    );
};