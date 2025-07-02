import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { UserProfile, ActivityLogEntry, Language, AntimethodStage, UserGoal, DailyActivityGoal, Resource, SavedDailyRoutine, AppDataExport, TimerMode, AppTheme, AppView, YearInReviewData, ActivityCategory, Skill, ActivityDetailType, DashboardCardDisplayMode, RewardItem } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_RESOURCES, STAGE_DETAILS, DEFAULT_DAILY_GOALS, AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS, LEARNING_DAY_POINTS_AWARD, HABIT_POINTS_MAP, DEFAULT_DASHBOARD_CARD_DISPLAY_MODE, AVAILABLE_REWARDS, ALL_REWARD_DEFINITIONS, HOUR_MILESTONES } from '../constants';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

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

interface AppContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  activityLogs: ActivityLogEntry[];
  userGoals: UserGoal[];
  dailyTargets: DailyActivityGoal[];
  resources: Resource[];
  savedDailyRoutines: SavedDailyRoutine[];
  isLoading: boolean;
  isInitialLoadComplete: boolean;
  appTheme: AppTheme;
  
  // Auth methods
  signInWithPassword: typeof supabase.auth.signInWithPassword;
  signUp: typeof supabase.auth.signUp;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;

  initializeUserProfile: (profile: UserProfile) => Promise<{ success: boolean; error?: any }>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateAppTheme: (theme: AppTheme, fromRewardOrCode?: boolean) => void;

  addActivityLog: (logData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateActivityLog: (log: ActivityLogEntry) => Promise<void>;
  deleteActivityLog: (logId: string) => Promise<void>;
  
  addUserGoal: (goalData: Omit<UserGoal, 'id' | 'achieved'>) => void;
  updateUserGoal: (updatedGoal: UserGoal) => void; 
  toggleUserGoal: (goalId: string) => void;
  deleteUserGoal: (goalId: string) => void;
  
  addDailyTarget: (targetData: Omit<DailyActivityGoal, 'id' | 'creationDate'>) => void;
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
  importAppData: (data: AppDataExport) => Promise<{success: boolean, error?: string}>;
  resetAllData: () => void;

  getAvailableReportYears: () => number[];
  getYearInReviewData: (year: number, language: Language | 'Total') => YearInReviewData;
  getOverallHabitConsistency: () => number;
  getProfileFollowCounts: (profileId: string) => Promise<{ followers: number; following: number }>;

  toggleFavoriteActivity: (activityName: string) => void;

  awardHabitPoints: (habitHealthPercentageForToday: number) => void;
  purchaseReward: (rewardId: string, bypassCost?: boolean) => boolean;
  activateFlair: (flairId: string | null) => void;
  getRewardById: (rewardId: string) => RewardItem | undefined;
  unlockRewardById: (rewardId: string) => boolean;

  addCustomActivity: (activity: ActivityDetailType) => void;
  deleteCustomActivity: (activityName: string) => void;
  getCombinedActivities: () => ActivityDetailType[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const activityDetailsMap = new Map<string, ActivityDetailType>(
  ANTIMETHOD_ACTIVITIES_DETAILS.map(detail => [detail.name, detail])
);

function loadDataWithMigration<T>(
    currentKey: string,
    oldKeys: string[],
    defaultValue: T,
    migrationFunction?: (data: any) => T
): T {
    let data = storageService.getItem<T>(currentKey);
    if (data === null) {
        for (const oldKey of oldKeys) {
            const oldData = storageService.getItem<any>(oldKey);
            if (oldData !== null) {
                data = migrationFunction ? migrationFunction(oldData) : oldData as T;
                storageService.setItem(currentKey, data);
                storageService.removeItem(oldKey);
                break;
            }
        }
    } else if (migrationFunction) {
        const migratedData = migrationFunction(data);
        if (JSON.stringify(data) !== JSON.stringify(migratedData)) {
            data = migratedData;
            storageService.setItem(currentKey, data);
        }
    }
    return data === null ? defaultValue : data;
}

const migrateActivityLogs = (data: any[]): ActivityLogEntry[] => {
  return data.map(log => {
    let migratedLog = { ...log };
    if (migratedLog.durationMinutes !== undefined && migratedLog.durationSeconds === undefined) {
      migratedLog.durationSeconds = migratedLog.durationMinutes * 60;
      delete migratedLog.durationMinutes;
    }
     if (migratedLog.subActivity) {
      migratedLog.sub_activity = migratedLog.subActivity;
      delete migratedLog.subActivity;
    }
    return { ...migratedLog, customTitle: migratedLog.customTitle || undefined };
  });
};

const migrateUserProfile = (data: any): UserProfile | null => {
    if (!data) return null;
    let migrated = { ...data };
    if (migrated.defaultLogDurationMinutes !== undefined && migrated.defaultLogDurationSeconds === undefined) {
        migrated.defaultLogDurationSeconds = migrated.defaultLogDurationMinutes * 60;
        delete migrated.defaultLogDurationMinutes;
    }
    if (!Array.isArray(migrated.customActivities)) {
        migrated.customActivities = [];
    }
    if (migrated.name && !migrated.display_name) {
        migrated.display_name = migrated.name;
        delete migrated.name;
    }
    return migrated;
};

const migrateDailyTargets = (data: any[]): DailyActivityGoal[] => {
  return data.map(target => {
    let migrated = { ...target };
    migrated.creationDate = migrated.creationDate || DEFAULT_HABIT_CREATION_DATE;
    if (migrated.minMinutesTotal !== undefined && migrated.minSecondsTotal === undefined) {
      migrated.minSecondsTotal = migrated.minMinutesTotal * 60;
      delete migrated.minMinutesTotal;
    }
    if (migrated.optimalMinutesTotal !== undefined && migrated.optimalSecondsTotal === undefined) {
        migrated.optimalSecondsTotal = migrated.optimalMinutesTotal * 60;
        delete migrated.optimalMinutesTotal;
    }
    return migrated;
  });
};

const migrateSavedRoutines = (data: any[]): SavedDailyRoutine[] => {
    return data.map(routine => ({
        ...routine,
        targets: migrateDailyTargets(routine.targets || []),
    }));
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [dailyTargets, setDailyTargets] = useState<DailyActivityGoal[]>(DEFAULT_DAILY_GOALS); 
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [savedDailyRoutines, setSavedDailyRoutines] = useState<SavedDailyRoutine[]>([]);
  const [appTheme, setAppTheme] = useState<AppTheme>(DEFAULT_APP_THEME);
  
  const [isLoading, setIsLoading] = useState(true); // General loading state
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Authentication listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialLoadComplete(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data loader for user profile, goals, etc. from local storage, and activity logs from Supabase.
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const storedProfile = loadDataWithMigration<UserProfile | null>(USER_PROFILE_KEY, OLD_USER_PROFILE_KEYS, null, migrateUserProfile);
      const storedGoals = loadDataWithMigration<UserGoal[]>(USER_GOALS_KEY, OLD_USER_GOALS_KEYS, []);
      const storedTargets = loadDataWithMigration<DailyActivityGoal[]>(DAILY_TARGETS_KEY, OLD_DAILY_TARGETS_KEYS, DEFAULT_DAILY_GOALS, migrateDailyTargets);
      const storedSavedRoutines = loadDataWithMigration<SavedDailyRoutine[]>(SAVED_DAILY_ROUTINES_KEY, OLD_SAVED_ROUTINES_KEYS, [], migrateSavedRoutines);
      const storedResources = storageService.getItem<Resource[]>(APP_RESOURCES_KEY, INITIAL_RESOURCES);

      // Load activity logs from Supabase if session exists
      if (session?.user) {
        const { data: logs, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching activity logs:", error);
          setActivityLogs([]);
        } else {
          setActivityLogs(logs || []);
        }
      } else {
        // No session, ensure logs are cleared
        setActivityLogs([]);
      }

      if (storedProfile) {
         const profileWithDefaults: UserProfile = {
          ...storedProfile,
          learningDaysCount: storedProfile.learningDaysCount || 0,
          focusPoints: storedProfile.focusPoints || 0,
          unlockedRewards: storedProfile.unlockedRewards || [],
          profileFlairId: storedProfile.profileFlairId || null,
          lastActivityDateByLanguage: storedProfile.lastActivityDateByLanguage || {},
          lastHabitPointsAwardDate: storedProfile.lastHabitPointsAwardDate || null,
          lastRedeemAttemptTimestamp: storedProfile.lastRedeemAttemptTimestamp || undefined,
          defaultLogDurationSeconds: storedProfile.defaultLogDurationSeconds ?? DEFAULT_LOG_DURATION_SECONDS,
          defaultLogTimerMode: storedProfile.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
          theme: storedProfile.theme ?? DEFAULT_APP_THEME,
          learningLanguages: storedProfile.learningLanguages || [],
          favoriteActivities: storedProfile.favoriteActivities || [],
          dashboardCardDisplayMode: storedProfile.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
          customActivities: storedProfile.customActivities || [],
        };
        setUserProfile(profileWithDefaults);
        setAppTheme(profileWithDefaults.theme!);
      } else {
        setAppTheme(DEFAULT_APP_THEME);
      }
      
      setUserGoals(storedGoals);
      setDailyTargets(storedTargets);
      setSavedDailyRoutines(storedSavedRoutines);
      setResources(storedResources || INITIAL_RESOURCES);
      
      setIsLoading(false);
    };

    if (isInitialLoadComplete) {
      loadData();
    }
  }, [isInitialLoadComplete, session]);
  
  const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserProfile(null);
      setActivityLogs([]);
      setUserGoals([]);
      setDailyTargets([]);
      setSavedDailyRoutines([]);
    }
    return { error };
  };

  const updateAppTheme = useCallback((theme: AppTheme, fromRewardOrCode: boolean = false) => {
    setAppTheme(theme);
    if (userProfile && !fromRewardOrCode) {
      const updatedProfile = { ...userProfile, theme };
      setUserProfile(updatedProfile);
      storageService.setItem(USER_PROFILE_KEY, updatedProfile);
    }
  }, [userProfile]);

  const initializeUserProfile = useCallback(async (profile: UserProfile): Promise<{ success: boolean; error?: any }> => {
    if (!session?.user) {
        console.error("No user session found to initialize profile.");
        return { success: false, error: new Error("No user session") };
    }
    const initialTheme = profile.theme ?? DEFAULT_APP_THEME;

    const profileToSync = {
        id: session.user.id,
        username: profile.username,
        display_name: profile.display_name,
        current_stage: profile.currentStage,
        avatar_url: session.user.user_metadata.avatar_url,
        theme: initialTheme,
        focus_points: profile.focusPoints || 0,
        profile_flair_id: profile.profileFlairId || null,
        learning_languages: profile.learningLanguages || [],
        learning_days_count: profile.learningDaysCount || 0,
    };

    const { error } = await supabase.from('profiles').update(profileToSync).eq('id', session.user.id);

    if (error) {
        console.error("Error updating profile in Supabase:", error);
        return { success: false, error };
    }
    
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
        defaultLogDurationSeconds: profile.defaultLogDurationSeconds ?? DEFAULT_LOG_DURATION_SECONDS,
        defaultLogTimerMode: profile.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
        primaryLanguage: initialPrimaryLanguage,
        theme: initialTheme,
        favoriteActivities: profile.favoriteActivities || [],
        dashboardCardDisplayMode: profile.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
        goals: (profile.goals || []).map(g => ({ ...g, currentValue: g.currentValue ?? 0, targetValue: g.targetValue ?? 0, unit: g.unit ?? '' })),
        learningDaysCount: profile.learningDaysCount || 0,
        focusPoints: profile.focusPoints || 0,
        unlockedRewards: profile.unlockedRewards || [],
        profileFlairId: profile.profileFlairId || null,
        lastActivityDateByLanguage: profile.lastActivityDateByLanguage || {},
        lastHabitPointsAwardDate: profile.lastHabitPointsAwardDate || null,
        lastRedeemAttemptTimestamp: profile.lastRedeemAttemptTimestamp || undefined,
        customActivities: profile.customActivities || [],
    };
    setUserProfile(profileWithDefaults);
    setAppTheme(initialTheme);
    storageService.setItem(USER_PROFILE_KEY, profileWithDefaults);
    setUserGoals(profileWithDefaults.goals);
    storageService.setItem(USER_GOALS_KEY, profileWithDefaults.goals);
    return { success: true };
  }, [session]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      let profileInProgress = { ...prev, ...updates };
      profileInProgress.learningLanguages = updates.learningLanguages !== undefined ? updates.learningLanguages : prev.learningLanguages;
      profileInProgress.favoriteActivities = updates.favoriteActivities !== undefined ? updates.favoriteActivities : prev.favoriteActivities;
      profileInProgress.unlockedRewards = updates.unlockedRewards !== undefined ? updates.unlockedRewards : prev.unlockedRewards;
      profileInProgress.customActivities = updates.customActivities !== undefined ? updates.customActivities : prev.customActivities;
      
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
        defaultLogDurationSeconds: profileInProgress.defaultLogDurationSeconds ?? DEFAULT_LOG_DURATION_SECONDS,
        defaultLogTimerMode: profileInProgress.defaultLogTimerMode ?? DEFAULT_LOG_TIMER_MODE,
        theme: profileInProgress.theme ?? DEFAULT_APP_THEME,
        dashboardCardDisplayMode: profileInProgress.dashboardCardDisplayMode ?? DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
        learningDaysCount: profileInProgress.learningDaysCount ?? 0,
        focusPoints: profileInProgress.focusPoints ?? 0,
        profileFlairId: profileInProgress.profileFlairId !== undefined ? profileInProgress.profileFlairId : prev.profileFlairId,
        lastActivityDateByLanguage: profileInProgress.lastActivityDateByLanguage ?? {},
        lastHabitPointsAwardDate: profileInProgress.lastHabitPointsAwardDate !== undefined ? profileInProgress.lastHabitPointsAwardDate : prev.lastHabitPointsAwardDate,
        lastRedeemAttemptTimestamp: profileInProgress.lastRedeemAttemptTimestamp !== undefined ? profileInProgress.lastRedeemAttemptTimestamp : prev.lastRedeemAttemptTimestamp,
      };
      
      if (updates.goals) { 
        newProfile.goals = updates.goals.map(g => ({...g, currentValue: g.currentValue ?? 0, targetValue: g.targetValue ?? 0, unit: g.unit ?? ''}));
         setUserGoals(newProfile.goals); 
         storageService.setItem(USER_GOALS_KEY, newProfile.goals);
      }
      
      if (newProfile.theme && (!prev.theme || newProfile.theme !== prev.theme)) {
        setAppTheme(newProfile.theme);
      }
  
      storageService.setItem(USER_PROFILE_KEY, newProfile);
      return newProfile;
    });
  }, [setAppTheme, setUserGoals]);

  const addActivityLog = useCallback(async (logData: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) {
      console.error("No user session found to add activity log.");
      return;
    }

    const { data: previousLogs, error: previousLogsError } = await supabase
        .from('activity_logs')
        .select('durationSeconds')
        .eq('user_id', session.user.id)
        .eq('language', logData.language);

    if (previousLogsError) {
      console.error("Could not fetch previous logs for milestone check", previousLogsError);
    }
    const previousTotalSeconds = previousLogs?.reduce((sum, log) => sum + log.durationSeconds, 0) || 0;

    const logToInsert = { ...logData, user_id: session.user.id };

    const { data: newLog, error } = await supabase
      .from('activity_logs')
      .insert(logToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error adding activity log:", error);
      return;
    }
    
    setActivityLogs(prev => [newLog, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const currentTotalSeconds = previousTotalSeconds + newLog.durationSeconds;
    const milestoneHoursCrossed = HOUR_MILESTONES.find(
        milestone => (previousTotalSeconds / 3600) < milestone && (currentTotalSeconds / 3600) >= milestone
    );
    if (milestoneHoursCrossed) {
        await supabase.from('feed_items').insert({
            user_id: session.user.id,
            type: 'milestone_achieved',
            content: { hours: milestoneHoursCrossed, language: newLog.language }
        });
    }

    setUserProfile(prevProfile => {
      if (!prevProfile) return null;
      let updatedProfile = { ...prevProfile };
      const lastDateForLang = prevProfile.lastActivityDateByLanguage[logData.language] || '';
      if (logData.date > lastDateForLang) {
        updatedProfile = {
          ...updatedProfile,
          learningDaysCount: (prevProfile.learningDaysCount || 0) + 1,
          focusPoints: (prevProfile.focusPoints || 0) + LEARNING_DAY_POINTS_AWARD,
          lastActivityDateByLanguage: {
            ...prevProfile.lastActivityDateByLanguage,
            [logData.language]: logData.date,
          }
        };
      }
      storageService.setItem(USER_PROFILE_KEY, updatedProfile);
      return updatedProfile;
    });
  }, [session]);
  
  const updateActivityLog = useCallback(async (updatedLog: ActivityLogEntry) => {
    const { id, ...logToUpdate } = updatedLog;
    const { data: newUpdatedLog, error } = await supabase
      .from('activity_logs')
      .update(logToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity log:", error);
      return;
    }

    if (newUpdatedLog) {
      setActivityLogs(prevLogs => prevLogs.map(log => (log.id === newUpdatedLog.id ? newUpdatedLog : log)));
    }
  }, []);

  const deleteActivityLog = useCallback(async (logId: string) => {
    const { error } = await supabase.from('activity_logs').delete().eq('id', logId);

    if (error) {
      console.error("Error deleting activity log:", error);
      return;
    }
    
    setActivityLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
  }, []);

  const addUserGoal = useCallback((goalData: Omit<UserGoal, 'id' | 'achieved'>) => {
    setUserGoals(prev => {
      const newGoal: UserGoal = {
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        achieved: false,
        ...goalData,
        currentValue: goalData.currentValue || 0,
        targetValue: goalData.targetValue || 0,
        unit: goalData.unit || '',
      };
      const newGoals = [...prev, newGoal];
      storageService.setItem(USER_GOALS_KEY, newGoals);
      return newGoals;
    });
  }, []);

  const updateUserGoal = useCallback((updatedGoal: UserGoal) => {
    setUserGoals(prev => {
      const newGoals = prev.map(g => g.id === updatedGoal.id ? { ...updatedGoal } : g);
      storageService.setItem(USER_GOALS_KEY, newGoals);
      return newGoals;
    });
  }, []);

  const toggleUserGoal = useCallback((goalId: string) => {
    setUserGoals(prev => {
      const newGoals = prev.map(goal => 
        goal.id === goalId ? { ...goal, achieved: !goal.achieved } : goal
      );
      storageService.setItem(USER_GOALS_KEY, newGoals);
      return newGoals;
    });
  }, []);

  const deleteUserGoal = useCallback((goalId: string) => {
    setUserGoals(prev => {
      const newGoals = prev.filter(goal => goal.id !== goalId);
      storageService.setItem(USER_GOALS_KEY, newGoals);
      return newGoals;
    });
  }, []);

  const addDailyTarget = useCallback((targetData: Omit<DailyActivityGoal, 'id' | 'creationDate'>) => {
    setDailyTargets(prev => {
      const newTarget: DailyActivityGoal = { 
        ...targetData, 
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        creationDate: new Date().toISOString().split('T')[0]
      };
      const newTargets = [...prev, newTarget];
      storageService.setItem(DAILY_TARGETS_KEY, newTargets);
      return newTargets;
    });
  }, []);

  const updateDailyTarget = useCallback((updatedTarget: DailyActivityGoal) => {
    setDailyTargets(prev => {
      const newTargets = prev.map(t => t.id === updatedTarget.id ? updatedTarget : t);
      storageService.setItem(DAILY_TARGETS_KEY, newTargets);
      return newTargets;
    });
  }, []);
  
  const deleteDailyTarget = useCallback((targetId: string) => {
    setDailyTargets(prev => {
      const newTargets = prev.filter(t => t.id !== targetId);
      storageService.setItem(DAILY_TARGETS_KEY, newTargets);
      return newTargets;
    });
  }, []);

  const saveCurrentDailyTargetsAsRoutine = useCallback((name: string) => {
      if (dailyTargets.length === 0) {
          console.warn("Attempted to save an empty routine.");
          return;
      }
      const newRoutine: SavedDailyRoutine = {
          id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
          name: name,
          targets: [...dailyTargets],
      };
      setSavedDailyRoutines(prev => {
          const newRoutines = [...prev, newRoutine];
          storageService.setItem(SAVED_DAILY_ROUTINES_KEY, newRoutines);
          return newRoutines;
      });
  }, [dailyTargets]);

  const loadDailyRoutine = useCallback((routineId: string) => {
      const routineToLoad = savedDailyRoutines.find(r => r.id === routineId);
      if (routineToLoad) {
          const loadedTargets = migrateDailyTargets(routineToLoad.targets); // Ensure migration on load
          setDailyTargets(loadedTargets);
          storageService.setItem(DAILY_TARGETS_KEY, loadedTargets);
      }
  }, [savedDailyRoutines]);

  const deleteDailyRoutine = useCallback((routineId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta plantilla de rutina? Esta acción no se puede deshacer.")) {
      setSavedDailyRoutines(prev => {
        const newRoutines = prev.filter(r => r.id !== routineId);
        storageService.setItem(SAVED_DAILY_ROUTINES_KEY, newRoutines);
        return newRoutines;
      });
    }
  }, []);

  const updateSavedDailyRoutine = useCallback((routine: SavedDailyRoutine) => {
      setSavedDailyRoutines(prev => {
          const newRoutines = prev.map(r => r.id === routine.id ? routine : r);
          storageService.setItem(SAVED_DAILY_ROUTINES_KEY, newRoutines);
          return newRoutines;
      });
  }, []);


  const addResource = useCallback((resourceData: Omit<Resource, 'id'>) => {
    setResources(prev => {
      const newResource: Resource = {
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        ...resourceData,
      };
      const updatedResources = [...prev, newResource];
      storageService.setItem(APP_RESOURCES_KEY, updatedResources);
      return updatedResources;
    });
  }, []);

  const updateResource = useCallback((updatedResource: Resource) => {
    setResources(prev => {
      const updatedResources = prev.map(res => res.id === updatedResource.id ? updatedResource : res);
      storageService.setItem(APP_RESOURCES_KEY, updatedResources);
      return updatedResources;
    });
  }, []);

  const deleteResource = useCallback((resourceId: string) => {
    setResources(prev => {
      const updatedResources = prev.filter(res => res.id !== resourceId);
      storageService.setItem(APP_RESOURCES_KEY, updatedResources);
      return updatedResources;
    });
  }, []);

  const getCurrentStageDetails = useCallback(() => {
    if (userProfile && userProfile.currentStage && STAGE_DETAILS[userProfile.currentStage]) {
      return STAGE_DETAILS[userProfile.currentStage];
    }
    return null;
  }, [userProfile]);

  const exportAppData = useCallback((): AppDataExport => {
    return {
      userProfile: storageService.getItem<UserProfile>(USER_PROFILE_KEY),
      activityLogs: activityLogs, // Use state which is sourced from Supabase
      userGoals: storageService.getItem<UserGoal[]>(USER_GOALS_KEY) || [],
      dailyTargets: storageService.getItem<DailyActivityGoal[]>(DAILY_TARGETS_KEY) || [],
      resources: storageService.getItem<Resource[]>(APP_RESOURCES_KEY) || INITIAL_RESOURCES,
      savedDailyRoutines: storageService.getItem<SavedDailyRoutine[]>(SAVED_DAILY_ROUTINES_KEY) || [],
    };
  }, [activityLogs]);

  const importAppData = useCallback(async (data: AppDataExport): Promise<{success: boolean, error?: string}> => {
    // 1. Restore local data (profile, goals, routines, etc.)
    if (data.userProfile) {
        const migratedProfile = migrateUserProfile(data.userProfile);
        if (migratedProfile) {
            setUserProfile(migratedProfile);
            storageService.setItem(USER_PROFILE_KEY, migratedProfile);
            if (migratedProfile.theme) setAppTheme(migratedProfile.theme);
        }
    }
    if (data.userGoals) {
        setUserGoals(data.userGoals);
        storageService.setItem(USER_GOALS_KEY, data.userGoals);
    }
    if (data.dailyTargets) {
        const migratedTargets = migrateDailyTargets(data.dailyTargets);
        setDailyTargets(migratedTargets);
        storageService.setItem(DAILY_TARGETS_KEY, migratedTargets);
    }
    if (data.savedDailyRoutines) {
        const migratedRoutines = migrateSavedRoutines(data.savedDailyRoutines);
        setSavedDailyRoutines(migratedRoutines);
        storageService.setItem(SAVED_DAILY_ROUTINES_KEY, migratedRoutines);
    }
    if (data.resources) {
        setResources(data.resources);
        storageService.setItem(APP_RESOURCES_KEY, data.resources);
    }

    // 2. Upload activity logs to Supabase if user is logged in
    if (session?.user && data.activityLogs && data.activityLogs.length > 0) {
        const logsToUpload = data.activityLogs.map(({ id, ...log }) => ({
            ...log,
            user_id: session.user!.id,
            // Let the DB assign id and created_at
        }));
        
        const { error } = await supabase.from('activity_logs').insert(logsToUpload);

        if (error) {
            console.error("Error batch inserting logs:", error);
            return { success: false, error: "No se pudieron subir los registros de actividad a la nube." };
        }

        // Successfully uploaded, now refresh logs from the cloud
        const { data: refreshedLogs, error: refreshError } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });
        
        if (refreshError) {
             return { success: false, error: "Registros subidos, pero no se pudo refrescar la lista." };
        }
        
        setActivityLogs(refreshedLogs || []);
    }
    
    // Clear old local log data if it exists, as it's now in the cloud
    storageService.removeItem(ACTIVITY_LOGS_KEY);
    OLD_ACTIVITY_LOGS_KEYS.forEach(key => storageService.removeItem(key));

    return { success: true };
  }, [session, setAppTheme]);
  
  const resetAllData = useCallback(() => {
      const keysToRemove = [
        USER_PROFILE_KEY, ACTIVITY_LOGS_KEY, USER_GOALS_KEY, DAILY_TARGETS_KEY, APP_RESOURCES_KEY, SAVED_DAILY_ROUTINES_KEY,
        ...OLD_USER_PROFILE_KEYS, ...OLD_ACTIVITY_LOGS_KEYS, ...OLD_USER_GOALS_KEYS, ...OLD_DAILY_TARGETS_KEYS, ...OLD_SAVED_ROUTINES_KEYS
      ];
      keysToRemove.forEach(key => storageService.removeItem(key));
      
      setUserProfile(null);
      setActivityLogs([]);
      setUserGoals([]);
      setDailyTargets([]);
      setSavedDailyRoutines([]);
      setResources(INITIAL_RESOURCES);
      signOut(); // Also sign out from supabase to complete reset
  }, [signOut]);

  const getAvailableReportYears = useCallback(() => {
    if (activityLogs.length === 0) return [];
    const years = new Set(activityLogs.map(log => new Date(log.date).getFullYear()));
    return Array.from(years).sort((a,b) => b-a);
  }, [activityLogs]);

  const getYearInReviewData = useCallback((year: number, language: Language | 'Total'): YearInReviewData => {
    const logsForYear = activityLogs.filter(log => {
        const logYear = new Date(log.date).getFullYear();
        const langMatch = language === 'Total' || log.language === language;
        return logYear === year && langMatch;
    });

    const totalSeconds = logsForYear.reduce((sum, log) => sum + log.durationSeconds, 0);
    const activeDays = new Set(logsForYear.map(log => log.date)).size;
    
    const subActivityHours: Record<string, number> = {};
    const categorySeconds: Record<ActivityCategory, number> = { [ActivityCategory.ACTIVE_IMMERSION]: 0, [ActivityCategory.PASSIVE_IMMERSION]: 0, [ActivityCategory.ACTIVE_STUDY]: 0, [ActivityCategory.PRODUCTION]: 0 };
    const skillSeconds: Record<Skill, number> = { [Skill.LISTENING]: 0, [Skill.READING]: 0, [Skill.SPEAKING]: 0, [Skill.WRITING]: 0, [Skill.STUDY]: 0 };

    const combinedActivities = [...ANTIMETHOD_ACTIVITIES_DETAILS, ...(userProfile?.customActivities || [])];
    const detailsMap = new Map(combinedActivities.map(detail => [detail.name, detail]));

    logsForYear.forEach(log => {
      subActivityHours[log.sub_activity] = (subActivityHours[log.sub_activity] || 0) + log.durationSeconds / 3600;
      categorySeconds[log.category] += log.durationSeconds;
      const activityDetail = detailsMap.get(log.sub_activity);
      if (activityDetail?.skill) {
          skillSeconds[activityDetail.skill] += log.durationSeconds;
      }
    });

    const topSubActivity = Object.entries(subActivityHours).sort((a,b) => b[1] - a[1])[0];

    return {
      totalHours: parseFloat((totalSeconds / 3600).toFixed(1)),
      activeDays,
      topSubActivity: topSubActivity ? { name: topSubActivity[0], hours: parseFloat(topSubActivity[1].toFixed(1)) } : null,
      categoryBreakdown: Object.entries(categorySeconds).map(([name, value]) => ({ name: name as ActivityCategory, value })).filter(d => d.value > 0),
      skillBreakdown: Object.entries(skillSeconds).map(([name, value]) => ({ name: name as Skill, value })).filter(d => d.value > 0),
    };

  }, [activityLogs, userProfile?.customActivities]);

  const getOverallHabitConsistency = useCallback((): number => {
    if (dailyTargets.length === 0) return 0;

    const habitCreationDate = new Date(dailyTargets.reduce((oldest, current) => 
        new Date(current.creationDate) < new Date(oldest) ? current.creationDate : oldest, 
        dailyTargets[0].creationDate
    ));
    const today = new Date();
    const daySpan = Math.max(1, Math.round((today.getTime() - habitCreationDate.getTime()) / (1000 * 3600 * 24)));

    let totalScore = 0;
    for (let i = 0; i < daySpan; i++) {
        const date = new Date(habitCreationDate);
        date.setDate(habitCreationDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const logsOnThisDay = activityLogs.filter(log => log.date === dateString && userProfile?.learningLanguages.includes(log.language));

        let dayMinTarget = 0;
        let dayAchieved = 0;
        dailyTargets.forEach(habit => {
            const minTargetForHabit = habit.minSecondsTotal;
            if (minTargetForHabit > 0) {
                dayMinTarget += minTargetForHabit;
                const achievedForHabit = logsOnThisDay
                    .filter(log => habit.components.some(c => c.category === log.category))
                    .reduce((sum, log) => sum + log.durationSeconds, 0);
                dayAchieved += Math.min(achievedForHabit, minTargetForHabit);
            }
        });
        
        if (dayMinTarget > 0) {
            totalScore += (dayAchieved / dayMinTarget);
        } else {
             totalScore += (logsOnThisDay.length > 0 ? 1 : 0);
        }
    }
    
    return daySpan > 0 ? (totalScore / daySpan) * 100 : 0;
  }, [dailyTargets, activityLogs, userProfile?.learningLanguages]);

  const getProfileFollowCounts = useCallback(async (profileId: string): Promise<{ followers: number; following: number }> => {
    const { count: followers, error: followersError } = await supabase
      .from('relationships')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profileId);

    const { count: following, error: followingError } = await supabase
      .from('relationships')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profileId);

    if (followersError || followingError) {
      console.error("Error fetching follow counts:", followersError || followingError);
      return { followers: 0, following: 0 };
    }

    return { followers: followers || 0, following: following || 0 };
  }, []);

  const toggleFavoriteActivity = useCallback((activityName: string) => {
    setUserProfile(prev => {
        if (!prev) return null;
        const currentFavorites = prev.favoriteActivities || [];
        const newFavorites = currentFavorites.includes(activityName)
            ? currentFavorites.filter(name => name !== activityName)
            : [...currentFavorites, activityName];
        const newProfile = { ...prev, favoriteActivities: newFavorites };
        storageService.setItem(USER_PROFILE_KEY, newProfile);
        return newProfile;
    });
  }, []);

  const awardHabitPoints = useCallback((habitHealthPercentageForToday: number) => {
      if (userProfile?.lastHabitPointsAwardDate === new Date().toISOString().split('T')[0]) {
          return; // Already awarded today
      }
      
      let pointsToAward = 0;
      if (habitHealthPercentageForToday >= 100) pointsToAward = HABIT_POINTS_MAP.FULL;
      else if (habitHealthPercentageForToday >= 75) pointsToAward = HABIT_POINTS_MAP.GOOD;
      else if (habitHealthPercentageForToday >= 40) pointsToAward = HABIT_POINTS_MAP.HALF;
      else if (habitHealthPercentageForToday > 0) pointsToAward = HABIT_POINTS_MAP.SOME;
      
      if (pointsToAward > 0) {
          updateUserProfile({ 
              focusPoints: (userProfile?.focusPoints || 0) + pointsToAward,
              lastHabitPointsAwardDate: new Date().toISOString().split('T')[0],
          });
      }
  }, [userProfile, updateUserProfile]);
  
  const purchaseReward = useCallback((rewardId: string, bypassCost: boolean = false): boolean => {
    const reward = ALL_REWARD_DEFINITIONS.find(r => r.id === rewardId);
    if (!reward || !userProfile || !session?.user?.id) return false;
    if (userProfile.unlockedRewards.includes(rewardId)) return false;

    const canAfford = userProfile.focusPoints >= reward.cost;
    if (!canAfford && !bypassCost) return false;

    const newFocusPoints = bypassCost ? userProfile.focusPoints : userProfile.focusPoints - reward.cost;
    const newUnlockedRewards = [...userProfile.unlockedRewards, rewardId];
    
    const updates: Partial<UserProfile> = {
        focusPoints: newFocusPoints,
        unlockedRewards: newUnlockedRewards,
    };

    if (reward.type === 'flair') {
        updates.profileFlairId = reward.id;
    }
    if (reward.type === 'theme' && reward.value) {
        updates.theme = reward.value as AppTheme;
        setAppTheme(reward.value as AppTheme);
    }
    updateUserProfile(updates);
    
    // Create feed item
    supabase.from('feed_items').insert({
        user_id: session.user.id,
        type: 'reward_unlocked',
        content: { reward_name: reward.name, reward_type: reward.type }
    }).then(({ error }) => {
        if (error) console.error("Error creating feed item for reward:", error);
    });

    return true;
}, [userProfile, session, updateUserProfile, setAppTheme]);


  const unlockRewardById = useCallback((rewardId: string): boolean => {
    return purchaseReward(rewardId, true); // Use bypassCost=true for code redemption
  }, [purchaseReward]);

  const activateFlair = useCallback((flairId: string | null) => {
      if (userProfile) {
          if (flairId === null || userProfile.unlockedRewards.includes(flairId)) {
            updateUserProfile({ profileFlairId: flairId });
          }
      }
  }, [userProfile, updateUserProfile]);
  
  const getRewardById = useCallback((rewardId: string): RewardItem | undefined => {
    return ALL_REWARD_DEFINITIONS.find(r => r.id === rewardId);
  }, []);

  const addCustomActivity = useCallback((activity: ActivityDetailType) => {
      updateUserProfile({ customActivities: [...(userProfile?.customActivities || []), activity] });
  }, [userProfile, updateUserProfile]);

  const deleteCustomActivity = useCallback((activityName: string) => {
      updateUserProfile({
          customActivities: (userProfile?.customActivities || []).filter(act => act.name !== activityName),
          favoriteActivities: (userProfile?.favoriteActivities || []).filter(fav => fav !== activityName),
      });
  }, [userProfile, updateUserProfile]);
  
  const getCombinedActivities = useCallback((): ActivityDetailType[] => {
    return [...ANTIMETHOD_ACTIVITIES_DETAILS, ...(userProfile?.customActivities || [])];
  }, [userProfile?.customActivities]);

  return (
    <AppContext.Provider value={{ 
        session, user, userProfile, activityLogs, userGoals, dailyTargets, resources, savedDailyRoutines,
        isLoading, isInitialLoadComplete, appTheme,
        signInWithPassword: supabase.auth.signInWithPassword,
        signUp: supabase.auth.signUp,
        signInWithGoogle,
        signOut,
        initializeUserProfile, updateUserProfile, updateAppTheme,
        addActivityLog, updateActivityLog, deleteActivityLog,
        addUserGoal, updateUserGoal, toggleUserGoal, deleteUserGoal,
        addDailyTarget, updateDailyTarget, deleteDailyTarget,
        saveCurrentDailyTargetsAsRoutine, loadDailyRoutine, deleteDailyRoutine, updateSavedDailyRoutine,
        addResource, updateResource, deleteResource,
        getCurrentStageDetails,
        exportAppData, importAppData, resetAllData,
        getAvailableReportYears, getYearInReviewData, getOverallHabitConsistency,
        getProfileFollowCounts,
        toggleFavoriteActivity,
        awardHabitPoints, purchaseReward, activateFlair, getRewardById, unlockRewardById,
        addCustomActivity, deleteCustomActivity, getCombinedActivities
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
