

export enum Language {
  SPANISH = "Español",
  ENGLISH = "English",
  FRENCH = "Français",
  GERMAN = "Deutsch",
  ITALIAN = "Italiano",
  PORTUGUESE = "Português",
  JAPANESE = "日本語",
  KOREAN = "한국어",
  CHINESE = "中文",
  // Add more languages as needed
}

export enum ActivityCategory {
  ACTIVE_IMMERSION = "Inmersión Activa",
  PASSIVE_IMMERSION = "Inmersión Pasiva",
  ACTIVE_STUDY = "Estudio Activo",
  PRODUCTION = "Producción",
}

// New enum for skills
export enum Skill {
  LISTENING = "Listening",
  READING = "Reading",
  SPEAKING = "Speaking",
  WRITING = "Writing",
  STUDY = "Study", // For general study activities like vocab, grammar
}

export interface ActivityLogEntry {
  id: string;
  user_id: string; // Added to match Supabase table
  language: Language;
  category: ActivityCategory;
  sub_activity: string; // e.g., "Netflix", "Duolingo", "Conversation"
  custom_title: string | null; // NEW: Specific title like "Watching 'Squid Game' E1"
  duration_seconds: number;
  date: string; // ISO string YYYY-MM-DD
  start_time: string | null; // Optional: HH:MM format for start time
  notes: string | null;
  created_at: string; // Added to match Supabase table
}

export enum AntimethodStage {
  // ZERO = 0,    // Onboarding / Absolute Beginner - Removed as per new stage definitions
  ONE = 1,     // Foundations / Preparación Previa
  TWO = 2,     // Full Immersion / Inmersión Total
  THREE = 3,   // Towards Fluency / Free Flow Listening
  FOUR = 4,    // Mastery / Producción
}

export type TimerMode = 'manual' | 'stopwatch' | 'countdown';
export type AppTheme = 
  | 'light' 
  | 'dark' 
  | 'theme-zen' 
  | 'theme-neon' 
  | 'theme-ocean'
  | 'theme-japan-neon'  // New Theme
  | 'theme-cafe-parisien' // New Theme
  | 'theme-fiesta-brasil'; // New Theme

// Updated to reflect learning days instead of streak
export type DashboardCardDisplayMode = 
  | 'learning_days_and_health' // Replaces 'both'
  | 'health_only'
  | 'learning_days_only'       // Replaces 'streak_only'
  | 'combined'
  | 'none';

export interface SocialLinks {
  twitter?: string;
  youtube?: string;
  instagram?: string;
  website?: string;
  // Add more social links as needed
}

export interface UserProfile {
  username: string; // Unique username for profiles/social features
  display_name: string; // User's display name
  currentStage: AntimethodStage;
  learningLanguages: Language[];
  primaryLanguage?: Language; // For quick logging default
  goals: UserGoal[]; // Personalized goals
  defaultLogDurationSeconds?: number;
  defaultLogTimerMode?: TimerMode;
  theme?: AppTheme; // Added theme preference
  favoriteActivities?: string[]; // NEW: Array of activity names (using the unique 'name' from ActivityDetailType)
  dashboardCardDisplayMode?: DashboardCardDisplayMode; 
  customActivities?: ActivityDetailType[]; // NEW: To store user-created activities

  // Gamification fields
  learningDaysCountByLanguage: Record<Language, number>;
  lastHabitPointsAwardDate: string | null; // Tracks if habit points were awarded for today (overall)
  lastRedeemAttemptTimestamp?: number; // For basic rate limiting on redeem attempts

  // Social features
  isFollowing?: boolean; // NEW: Indicates if the current user is following this profile
  aboutMe?: string; // NEW: About me section for the profile
  socialLinks?: SocialLinks; // NEW: Social media links
}

export interface UserGoal {
  id: string;
  description: string;
  achieved: boolean;
  language?: Language; // Optional: goal specific to a language
  targetValue?: number; // For quantifiable goals (e.g., 5 books, 50 hours)
  currentValue?: number; // Current progress for quantifiable goals
  unit?: string; // Unit for quantifiable goals (e.g., "libros", "horas", "sesiones")
}

export interface ActivityComponent {
  category: ActivityCategory;
  // minMinutes and optimalMinutes removed from here
}

export interface DailyActivityGoal {
  id: string; // Unique ID for each custom habit
  customName: string; // User-defined name, e.g., "Bloque de Estudio Matutino"
  components: ActivityComponent[]; // Array of activity categories within this habit
  minSecondsTotal: number; // Minimum target duration for the entire habit
  optimalSecondsTotal: number; // Optimal target duration for the entire habit
  creationDate: string; // YYYY-MM-DD: Date the habit was created
}

// Renamed from Routine for clarity, as it stores DailyActivityGoal arrays
export interface SavedDailyRoutine {
  id:string;
  name: string;
  targets: DailyActivityGoal[];
}

export interface Resource {
  id: string;
  name: string;
  category: string; // e.g., "Trackers", "SRS", "Reading Assistants"
  description: string;
  link: string;
  isCommunityRecommended?: boolean;
  subCategory?: string; // Optional: For finer-grained grouping within a main category if needed
  platform?: string; // e.g. "Android", "iOS", "Web"
  cost?: string; // e.g. "Gratis", "De paga ($X USD)"
  notes?: string; // Any extra notes, like "⚠️ Basado en español"
}

export interface PlacementTestAnswers {
  language: Language;
  experience: string;
  understandsBasic: string;
  understandsWithSubs: string;
  understandsWithoutSubs: string;
  speakingComfort: string;
  mainGoal: string;
}

export interface GeminiPlacementResponse {
  stage: AntimethodStage;
  justification: string;
}

// For navigation within the app using HashRouter
export enum AppView {
  ONBOARDING = "/onboarding",
  DASHBOARD = "/dashboard",
  TRACKER = "/tracker",
  ROUTINES = "/routines",
  GUIDES = "/guides",
  SETTINGS = "/settings", 
  REWARDS = "/rewards", // New view for rewards
  LEADERBOARD = "/leaderboard", // New view for leaderboards
  FEED = "/feed", // New view for activity feed
  BULK_IMPORT = "/bulk-import", // New view for bulk import tool
}

// For data export/import
export interface AppDataExport {
  userProfile: UserProfile | null;
  activityLogs: ActivityLogEntry[];
  userGoals: UserGoal[];
  dailyTargets: DailyActivityGoal[];
  resources: Resource[]; // Assuming resources can also be customized by user or app version
  savedDailyRoutines: SavedDailyRoutine[];
  // customActivities is part of userProfile, so it's exported with it
}

// New type for items in ANTIMETHOD_ACTIVITIES_DETAILS for better type safety
export interface ActivityDetailType {
  name: string; // This should be unique and is used as ID for favorites
  description: string;
  category?: ActivityCategory;
  skill?: Skill; // Added skill property
}

export interface YearInReviewData {
  totalHours: number;
  activeDays: number;
  topSubActivity: { name: string; hours: number } | null;
  categoryBreakdown: { name: ActivityCategory; value: number }[]; // value in seconds
  skillBreakdown: { name: Skill; value: number }[]; // value in seconds
}

export interface DetailedActivityStats {
  totalHoursByLanguage: Record<Language, number>;
  totalHoursByCategory: Record<ActivityCategory, number>;
  topSubActivities: { name: string; hours: number }[];
}

// New type for Reward Items
export interface RewardItem {
  id: string; // Unique identifier for the reward (e.g., "flair_futuro", "theme_zen", "secret_flair_founder")
  name: string;
  description: string;
  type: 'theme' | 'flair' | 'content' | 'timer_sound' | 'points'; // Extend as needed
  cost: number; // In Focus Points (0 for secret/code-only rewards not meant for purchase)
  value?: string; // e.g., theme class name, flair text, content ID
  icon?: string; // Path or identifier for an icon
  category: 'Personalización Visual' | 'Perfil' | 'Contenido Exclusivo' | 'Secreto'; // For grouping in store or internal logic
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  total_seconds: number;
}

// New types for Activity Feed
export type FeedItemType = 'milestone_achieved' | 'reward_unlocked' | 'bulk_import';

export interface FeedItem {
  id: number;
  user_id: string;
  type: FeedItemType;
  content: {
    hours?: number;
    language?: Language;
    reward_name?: string;
    reward_type?: 'theme' | 'flair' | 'content';
  };
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
  } | null;
  like_count: number;
  user_has_liked: boolean;
}