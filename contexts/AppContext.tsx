import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { UserProfile, ActivityLogEntry, Language, AntimethodStage, UserGoal, DailyActivityGoal, Resource, SavedDailyRoutine, AppDataExport, TimerMode, AppTheme, AppView, YearInReviewData, ActivityCategory, Skill, ActivityDetailType, DashboardCardDisplayMode, RewardItem } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { INITIAL_RESOURCES, STAGE_DETAILS, DEFAULT_DAILY_GOALS, AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS, LEARNING_DAY_POINTS_AWARD, HABIT_POINTS_MAP, DEFAULT_DASHBOARD_CARD_DISPLAY_MODE, AVAILABLE_REWARDS, ALL_REWARD_DEFINITIONS, HOUR_MILESTONES } from '../constants.ts';
import { supabase } from '../services/supabaseClient.ts';
import type { Session, User } from '@supabase/supabase-js';
import { Database } from '../services/database.types.ts';

const USER_PROFILE_KEY = 'ANTIMETODO_USER_PROFILE_V5'; 
const ACTIVITY_LOGS_KEY = 'ANTIMETODO_ACTIVITY_LOGS_V3';
const USER_GOALS_KEY = 'ANTIMETODO_USER_GOALS_V2'; 
const DAILY_TARGETS_KEY = 'ANTIMETODO_DAILY_TARGETS_V4';
const APP_RESOURCES_KEY = 'ANTIMETODO_APP_RESOURCES';
const SAVED_DAILY_ROUTINES_KEY = 'ANTIMETODO_SAVED_DAILY_ROUTINES_V2';

const OLD_USER_PROFILE_KEYS = ['ANTIMETODO_USER_PROFILE_V4', 'ANTIMETODO_USER_PROFILE_V3', 'ANTIMETODO_USER_PROFILE_V2', 'ANTIMETODO_USER_PROFILE'];
const OLD_ACTIVITY_LOGS_KEYS = ['ANTIMETODO_ACTIVITY_LOGS_V2', 'ANTIMETODO_ACTIVITY_LOGS']; 
const OLD_USER_GOALS_KEYS = ['ANTIMETODO_USER_GOALS'];
const OLD_DAILY_TARGETS_KEYS = ['ANTIMETODO_DAILY_TARGETS_V3','ANTIMETODO_DAILY_TARGETS_V2', 'ANTIMETODO_DAILY_TARGETS'];
const OLD_SAVED_ROUTINES_KEYS = ['ANTIMETODO_SAVED_DAILY_ROUTINES'];

const DEFAULT_LOG_DURATION_SECONDS = 30 * 60;
const DEFAULT_LOG_TIMER_MODE: TimerMode = 'manual';
const DEFAULT_APP_THEME: AppTheme = 'light';
const DEFAULT_HABIT_CREATION_DATE = '2024-01-01';


// ... (imports)

interface AppContextType {
  // ... (otros tipos)
  isInitialLoadComplete: boolean;
  isProfileLoaded: boolean; // <--- AÑADIR ESTO
  // ... (resto de tipos)
}

// ... (AppContext, loadDataWithMigration, etc.)

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... (otros estados)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false); // <--- AÑADIR ESTO

  // ... (useEffect de autenticación)

  // Data loader
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsProfileLoaded(false); // <--- RESTABLECER AL CARGAR
      
      // ... (lógica de carga de datos existente)

      if (session?.user) {
        // ... (lógica de carga de registros de actividad)
      }

      // ... (lógica de carga de perfil almacenado)

      setIsProfileLoaded(true); // <--- ESTABLECER A TRUE DESPUÉS DE CARGAR
      setIsLoading(false);
    };

    if (isInitialLoadComplete) {
      loadData();
    }
  }, [isInitialLoadComplete, session]);
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUserProfile(null);
        setActivityLogs([]);
        setUserGoals([]);
        setDailyTargets([]);
        setSavedDailyRoutines([]);
        setIsProfileLoaded(false); // <--- RESTABLECER AL CERRAR SESIÓN
      }
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // ... (resto del proveedor)

  return (
    <AppContext.Provider value={{ 
        // ... (otros valores)
        isInitialLoadComplete, isProfileLoaded, // <--- AÑADIR isProfileLoaded
        // ... (resto de valores)
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ... (useAppContext)
