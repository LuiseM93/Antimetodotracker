
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { UserProfile, ActivityLogEntry, Language, AntimethodStage, UserGoal, DailyActivityGoal, Resource, SavedDailyRoutine, AppDataExport, TimerMode, AppTheme, AppView, YearInReviewData, ActivityCategory, Skill, ActivityDetailType, DashboardCardDisplayMode } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_RESOURCES, STAGE_DETAILS, DEFAULT_DAILY_GOALS, AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../constants';

const USER_PROFILE_KEY = 'ANTIMETODO_USER_PROFILE_V3'; // Version bump for dashboardCardDisplayMode
const ACTIVITY_LOGS_KEY = 'ANTIMETODO_ACTIVITY_LOGS_V2'; 
const USER_GOALS_KEY = 'ANTIMETODO_USER_GOALS_V2'; 
const DAILY_TARGETS_KEY = 'ANTIMETODO_DAILY_TARGETS_V3';
const APP_RESOURCES_KEY = 'ANTIMETODO_APP_RESOURCES';
const SAVED_DAILY_ROUTINES_KEY = 'ANTIMETODO_SAVED_DAILY_ROUTINES';

const DEFAULT_LOG_DURATION_MINUTES = 30;
const DEFAULT_LOG_TIMER_MODE: TimerMode = 'manual';
const DEFAULT_APP_THEME: AppTheme = 'light';
const DEFAULT_DASHBOARD_CARD_DISPLAY_MODE: DashboardCardDisplayMode = 'both';


interface AppContextType {
  userProfile: UserProfile | null;
  activityLogs: ActivityLogEntry[];
  userGoals: UserGoal[];
  dailyTargets: DailyActivityGoal[];
  resources: Resource[];
  savedDailyRoutines: SavedDailyRoutine[];
  isLoading: boolean;
  isInitialLoadComplete: boolean;
  appTheme: AppTheme;
  
  initializeUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateAppTheme: (theme: AppTheme) => void;

  addActivityLog: (logData: Omit<ActivityLogEntry, 'id'>) => void;
  updateActivityLog: (log: ActivityLogEntry) => void;
  deleteActivityLog: (logId: string) => void;
  
  addUserGoal: (goalData: Omit<UserGoal, 'id' | 'achieved'>) => void;
  updateUserGoal: (updatedGoal: UserGoal) => void; 
  toggleUserGoal: (goalId: string) => void;
  deleteUserGoal: (goalId: string) => void;
  
  addDailyTarget: (targetData: Omit<DailyActivityGoal, 'id'>) => void;
  updateDailyTarget: (updatedTarget: DailyActivityGoal) => void;
  deleteDailyTarget: (targetId: string) => void;
  saveCurrentDailyTargetsAsRoutine: (name: string) => void;
  loadDailyRoutine: (routineId: string) => void;
  deleteDailyRoutine: (routineId: string) => void;
  updateSavedDailyRoutine: (routine: SavedDailyRoutine) => void;

  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  getCurrentStageDetails: () => typeof STAGE_DETAILS[AntimethodStage] | null;

  exportAppData: () => AppDataExport;
  importAppData: (data: AppDataExport) => void;
  resetAllData: () => void;

  getAvailableReportYears: () => number[];
  getYearInReviewData: (year: number, language: Language | 'Total') => YearInReviewData;

  toggleFavoriteActivity: (activityName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const activityDetailsMap = new Map<string, ActivityDetailType>(
  ANTIMETHOD_ACTIVITIES_DETAILS.map(detail => [detail.name, detail])
);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [dailyTargets, setDailyTargets] = useState<DailyActivityGoal[]>(DEFAULT_DAILY_GOALS); 
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [savedDailyRoutines, setSavedDailyRoutines] = useState<SavedDailyRoutine[]>([]);
  const [appTheme, setAppTheme] = useState<AppTheme>(DEFAULT_APP_THEME);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      let storedProfile = storageService.getItem<UserProfile>(USER_PROFILE_KEY);
      const storedLogs = storageService.getItem<ActivityLogEntry[]>(ACTIVITY_LOGS_KEY, []);
      const storedGoals = storageService.getItem<UserGoal[]>(USER_GOALS_KEY, []);
      const storedTargets = storageService.getItem<DailyActivityGoal[]>(DAILY_TARGETS_KEY, DEFAULT_DAILY_GOALS); 
      const storedResources = storageService.getItem<Resource[]>(APP_RESOURCES_KEY, INITIAL_RESOURCES);
      const storedSavedRoutines = storageService.getItem<SavedDailyRoutine[]>(SAVED_DAILY_ROUTINES_KEY, []);

      if (storedProfile) {
        storedProfile.defaultLogDurationMinutes = storedProfile.defaultLogDurationMinutes ?? DEFAULT_LOG_DURATION_MINUTES;
        storedProfile.defaultLogTimerMode = storedProfile.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE;
        storedProfile.theme = storedProfile.theme ?? DEFAULT_APP_THEME;
        storedProfile.learningLanguages = storedProfile.learningLanguages || [];
        storedProfile.favoriteActivities = storedProfile.favoriteActivities || [];
        storedProfile.dashboardCardDisplayMode = storedProfile.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE;
        
        if (!storedProfile.primaryLanguage || (storedProfile.learningLanguages.length > 0 && !storedProfile.learningLanguages.includes(storedProfile.primaryLanguage))) {
            storedProfile.primaryLanguage = storedProfile.learningLanguages.length > 0 ? storedProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
        } else if (storedProfile.learningLanguages.length === 0 && storedProfile.primaryLanguage) {
             storedProfile.primaryLanguage = AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
        }

        const updatedGoals = (storedGoals || []).map(g => ({
            ...g,
            currentValue: g.currentValue ?? 0,
            targetValue: g.targetValue ?? 0,
            unit: g.unit ?? ''
        }));

        setUserProfile(storedProfile);
        setUserGoals(updatedGoals);
        storageService.setItem(USER_GOALS_KEY, updatedGoals);

        setAppTheme(storedProfile.theme);
      } else {
        setAppTheme(DEFAULT_APP_THEME);
      }
      
      const updatedLogs = (storedLogs || []).map(log => ({
        ...log,
        customTitle: log.customTitle || undefined
      }));
      setActivityLogs(updatedLogs);
      storageService.setItem(ACTIVITY_LOGS_KEY, updatedLogs);


      setDailyTargets(storedTargets || DEFAULT_DAILY_GOALS);
      setResources(storedResources || INITIAL_RESOURCES);
      setSavedDailyRoutines(storedSavedRoutines || []);
      
      setIsLoading(false);
      setIsInitialLoadComplete(true);
    };
    loadData();
  }, []);
  
  const updateAppTheme = useCallback((theme: AppTheme) => {
    setAppTheme(theme);
    if (userProfile) {
      const updatedProfile = { ...userProfile, theme };
      setUserProfile(updatedProfile);
      storageService.setItem(USER_PROFILE_KEY, updatedProfile);
    }
  }, [userProfile]);

  const initializeUserProfile = useCallback((profile: UserProfile) => {
    const initialTheme = profile.theme ?? DEFAULT_APP_THEME;
    const initialLearningLanguages = profile.learningLanguages || [];
    let initialPrimaryLanguage = profile.primaryLanguage;

    if (!initialPrimaryLanguage || (initialLearningLanguages.length > 0 && !initialLearningLanguages.includes(initialPrimaryLanguage))) {
        initialPrimaryLanguage = initialLearningLanguages.length > 0 ? initialLearningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
    } else if (initialLearningLanguages.length === 0) {
        initialPrimaryLanguage = AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
    }

    const profileWithDefaults: UserProfile = {
        ...profile,
        learningLanguages: initialLearningLanguages,
        defaultLogDurationMinutes: profile.defaultLogDurationMinutes ?? DEFAULT_LOG_DURATION_MINUTES,
        defaultLogTimerMode: profile.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
        primaryLanguage: initialPrimaryLanguage,
        theme: initialTheme,
        favoriteActivities: profile.favoriteActivities || [],
        dashboardCardDisplayMode: profile.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
        goals: (profile.goals || []).map(g => ({
            ...g,
            currentValue: g.currentValue ?? 0,
            targetValue: g.targetValue ?? 0,
            unit: g.unit ?? ''
        }))
    };
    setUserProfile(profileWithDefaults);
    setAppTheme(initialTheme);
    storageService.setItem(USER_PROFILE_KEY, profileWithDefaults);
    setUserGoals(profileWithDefaults.goals);
    storageService.setItem(USER_GOALS_KEY, profileWithDefaults.goals);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
  
      let profileInProgress = { ...prev, ...updates };
      
      profileInProgress.learningLanguages = profileInProgress.learningLanguages || [];
      profileInProgress.favoriteActivities = updates.favoriteActivities || prev.favoriteActivities || [];
      profileInProgress.dashboardCardDisplayMode = updates.dashboardCardDisplayMode || prev.dashboardCardDisplayMode || DEFAULT_DASHBOARD_CARD_DISPLAY_MODE;
  
      const effectiveLearningLanguages = profileInProgress.learningLanguages;
      let finalPrimaryLanguage = profileInProgress.primaryLanguage;
  
      if (effectiveLearningLanguages.length > 0) {
        if (!finalPrimaryLanguage || !effectiveLearningLanguages.includes(finalPrimaryLanguage)) {
          finalPrimaryLanguage = effectiveLearningLanguages[0];
        }
      } else {
        finalPrimaryLanguage = AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
      }
      profileInProgress.primaryLanguage = finalPrimaryLanguage;
  
      const newProfile: UserProfile = {
        ...profileInProgress,
        defaultLogDurationMinutes: profileInProgress.defaultLogDurationMinutes ?? DEFAULT_LOG_DURATION_MINUTES,
        defaultLogTimerMode: profileInProgress.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
        theme: profileInProgress.theme ?? DEFAULT_APP_THEME,
      };
      
      if (updates.goals) { 
        newProfile.goals = updates.goals.map(g => ({
            ...g,
            currentValue: g.currentValue ?? 0,
            targetValue: g.targetValue ?? 0,
            unit: g.unit ?? ''
        }));
         setUserGoals(newProfile.goals); 
         storageService.setItem(USER_GOALS_KEY, newProfile.goals);
      }
      
      if (newProfile.theme && newProfile.theme !== prev.theme) {
        setAppTheme(newProfile.theme);
      }
  
      storageService.setItem(USER_PROFILE_KEY, newProfile);
      return newProfile;
    });
  }, [setAppTheme, setUserGoals]);


  const addActivityLog = useCallback((logData: Omit<ActivityLogEntry, 'id'>) => {
    setActivityLogs(prev => {
      const newLog: ActivityLogEntry = {
        ...logData,
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        startTime: logData.startTime || undefined,
        customTitle: logData.customTitle || undefined, 
      };
      const updatedLogs = [newLog, ...prev]; 
      storageService.setItem(ACTIVITY_LOGS_KEY, updatedLogs);
      return updatedLogs;
    });
  }, []);
  
  const updateActivityLog = useCallback((updatedLog: ActivityLogEntry) => {
    setActivityLogs(prevLogs => {
      const newLogs = prevLogs.map(log => log.id === updatedLog.id ? { ...updatedLog, customTitle: updatedLog.customTitle || undefined } : log);
      storageService.setItem(ACTIVITY_LOGS_KEY, newLogs);
      return newLogs;
    });
  }, []);

  const deleteActivityLog = useCallback((logId: string) => {
    setActivityLogs(prevLogs => {
      const newLogs = prevLogs.filter(log => log.id !== logId);
      storageService.setItem(ACTIVITY_LOGS_KEY, newLogs);
      return newLogs;
    });
  }, []);

  const addUserGoal = useCallback((goalData: Omit<UserGoal, 'id' | 'achieved'>) => {
    setUserGoals(prev => {
      const newGoal: UserGoal = {
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        achieved: false,
        ...goalData,
        currentValue: goalData.currentValue ?? 0,
        targetValue: goalData.targetValue ?? 0,
        unit: goalData.unit ?? '',
      };
      const updatedGoals = [...prev, newGoal];
      storageService.setItem(USER_GOALS_KEY, updatedGoals);
      return updatedGoals;
    });
  }, []);

  const updateUserGoal = useCallback((updatedGoal: UserGoal) => {
    setUserGoals(prev => {
        const updatedGoals = prev.map(g => g.id === updatedGoal.id ? {
            ...g, 
            ...updatedGoal, 
            currentValue: updatedGoal.currentValue ?? g.currentValue ?? 0,
            targetValue: updatedGoal.targetValue ?? g.targetValue ?? 0,
            unit: updatedGoal.unit ?? g.unit ?? '',
        } : g);
        storageService.setItem(USER_GOALS_KEY, updatedGoals);
        return updatedGoals;
    });
  }, []);


  const toggleUserGoal = useCallback((goalId: string) => {
    setUserGoals(prev => {
      const updatedGoals = prev.map(g => g.id === goalId ? { ...g, achieved: !g.achieved } : g);
      storageService.setItem(USER_GOALS_KEY, updatedGoals);
      return updatedGoals;
    });
  }, []);
  
  const deleteUserGoal = useCallback((goalId: string) => {
    setUserGoals(prev => {
      const updatedGoals = prev.filter(g => g.id !== goalId);
      storageService.setItem(USER_GOALS_KEY, updatedGoals);
      return updatedGoals;
    });
  }, []);

  const addDailyTarget = useCallback((targetData: Omit<DailyActivityGoal, 'id'>) => {
    setDailyTargets(prev => {
      const newTarget: DailyActivityGoal = {
        ...targetData,
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
      };
      const updatedTargets = [...prev, newTarget];
      storageService.setItem(DAILY_TARGETS_KEY, updatedTargets);
      return updatedTargets;
    });
  }, []);

  const updateDailyTarget = useCallback((targetToUpdate: DailyActivityGoal) => {
    setDailyTargets(prev => {
      const updatedTargets = prev.map(t => t.id === targetToUpdate.id ? targetToUpdate : t);
      storageService.setItem(DAILY_TARGETS_KEY, updatedTargets);
      return updatedTargets;
    });
  }, []);

  const deleteDailyTarget = useCallback((targetId: string) => {
    setDailyTargets(prev => {
      const updatedTargets = prev.filter(t => t.id !== targetId);
      storageService.setItem(DAILY_TARGETS_KEY, updatedTargets);
      return updatedTargets;
    });
  }, []);

  const saveCurrentDailyTargetsAsRoutine = useCallback((name: string) => {
    setSavedDailyRoutines(prev => {
      const newRoutine: SavedDailyRoutine = {
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        name,
        targets: [...dailyTargets] 
      };
      const updatedRoutines = [...prev, newRoutine];
      storageService.setItem(SAVED_DAILY_ROUTINES_KEY, updatedRoutines);
      return updatedRoutines;
    });
  }, [dailyTargets]);

  const loadDailyRoutine = useCallback((routineId: string) => {
    const routineToLoad = savedDailyRoutines.find(r => r.id === routineId);
    if (routineToLoad) {
      setDailyTargets([...routineToLoad.targets]); 
      storageService.setItem(DAILY_TARGETS_KEY, [...routineToLoad.targets]);
    }
  }, [savedDailyRoutines]);

  const deleteDailyRoutine = useCallback((routineId: string) => {
    setSavedDailyRoutines(prev => {
      const updatedRoutines = prev.filter(r => r.id !== routineId);
      storageService.setItem(SAVED_DAILY_ROUTINES_KEY, updatedRoutines);
      return updatedRoutines;
    });
  }, []);
  
  const updateSavedDailyRoutine = useCallback((routineToUpdate: SavedDailyRoutine) => {
    setSavedDailyRoutines(prev => {
      const updatedRoutines = prev.map(r => r.id === routineToUpdate.id ? routineToUpdate : r);
      storageService.setItem(SAVED_DAILY_ROUTINES_KEY, updatedRoutines);
      return updatedRoutines;
    });
  }, []);


  const addResource = useCallback((resourceData: Omit<Resource, 'id'>) => {
    setResources(prev => {
        const newResource: Resource = {
            ...resourceData,
            id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        };
        const updatedResources = [...prev, newResource];
        storageService.setItem(APP_RESOURCES_KEY, updatedResources);
        return updatedResources;
    });
  }, []);

  const updateResource = useCallback((updatedResource: Resource) => {
    setResources(prev => {
        const newResources = prev.map(r => r.id === updatedResource.id ? updatedResource : r);
        storageService.setItem(APP_RESOURCES_KEY, newResources);
        return newResources;
    });
  }, []);

  const deleteResource = useCallback((resourceId: string) => {
    setResources(prev => {
        const newResources = prev.filter(r => r.id !== resourceId);
        storageService.setItem(APP_RESOURCES_KEY, newResources);
        return newResources;
    });
  }, []);
  
  const getCurrentStageDetails = useCallback(() => {
    if (userProfile) {
      return STAGE_DETAILS[userProfile.currentStage];
    }
    return null;
  }, [userProfile]);

  const exportAppData = useCallback((): AppDataExport => {
    return {
      userProfile,
      activityLogs,
      userGoals,
      dailyTargets,
      resources,
      savedDailyRoutines,
    };
  }, [userProfile, activityLogs, userGoals, dailyTargets, resources, savedDailyRoutines]);

  const importAppData = useCallback((data: AppDataExport) => {
    if (data.userProfile) {
      const importedTheme = data.userProfile.theme ?? DEFAULT_APP_THEME;
      const importedLearningLanguages = data.userProfile.learningLanguages || [];
      let importedPrimaryLang = data.userProfile.primaryLanguage;
      
      if (!importedPrimaryLang || (importedLearningLanguages.length > 0 && !importedLearningLanguages.includes(importedPrimaryLang))) {
        importedPrimaryLang = importedLearningLanguages.length > 0 ? importedLearningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
      } else if (importedLearningLanguages.length === 0) {
        importedPrimaryLang = AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language;
      }

      const profileWithDefaults: UserProfile = {
        ...data.userProfile,
        learningLanguages: importedLearningLanguages,
        defaultLogDurationMinutes: data.userProfile.defaultLogDurationMinutes ?? DEFAULT_LOG_DURATION_MINUTES,
        defaultLogTimerMode: data.userProfile.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
        primaryLanguage: importedPrimaryLang,
        theme: importedTheme,
        favoriteActivities: data.userProfile.favoriteActivities || [],
        dashboardCardDisplayMode: data.userProfile.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
        goals: (data.userProfile.goals || []).map(g => ({ 
            ...g,
            currentValue: g.currentValue ?? 0,
            targetValue: g.targetValue ?? 0,
            unit: g.unit ?? ''
        }))
      };
      setUserProfile(profileWithDefaults);
      setAppTheme(importedTheme);
      storageService.setItem(USER_PROFILE_KEY, profileWithDefaults);
    } else {
      setUserProfile(null);
      storageService.removeItem(USER_PROFILE_KEY);
      setAppTheme(DEFAULT_APP_THEME); 
    }

    const importedActivityLogs = (data.activityLogs || []).map(log => ({ 
        ...log,
        customTitle: log.customTitle || undefined
    }));
    setActivityLogs(importedActivityLogs);
    storageService.setItem(ACTIVITY_LOGS_KEY, importedActivityLogs);
    
    const importedUserGoals = (data.userGoals || []).map(g => ({
        ...g,
        currentValue: g.currentValue ?? 0,
        targetValue: g.targetValue ?? 0,
        unit: g.unit ?? ''
    }));
    setUserGoals(importedUserGoals);
    storageService.setItem(USER_GOALS_KEY, importedUserGoals);

    setDailyTargets(data.dailyTargets || DEFAULT_DAILY_GOALS);
    storageService.setItem(DAILY_TARGETS_KEY, data.dailyTargets || DEFAULT_DAILY_GOALS);
    setResources(data.resources || INITIAL_RESOURCES);
    storageService.setItem(APP_RESOURCES_KEY, data.resources || INITIAL_RESOURCES);
    setSavedDailyRoutines(data.savedDailyRoutines || []);
    storageService.setItem(SAVED_DAILY_ROUTINES_KEY, data.savedDailyRoutines || []);

    alert("Datos importados con éxito. La aplicación se actualizará.");
  }, [setUserProfile, setAppTheme, setUserGoals, setActivityLogs, setDailyTargets, setResources, setSavedDailyRoutines]);

  const resetAllData = useCallback(() => {
    storageService.removeItem(USER_PROFILE_KEY);
    storageService.removeItem(ACTIVITY_LOGS_KEY);
    storageService.removeItem(USER_GOALS_KEY);
    storageService.removeItem(DAILY_TARGETS_KEY);
    storageService.removeItem(SAVED_DAILY_ROUTINES_KEY);

    setUserProfile(null);
    setActivityLogs([]);
    setUserGoals([]);
    setDailyTargets(DEFAULT_DAILY_GOALS);
    setSavedDailyRoutines([]);
    
    setAppTheme(DEFAULT_APP_THEME); 
    
    setIsInitialLoadComplete(false); 
    setTimeout(() => setIsInitialLoadComplete(true), 0); 
    alert("Todos los datos han sido restablecidos. Serás redirigido a la pantalla de bienvenida.");
  }, [setAppTheme, setUserProfile, setUserGoals, setActivityLogs, setDailyTargets, setSavedDailyRoutines, setIsInitialLoadComplete]);

  const getAvailableReportYears = useCallback((): number[] => {
    const years = new Set<number>();
    activityLogs.forEach(log => {
      years.add(new Date(log.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [activityLogs]);

  const getYearInReviewData = useCallback((year: number, languageFilter: Language | 'Total'): YearInReviewData => {
    const yearlyLogs = activityLogs.filter(log => {
      const logYear = new Date(log.date).getFullYear();
      const langMatch = languageFilter === 'Total' || log.language === languageFilter;
      return logYear === year && langMatch;
    });

    let totalMinutes = 0;
    const categoryMinutes: Record<ActivityCategory, number> = {
      [ActivityCategory.ACTIVE_IMMERSION]: 0,
      [ActivityCategory.PASSIVE_IMMERSION]: 0,
      [ActivityCategory.ACTIVE_STUDY]: 0,
      [ActivityCategory.PRODUCTION]: 0,
    };
    const skillMinutes: Record<Skill, number> = {
      [Skill.LISTENING]: 0,
      [Skill.READING]: 0,
      [Skill.SPEAKING]: 0,
      [Skill.WRITING]: 0,
      [Skill.STUDY]: 0,
    };
    const subActivityFrequency: Record<string, number> = {};
    const activeDaysSet = new Set<string>();

    yearlyLogs.forEach(log => {
      totalMinutes += log.durationMinutes;
      categoryMinutes[log.category] = (categoryMinutes[log.category] || 0) + log.durationMinutes;
      activeDaysSet.add(log.date);

      const activityDetail = activityDetailsMap.get(log.subActivity);
      if (activityDetail?.skill) {
        skillMinutes[activityDetail.skill] = (skillMinutes[activityDetail.skill] || 0) + log.durationMinutes;
      } else { 
          switch(log.category) {
              case ActivityCategory.ACTIVE_IMMERSION:
              case ActivityCategory.PASSIVE_IMMERSION:
                  skillMinutes[Skill.LISTENING] += log.durationMinutes; 
                  break;
              case ActivityCategory.ACTIVE_STUDY:
                  skillMinutes[Skill.STUDY] += log.durationMinutes;
                  break;
              case ActivityCategory.PRODUCTION: 
                  skillMinutes[Skill.SPEAKING] += log.durationMinutes;
                  break;
          }
      }
      subActivityFrequency[log.subActivity] = (subActivityFrequency[log.subActivity] || 0) + log.durationMinutes;
    });

    let topSubActivity: { name: string; hours: number } | null = null;
    if (Object.keys(subActivityFrequency).length > 0) {
      const topName = Object.entries(subActivityFrequency).sort((a, b) => b[1] - a[1])[0][0];
      topSubActivity = { name: topName, hours: parseFloat((subActivityFrequency[topName] / 60).toFixed(1)) };
    }

    return {
      totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
      activeDays: activeDaysSet.size,
      topSubActivity,
      categoryBreakdown: Object.entries(categoryMinutes).map(([name, value]) => ({ name: name as ActivityCategory, value })).filter(item => item.value > 0),
      skillBreakdown: Object.entries(skillMinutes).map(([name, value]) => ({ name: name as Skill, value })).filter(item => item.value > 0),
    };
  }, [activityLogs]);

  const toggleFavoriteActivity = useCallback((activityName: string) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const currentFavorites = prev.favoriteActivities || [];
      let updatedFavorites;
      if (currentFavorites.includes(activityName)) {
        updatedFavorites = currentFavorites.filter(name => name !== activityName);
      } else {
        updatedFavorites = [...currentFavorites, activityName];
      }
      const newProfile = { ...prev, favoriteActivities: updatedFavorites };
      storageService.setItem(USER_PROFILE_KEY, newProfile);
      return newProfile;
    });
  }, []);


  return (
    <AppContext.Provider value={{
      userProfile, activityLogs, userGoals, dailyTargets, resources, savedDailyRoutines, 
      isLoading, isInitialLoadComplete, appTheme, 
      initializeUserProfile, updateUserProfile, updateAppTheme,
      addActivityLog, updateActivityLog, deleteActivityLog,
      addUserGoal, updateUserGoal, toggleUserGoal, deleteUserGoal,
      addDailyTarget, updateDailyTarget, deleteDailyTarget, saveCurrentDailyTargetsAsRoutine, loadDailyRoutine, deleteDailyRoutine, updateSavedDailyRoutine,
      addResource, updateResource, deleteResource, getCurrentStageDetails,
      exportAppData, importAppData, resetAllData,
      getAvailableReportYears, getYearInReviewData,
      toggleFavoriteActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};