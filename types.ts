
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
  language: Language;
  category: ActivityCategory;
  subActivity: string; // e.g., "Netflix", "Duolingo", "Conversation"
  customTitle?: string; // NEW: Specific title like "Watching 'Squid Game' E1"
  durationMinutes: number;
  date: string; // ISO string YYYY-MM-DD
  startTime?: string; // Optional: HH:MM format for start time
  notes?: string;
}

export enum AntimethodStage {
  // ZERO = 0,    // Onboarding / Absolute Beginner - Removed as per new stage definitions
  ONE = 1,     // Foundations / Preparación Previa
  TWO = 2,     // Full Immersion / Inmersión Total
  THREE = 3,   // Towards Fluency / Free Flow Listening
  FOUR = 4,    // Mastery / Producción
}

export type TimerMode = 'manual' | 'stopwatch' | 'countdown';
export type AppTheme = 'light' | 'dark';

export type DashboardCardDisplayMode = 'both' | 'health_only' | 'streak_only' | 'combined' | 'none';

export interface UserProfile {
  name?: string;
  currentStage: AntimethodStage;
  learningLanguages: Language[];
  primaryLanguage?: Language; // For quick logging default
  goals: UserGoal[]; // Personalized goals
  defaultLogDurationMinutes?: number;
  defaultLogTimerMode?: TimerMode;
  theme?: AppTheme; // Added theme preference
  favoriteActivities?: string[]; // NEW: Array of activity names (using the unique 'name' from ActivityDetailType)
  dashboardCardDisplayMode?: DashboardCardDisplayMode; // NEW: For dashboard card visibility
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
  minMinutesTotal: number; // Minimum target duration for the entire habit
  optimalMinutesTotal: number; // Optimal target duration for the entire habit
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
  // WEEKLY_PLANNER = "/planner", // Removed
  GUIDES = "/guides",
  SETTINGS = "/settings", 
}

// For data export/import
export interface AppDataExport {
  userProfile: UserProfile | null;
  activityLogs: ActivityLogEntry[];
  userGoals: UserGoal[];
  dailyTargets: DailyActivityGoal[];
  resources: Resource[]; // Assuming resources can also be customized by user or app version
  savedDailyRoutines: SavedDailyRoutine[];
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
  categoryBreakdown: { name: ActivityCategory; value: number }[]; // value in minutes
  skillBreakdown: { name: Skill; value: number }[]; // value in minutes
}