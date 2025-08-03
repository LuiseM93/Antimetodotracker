
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Language, ActivityCategory, ActivityLogEntry, AppView, TimerMode, ActivityDetailType, Skill } from '../../types.ts';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';
import { Button } from '../../components/Button.tsx';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon as ResetIcon } from '../../components/icons/TimerIcons.tsx';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon.tsx';
import { SelectActivityModal } from './SelectActivityModal.tsx';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon.tsx';
import { Modal } from '../../components/Modal.tsx';
import { formatTimeHHMMSS } from '../../utils/timeUtils.ts';
import { addToOfflineQueue } from '../../services/offlineQueueService.ts';

const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

// ... (el resto del componente se mantiene igual hasta handleSaveActivity)

  const handleSaveActivity = async () => {
    if (!selectedCategory || selectedActivityName === 'Ninguna seleccionada' || selectedActivityName.trim() === '') {
      alert("Por favor, selecciona una actividad.");
      return;
    }

    // ... (lógica de duración)

    const logEntryData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'> = {
      language: currentLanguageForLog,
      category: selectedCategory,
      sub_activity: selectedActivityName,
      custom_title: customTitle.trim() || null,
      duration_seconds: durationToSaveSeconds,
      date: dateToSave,
      start_time: timeToSave || null,
      notes: notes.trim() || null,
    };

    if (!navigator.onLine) {
        const offlineEntry: ActivityLogEntry = {
            ...logEntryData,
            id: `offline_${Date.now()}`,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
        };
        addToOfflineQueue(offlineEntry);
        alert("No tienes conexión. La actividad se ha guardado localmente y se subirá cuando vuelvas a conectarte.");
        navigate(AppView.DASHBOARD);
        return;
    }

    await addActivityLog(logEntryData);

    if (durationToSaveSeconds > 300) {
        await createFeedItem('activity_logged', {
            language: logEntryData.language,
            category: logEntryData.category,
            sub_activity: logEntryData.sub_activity,
            custom_title: logEntryData.custom_title,
            duration_seconds: logEntryData.duration_seconds
        });
    }

    navigate(AppView.DASHBOARD);
  };
  
  const handleSaveManualLog = async () => {
    // ... (validación)
    
    const logEntryData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'> = {
      language: manualForm.language,
      category: manualForm.category,
      sub_activity: finalSubActivity,
      custom_title: manualForm.customTitle.trim() || null,
      duration_seconds: durationInSeconds,
      date: manualForm.date,
      start_time: manualForm.startTime || null,
      notes: manualForm.notes.trim() || null,
    };

    if (!navigator.onLine) {
        const offlineEntry: ActivityLogEntry = {
            ...logEntryData,
            id: `offline_${Date.now()}`,
            user_id: userProfile.id,
            created_at: new Date().toISOString(),
        };
        addToOfflineQueue(offlineEntry);
        alert("No tienes conexión. La actividad se ha guardado localmente y se subirá cuando vuelvas a conectarte.");
        setIsManualLogModalOpen(false);
        navigate(AppView.DASHBOARD);
        return;
    }

    if (isEditing && currentLogEntry.id) {
        await updateActivityLog({ ...currentLogEntry, ...logEntryData, id: currentLogEntry.id } as ActivityLogEntry);
    } else {
        await addActivityLog(logEntryData);
    }
    setIsManualLogModalOpen(false);
    navigate(AppView.DASHBOARD); 
  };

// ... (resto del componente)
