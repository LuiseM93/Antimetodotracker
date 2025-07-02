
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { SavedDailyRoutine } from '../../types'; 
import { DocumentPlusIcon } from '../../components/icons/DocumentPlusIcon';
import { FolderOpenIcon } from '../../components/icons/FolderOpenIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { ArrowPathIcon } from '../../components/icons/TimerIcons'; // Re-using as "Update/Sync" icon
// import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon'; // Removed
// import { Link } from 'react-router-dom'; // Removed if only used for planner link
import { RoutineBuilder } from './RoutineBuilder';


const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";


export const RoutinesScreen: React.FC = () => {
  const { dailyTargets, savedDailyRoutines, saveCurrentDailyTargetsAsRoutine, loadDailyRoutine, deleteDailyRoutine, updateSavedDailyRoutine } = useAppContext();
  
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'rename'>('create');
  const [routineToManage, setRoutineToManage] = useState<SavedDailyRoutine | null>(null);
  const [routineNameInput, setRoutineNameInput] = useState('');


  const openCreateRoutineModal = () => {
    setModalMode('create');
    setRoutineToManage(null);
    setRoutineNameInput('');
    setIsNameModalOpen(true);
  };

  const openRenameRoutineModal = (routine: SavedDailyRoutine) => {
    setModalMode('rename');
    setRoutineToManage(routine);
    setRoutineNameInput(routine.name);
    setIsNameModalOpen(true);
  };

  const handleNameModalSubmit = () => {
    if (routineNameInput.trim() === '') {
      alert("Por favor, ingresa un nombre para la plantilla.");
      return;
    }

    if (modalMode === 'create') {
      if (dailyTargets.length === 0) {
        alert("No hay hábitos diarios activos para guardar como nueva plantilla. Por favor, crea algunos primero.");
        return;
      }
      saveCurrentDailyTargetsAsRoutine(routineNameInput);
    } else if (modalMode === 'rename' && routineToManage) {
      updateSavedDailyRoutine({ ...routineToManage, name: routineNameInput });
    }

    setIsNameModalOpen(false);
    setRoutineNameInput('');
    setRoutineToManage(null);
  };

  const handleUpdateRoutineWithCurrentHabits = (routineToUpdate: SavedDailyRoutine) => {
    if (dailyTargets.length === 0) {
        alert("No hay hábitos diarios activos para usar en la actualización. Carga y modifica algunos primero, o crea nuevos.");
        return;
    }
    if (window.confirm(`¿Estás seguro de que quieres sobrescribir los hábitos de la plantilla "${routineToUpdate.name}" con tus hábitos diarios actuales? Esta acción no se puede deshacer.`)) {
        updateSavedDailyRoutine({ ...routineToUpdate, targets: [...dailyTargets] });
        alert(`Plantilla "${routineToUpdate.name}" actualizada con éxito.`);
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)]`}>Rutinas y Planificación</h1>
          <p className={`text-[var(--color-text-main)] mt-1`}>
            Diseña tus hábitos diarios y guárdalos como plantillas para reutilizarlos.
          </p>
        </div>
        {/* Removed Weekly Planner Link Button */}
      </div>
      
      <RoutineBuilder />

      <Card title="Mis Plantillas de Rutinas Diarias" className="mt-8">
        <p className="mb-3 text-[var(--color-text-light)] text-sm">
          Guarda tu configuración actual de "Hábitos Diarios" como una plantilla para reutilizarla fácilmente, o actualiza una existente.
        </p>
        <Button 
            onClick={openCreateRoutineModal}
            variant="accent" 
            leftIcon={<DocumentPlusIcon className="w-5 h-5"/>} 
            className="mb-4"
            disabled={dailyTargets.length === 0}
            title={dailyTargets.length === 0 ? "Primero crea hábitos diarios para poder guardarlos" : "Crear nueva plantilla con hábitos actuales"}
        >
          Crear Nueva Plantilla con Hábitos Actuales
        </Button>

        {savedDailyRoutines.length > 0 ? (
          <ul className="space-y-3">
            {savedDailyRoutines.map(routine => (
              <li key={routine.id} className={`p-3 rounded-md border border-[var(--color-light-purple)] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center`}>
                <span className={`font-medium text-[var(--color-primary)] mb-2 sm:mb-0 mr-2`}>{routine.name} ({routine.targets.length} {routine.targets.length === 1 ? 'hábito' : 'hábitos'})</span>
                <div className="flex space-x-2 self-end sm:self-center flex-wrap gap-1">
                  <Button onClick={() => loadDailyRoutine(routine.id)} variant="outline" size="sm" leftIcon={<FolderOpenIcon className="w-4 h-4"/>}>Cargar</Button>
                  <Button onClick={() => openRenameRoutineModal(routine)} variant="ghost" size="sm" leftIcon={<PencilIcon className="w-4 h-4"/>} className="text-blue-600 hover:bg-blue-100">Renombrar</Button>
                  <Button 
                    onClick={() => handleUpdateRoutineWithCurrentHabits(routine)} 
                    variant="ghost" 
                    size="sm" 
                    leftIcon={<ArrowPathIcon className="w-4 h-4"/>} 
                    className="text-teal-600 hover:bg-teal-100"
                    disabled={dailyTargets.length === 0}
                    title={dailyTargets.length === 0 ? "No hay hábitos activos para actualizar esta plantilla" : "Actualizar plantilla con hábitos actuales"}
                  >
                    Actualizar
                  </Button>
                  <Button onClick={() => deleteDailyRoutine(routine.id)} variant="ghost" size="sm" leftIcon={<TrashIcon className="w-4 h-4"/>} className={`text-[var(--color-error)] hover:bg-red-100`}>Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-[var(--color-text-light)] italic`}>No tienes plantillas de rutinas guardadas.</p>
        )}
      </Card>

      <Modal 
        isOpen={isNameModalOpen} 
        onClose={() => { setIsNameModalOpen(false); setRoutineToManage(null); setRoutineNameInput('');}} 
        title={modalMode === 'create' ? "Crear Nueva Plantilla de Rutina" : "Renombrar Plantilla de Rutina"}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="routineNameInput" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Nombre de la Plantilla:</label>
            <input
              type="text"
              id="routineNameInput"
              value={routineNameInput}
              onChange={(e) => setRoutineNameInput(e.target.value)}
              className={inputBaseStyle}
              placeholder="Ej: Rutina de Inmersión Mañanera"
            />
            {modalMode === 'create' && dailyTargets.length > 0 && (
                 <p className="text-xs text-gray-500 mt-1">Se guardarán los {dailyTargets.length} hábitos diarios actualmente configurados.</p>
            )}
             {modalMode === 'create' && dailyTargets.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">Advertencia: No hay hábitos diarios configurados para guardar. Esta acción no tendrá efecto si continúas.</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => { setIsNameModalOpen(false); setRoutineToManage(null); setRoutineNameInput(''); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleNameModalSubmit}>{modalMode === 'create' ? "Crear Plantilla" : "Guardar Nombre"}</Button>
          </div>
        </div>
      </Modal>
      
    </div>
  );
};