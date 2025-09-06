
import React, { useState, useEffect } from 'react';
import { DailyActivityGoal, ActivityCategory, ActivityComponent } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ACTIVITY_CATEGORIES_OPTIONS } from '../../constants.ts';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon.tsx';
import { XMarkIcon } from '../../components/icons/XMarkIcon.tsx';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";


export const RoutineBuilder: React.FC = () => {
  const { dailyTargets, addDailyTarget, updateDailyTarget, deleteDailyTarget, userProfile } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<DailyActivityGoal | null>(null);
  
  const [habitCustomName, setHabitCustomName] = useState('');
  const [habitMinMinutesTotal, setHabitMinMinutesTotal] = useState<number>(0);
  const [habitOptimalMinutesTotal, setHabitOptimalMinutesTotal] = useState<number>(60);
  const [habitComponents, setHabitComponents] = useState<ActivityComponent[]>([]);

  const [currentComponentCategory, setCurrentComponentCategory] = useState<ActivityCategory>(ACTIVITY_CATEGORIES_OPTIONS[0]);

  const resetModalForm = () => {
    setHabitCustomName('');
    setHabitMinMinutesTotal(0);
    setHabitOptimalMinutesTotal(60);
    setHabitComponents([]);
    setCurrentComponentCategory(ACTIVITY_CATEGORIES_OPTIONS[0]);
    setEditingTarget(null);
  };

  const openAddModal = () => {
    resetModalForm();
    setIsModalOpen(true);
  };

  const openEditModal = (target: DailyActivityGoal) => {
    setEditingTarget(target);
    setHabitCustomName(target.customName);
    // Convert seconds from data model to minutes for UI form
    setHabitMinMinutesTotal(Math.round(target.minSecondsTotal / 60));
    setHabitOptimalMinutesTotal(Math.round(target.optimalSecondsTotal / 60));
    setHabitComponents([...target.components]); 
    setCurrentComponentCategory(ACTIVITY_CATEGORIES_OPTIONS[0]);
    setIsModalOpen(true);
  };

  const handleAddComponentToHabit = () => {
    if (habitComponents.some(comp => comp.category === currentComponentCategory)) {
      alert("Esta categoría ya ha sido añadida a este hábito.");
      return;
    }
    setHabitComponents(prev => [...prev, { category: currentComponentCategory }]);
  };

  const handleRemoveComponentFromHabit = (index: number) => {
    setHabitComponents(prev => prev.filter((_, i) => i !== index));
  };

  const handleModalSubmit = () => {
    if (habitCustomName.trim() === '') {
      alert("Por favor, ingresa un nombre para el hábito.");
      return;
    }
    if (habitComponents.length === 0) {
      alert("Por favor, añade al menos un componente de actividad (categoría) al hábito.");
      return;
    }
    if (habitOptimalMinutesTotal < 0 || habitMinMinutesTotal < 0) {
      alert("Los minutos totales deben ser un valor positivo o cero.");
      return;
    }
    if (habitMinMinutesTotal > habitOptimalMinutesTotal && habitOptimalMinutesTotal !== 0) {
        alert("Los minutos mínimos totales no pueden ser mayores que los minutos óptimos totales (a menos que óptimos sea 0).");
        return;
    }

    const newHabitData = {
        customName: habitCustomName,
        components: habitComponents,
        // Convert minutes from UI form to seconds for data model
        minSecondsTotal: habitMinMinutesTotal * 60,
        optimalSecondsTotal: habitOptimalMinutesTotal * 60,
    };

    if (editingTarget) {
      // updateDailyTarget expects the full DailyActivityGoal object
      updateDailyTarget({ ...editingTarget, ...newHabitData });
    } else {
      // addDailyTarget expects Omit<DailyActivityGoal, 'id' | 'creationDate'>
      addDailyTarget(newHabitData);
    }
    setIsModalOpen(false);
    resetModalForm();
  };
  
  const currentLanguage = userProfile?.primaryLanguage || "tu idioma principal";
  
  const getHabitDisplayTime = (habit: DailyActivityGoal): string => {
    const minMinutes = Math.round(habit.minSecondsTotal / 60);
    const optimalMinutes = Math.round(habit.optimalSecondsTotal / 60);
    
    if (optimalMinutes > 0 && minMinutes > 0 && minMinutes < optimalMinutes) {
      return `${minMinutes}-${optimalMinutes} min totales`;
    }
    if (optimalMinutes > 0) {
      return `${optimalMinutes} min óptimos totales`;
    }
    if (minMinutes > 0) {
      return `Mín: ${minMinutes} min totales`;
    }
    return "Cualquier tiempo cuenta";
  };


  return (
    <Card title={`Mis Hábitos Diarios (${currentLanguage})`} className="mt-6">
      <p className={`mb-4 text-[var(--color-text-light)]`}>
        Define tus hábitos diarios para {currentLanguage}. Un hábito tiene una meta de tiempo total (mínima y óptima) y se compone de diferentes categorías de actividad que cuentan para esa meta.
      </p>
      <Button onClick={openAddModal} variant="secondary" leftIcon={<PlusCircleIcon />} className="mb-4">
        Añadir Nuevo Hábito
      </Button>

      {dailyTargets.length === 0 ? (
        <p className={`text-center py-4 text-[var(--color-text-light)]`}>No has añadido ningún hábito diario. ¡Crea el primero!</p>
      ) : (
        <div className="space-y-3">
          {dailyTargets.map(target => (
            <div key={target.id} className={`p-4 rounded-md shadow-sm border border-[var(--color-light-purple)]`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                <p className={`font-semibold text-lg text-[var(--color-primary)]`}>{target.customName}</p>
                <p className={`text-sm font-medium text-[var(--color-secondary)]`}>{getHabitDisplayTime(target)}</p>
              </div>
              <p className={`text-sm text-[var(--color-text-main)] font-medium mb-1`}>Categorías incluidas:</p>
              <ul className="list-disc list-inside pl-2 space-y-1 mb-2">
                {target.components.map((comp, index) => (
                  <li key={index} className={`text-sm text-[var(--color-text-main)]`}>
                    {comp.category}
                  </li>
                ))}
              </ul>
              <div className="mt-2 sm:mt-0 flex space-x-2 justify-end">
                <Button onClick={() => openEditModal(target)} variant="outline" size="sm">Editar</Button>
                <Button onClick={() => deleteDailyTarget(target.id)} variant="ghost" size="sm" className={`text-[var(--color-error)] hover:bg-red-100`}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetModalForm();}} title={editingTarget ? "Editar Hábito" : "Añadir Nuevo Hábito"} size="lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="habitCustomName" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Nombre del Hábito:</label>
            <input
              type="text"
              id="habitCustomName"
              value={habitCustomName}
              onChange={(e) => setHabitCustomName(e.target.value)}
              className={inputBaseStyle}
              placeholder="Ej: Inmersión Diaria, Bloque de Estudio"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="habitMinMinutesTotal" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Minutos Mínimos Totales (para el check):</label>
                <input
                type="number"
                id="habitMinMinutesTotal"
                value={habitMinMinutesTotal}
                onChange={(e) => setHabitMinMinutesTotal(parseInt(e.target.value, 10) || 0)}
                min="0" step="5"
                className={`${inputBaseStyle} text-sm`}
                />
            </div>
            <div>
                <label htmlFor="habitOptimalMinutesTotal" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Minutos Óptimos Totales (meta ideal):</label>
                <input
                type="number"
                id="habitOptimalMinutesTotal"
                value={habitOptimalMinutesTotal}
                onChange={(e) => setHabitOptimalMinutesTotal(parseInt(e.target.value, 10) || 0)}
                min="0" step="5"
                className={`${inputBaseStyle} text-sm`}
                />
            </div>
          </div>


          <div className="space-y-3 p-3 border border-[var(--color-light-purple)] rounded-md">
            <h4 className={`text-md font-semibold text-[var(--color-secondary)]`}>Categorías que cuentan para este hábito:</h4>
            {habitComponents.length === 0 && <p className={`text-xs text-[var(--color-text-light)] italic`}>Aún no has añadido categorías.</p>}
            <ul className="space-y-2">
              {habitComponents.map((comp, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <span className={`text-sm text-[var(--color-text-main)]`}>{comp.category}</span>
                  <Button onClick={() => handleRemoveComponentFromHabit(index)} variant="ghost" size="sm" className={`text-[var(--color-error)]`} aria-label="Eliminar componente" title="Eliminar componente">
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-[var(--color-light-purple)] mt-3 space-y-2">
                <p className={`text-sm font-medium text-[var(--color-text-main)]`}>Añadir nueva categoría al hábito:</p>
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label htmlFor="currentComponentCategory" className={`block text-xs font-medium text-[var(--color-text-main)]`}>Categoría:</label>
                        <select
                        id="currentComponentCategory"
                        value={currentComponentCategory}
                        onChange={(e) => setCurrentComponentCategory(e.target.value as ActivityCategory)}
                        className={`${inputBaseStyle} text-sm`}
                        >
                        {ACTIVITY_CATEGORIES_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleAddComponentToHabit} variant="outline" size="sm" className="whitespace-nowrap">Añadir Categoría</Button>
                 </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-3">
            <Button variant="ghost" onClick={() => { setIsModalOpen(false); resetModalForm(); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleModalSubmit}>
              {editingTarget ? "Guardar Cambios" : "Añadir Hábito"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};