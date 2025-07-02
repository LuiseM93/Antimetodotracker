

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../../components/Modal.tsx';
import { Button } from '../../components/Button.tsx';
import { ActivityCategory, ActivityDetailType, Skill } from '../../types.ts';
import { ANTIMETHOD_ACTIVITIES_DETAILS, ACTIVITY_CATEGORIES_OPTIONS } from '../../constants.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { XMarkIcon } from '../../components/icons/XMarkIcon.tsx';
import { SearchIcon } from '../../components/icons/SearchIcon.tsx';
import { StarIcon } from '../../components/icons/StarIcon.tsx';
import { TrashIcon } from '../../components/icons/TrashIcon.tsx';

const inputBaseStyle = "w-full p-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";
const categoryButtonBase = "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150";
const categoryButtonActive = "bg-[var(--color-accent)] text-white border-[var(--color-accent)]";
const categoryButtonInactive = "bg-transparent text-[var(--color-text-light)] border-[var(--color-input-border)] hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-[var(--color-secondary)]";


interface SelectActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivitySelected: (activity: ActivityDetailType) => void;
}

export const SelectActivityModal: React.FC<SelectActivityModalProps> = ({ isOpen, onClose, onActivitySelected }) => {
  const { activityLogs, userProfile, toggleFavoriteActivity, getCombinedActivities, deleteCustomActivity } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ActivityCategory | 'All'>('All');
  const [customActivityName, setCustomActivityName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const allActivities = useMemo(() => getCombinedActivities(), [getCombinedActivities]);

  useEffect(() => { 
    if (isOpen) {
        setSearchTerm('');
        setSelectedCategoryFilter('All');
        setCustomActivityName('');
        setShowCustomInput(false);
    }
  }, [isOpen]);

  const favoriteActivityNames = useMemo(() => userProfile?.favoriteActivities || [], [userProfile?.favoriteActivities]);

  const recentActivitiesDetails = useMemo(() => {
    if (!isOpen) return [];
    const recentSubActivityNames = [...new Set(activityLogs.slice(0, 10).map(log => log.sub_activity))];
    return recentSubActivityNames
      .map(name => allActivities.find(detail => detail.name === name))
      .filter(Boolean) as ActivityDetailType[];
  }, [activityLogs, isOpen, allActivities]);

  const customActivityDetails = useMemo(() => {
      if (!isOpen || !userProfile?.customActivities) return [];
      let custom = userProfile.customActivities;
      if (selectedCategoryFilter !== 'All') {
          custom = custom.filter(act => act.category === selectedCategoryFilter);
      }
      if (searchTerm) {
          custom = custom.filter(act =>
              act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              act.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }
      return custom;
  }, [isOpen, userProfile?.customActivities, searchTerm, selectedCategoryFilter]);

  const favoriteActivityDetails = useMemo(() => {
    if (!isOpen) return [];
    let favorites = allActivities.filter(detail =>
        favoriteActivityNames.includes(detail.name)
    );
    if (selectedCategoryFilter !== 'All') {
        favorites = favorites.filter(act => act.category === selectedCategoryFilter);
    }
    if (searchTerm) {
        favorites = favorites.filter(act =>
            act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return favorites;
  }, [isOpen, favoriteActivityNames, searchTerm, selectedCategoryFilter, allActivities]);


  const filteredActivities = useMemo(() => {
    let activities = ANTIMETHOD_ACTIVITIES_DETAILS;
    if (selectedCategoryFilter !== 'All') {
      activities = activities.filter(act => act.category === selectedCategoryFilter);
    }
    if (searchTerm) {
      activities = activities.filter(act => 
        act.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        act.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return activities;
  }, [searchTerm, selectedCategoryFilter]);

  const groupedAndFilteredActivities = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      const category = activity.category || ActivityCategory.ACTIVE_IMMERSION; 
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(activity);
      return acc;
    }, {} as Record<ActivityCategory, ActivityDetailType[]>);
  }, [filteredActivities]);

  const handleSelectActivity = (activity: ActivityDetailType) => {
    onActivitySelected(activity);
  };
  
  const handleSelectCustomActivity = () => {
    if (customActivityName.trim() === '') {
        alert("Por favor, ingresa un nombre para tu actividad personalizada.");
        return;
    }
    onActivitySelected({
        name: customActivityName.trim(),
        description: "Actividad personalizada registrada por el usuario.",
        category: ActivityCategory.ACTIVE_IMMERSION, 
        skill: Skill.STUDY 
    });
  };

  const handleToggleFavorite = (activityName: string) => {
    toggleFavoriteActivity(activityName);
  };
  
  const handleDeleteCustomActivity = (activityName: string) => {
      if (window.confirm(`¿Estás seguro de que quieres eliminar la actividad personalizada "${activityName}"?`)) {
          deleteCustomActivity(activityName);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--color-app-bg)] z-50 flex flex-col p-0">
      <header className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)] sticky top-0 bg-[var(--color-app-bg)] z-10">
        <h2 className="text-xl font-poppins font-semibold text-[var(--color-primary)]">Seleccionar Actividad</h2>
        <Button variant="ghost" onClick={onClose} className="p-2 -mr-2">
          <XMarkIcon className="w-6 h-6 text-[var(--color-text-light)]" />
        </Button>
      </header>

      <div className="p-4 space-y-4 sticky top-[73px] bg-[var(--color-app-bg)] z-10 border-b border-[var(--color-border-light)] mb-1">
        <div className="relative">
            <input 
                type="text"
                placeholder="Buscar actividad..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={inputBaseStyle}
            />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-[var(--color-text-light)]">Filtrar por categoría:</span>
          <button 
            onClick={() => setSelectedCategoryFilter('All')}
            className={`${categoryButtonBase} ${selectedCategoryFilter === 'All' ? categoryButtonActive : categoryButtonInactive}`}
          >
            Todas
          </button>
          {ACTIVITY_CATEGORIES_OPTIONS.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`${categoryButtonBase} ${selectedCategoryFilter === cat ? categoryButtonActive : categoryButtonInactive}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-5">
        {favoriteActivityDetails.length > 0 && (
            <section>
                 <h3 className="text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-2 flex items-center">
                    <StarIcon filled className="w-5 h-5 mr-2 text-yellow-500" /> Mis Favoritas
                </h3>
                <div className="space-y-2">
                {favoriteActivityDetails.map(activity => (
                    <ActivityItem 
                        key={`fav-${activity.name}`} 
                        activity={activity} 
                        onSelect={handleSelectActivity}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite} 
                    />
                ))}
                </div>
            </section>
        )}

        {customActivityDetails.length > 0 && (
            <section>
                <h3 className="text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-2 flex items-center">
                    Mis Actividades Personalizadas
                </h3>
                <div className="space-y-2">
                    {customActivityDetails.map(activity => (
                        <ActivityItem 
                            key={`custom-${activity.name}`}
                            activity={activity}
                            onSelect={handleSelectActivity}
                            isFavorite={favoriteActivityNames.includes(activity.name)}
                            onToggleFavorite={handleToggleFavorite}
                            isCustom={true}
                            onDeleteCustom={handleDeleteCustomActivity}
                        />
                    ))}
                </div>
            </section>
        )}

        {searchTerm === '' && selectedCategoryFilter === 'All' && recentActivitiesDetails.length > 0 && (
          <section>
            <h3 className="text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-2">Actividades Recientes</h3>
            <div className="space-y-2">
              {recentActivitiesDetails.map(activity => (
                <ActivityItem 
                    key={`recent-${activity.name}`} 
                    activity={activity} 
                    onSelect={handleSelectActivity}
                    isFavorite={favoriteActivityNames.includes(activity.name)}
                    onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-2">
            {searchTerm !== '' || selectedCategoryFilter !== 'All' ? 'Resultados' : 'Todas las Actividades'}
          </h3>
          {Object.entries(groupedAndFilteredActivities).length > 0 ? (
            Object.entries(groupedAndFilteredActivities).map(([category, activities]) => (
              <div key={category} className="mb-4">
                <h4 className="text-md font-poppins font-medium text-[var(--color-primary)] mb-1.5 opacity-80">{category}</h4>
                <div className="space-y-2">
                  {activities.map(activity => (
                    <ActivityItem 
                        key={activity.name} 
                        activity={activity} 
                        onSelect={handleSelectActivity}
                        isFavorite={favoriteActivityNames.includes(activity.name)}
                        onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-light)] italic text-center py-4">No se encontraron actividades con los filtros actuales.</p>
          )}
        </section>
        
        <section className="pt-4 border-t border-[var(--color-border-light)]">
            <h3 className="text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-2">¿No encuentras tu actividad?</h3>
            {!showCustomInput && (
                 <Button variant="outline" onClick={() => setShowCustomInput(true)} className="w-full">
                    Añadir Actividad Personalizada
                </Button>
            )}
            {showCustomInput && (
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-[var(--color-light-purple)]">
                    <input
                        type="text"
                        placeholder="Nombre de tu actividad personalizada"
                        value={customActivityName}
                        onChange={e => setCustomActivityName(e.target.value)}
                        className={inputBaseStyle}
                    />
                    <div className="flex gap-2">
                        <Button variant="primary" onClick={handleSelectCustomActivity} className="flex-1">Guardar Personalizada</Button>
                        <Button variant="ghost" onClick={() => setShowCustomInput(false)} className="flex-1">Cancelar</Button>
                    </div>
                </div>
            )}
        </section>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  activity: ActivityDetailType;
  onSelect: (activity: ActivityDetailType) => void;
  isFavorite: boolean;
  onToggleFavorite: (activityName: string) => void;
  isCustom?: boolean;
  onDeleteCustom?: (activityName: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onSelect, isFavorite, onToggleFavorite, isCustom = false, onDeleteCustom }) => (
  <div className="flex items-center gap-2">
    <button 
      onClick={() => onSelect(activity)} 
      className="flex-grow text-left p-3 bg-[var(--color-card-bg)] rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border border-[var(--color-border-light)]"
      aria-label={`Seleccionar ${activity.name}`}
    >
      <p className="font-medium text-[var(--color-text-main)]">{activity.name}</p>
      <p className="text-xs text-[var(--color-text-light)] mt-0.5">{activity.description}</p>
      {activity.category && <span className="mt-1 inline-block px-1.5 py-0.5 text-xxs font-medium bg-purple-100 text-purple-700 rounded-full">{activity.category}</span>}
    </button>
    <Button 
        variant="ghost" 
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(activity.name); }}
        className={`p-2 rounded-full ${isFavorite ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}
        aria-label={isFavorite ? `Quitar ${activity.name} de favoritos` : `Añadir ${activity.name} a favoritos`}
    >
        <StarIcon filled={isFavorite} className="w-6 h-6"/>
    </Button>
    {isCustom && onDeleteCustom && (
        <Button
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDeleteCustom(activity.name); }}
            className="p-2 rounded-full text-red-500 hover:bg-red-100"
            aria-label={`Eliminar ${activity.name}`}
        >
            <TrashIcon className="w-5 h-5"/>
        </Button>
    )}
  </div>
);

const SearchIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);