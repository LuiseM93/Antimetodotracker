
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen.tsx';
import { DashboardScreen } from './features/dashboard/DashboardScreen.tsx';
import { TrackerScreen } from './features/tracker/TrackerScreen.tsx';
import { RoutinesScreen } from './features/routines/RoutinesScreen.tsx';
import { GuidesScreen } from './features/guides/GuidesScreen.tsx';
import { LogActivityScreen } from './features/tracker/LogActivityScreen.tsx'; 
import { SettingsScreen } from './features/settings/SettingsScreen.tsx'; 
import { RewardsScreen } from './features/rewards/RewardsScreen.tsx';
import { LeaderboardScreen } from './features/leaderboard/LeaderboardScreen.tsx'; // New
import { FeedScreen } from './features/feed/FeedScreen.tsx'; // New
import { AuthScreen } from './features/auth/Auth.tsx';
import { initializeOfflineSync } from './services/offlineQueueService.ts';

import { ProfileScreen } from './features/profile/ProfileScreen.tsx';
import { SearchScreen } from './features/search/SearchScreen.tsx'; // New
import { AppView } from './types.ts';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { MenuIcon } from './components/icons/MenuIcon.tsx';
import { Button } from './components/Button.tsx';
import { SplashScreen } from './features/splash/SplashScreen.tsx';


// This component renders the main application layout for an authenticated user with a profile.
const AuthenticatedAppLayout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  const isLogScreenPath = location.pathname.startsWith('/log');
  const mainContentPadding = !isLogScreenPath ? 'pt-16 md:pt-0' : '';

  useEffect(() => {
    setIsMobileNavOpen(false); // Close mobile nav on route change
  }, [location.pathname]);

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-[var(--color-app-bg)]`}>
       {!isLogScreenPath && (
        <>
          <div className={`md:hidden p-3 bg-[var(--color-nav-bg)] text-[var(--color-nav-text)] flex justify-between items-center fixed top-0 left-0 right-0 z-40 shadow-md`}>
            <Link to={AppView.DASHBOARD} className="flex items-center focus:outline-none focus:ring-2 focus:ring-white rounded-md" aria-label="Ir al Dashboard">
              <img src="./assets/logo.png" alt="Logo" className="h-8 w-auto mr-2"/>
              <span className="font-poppins font-semibold whitespace-nowrap">El Antimétodo</span>
            </Link>
            <Button variant="ghost" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="text-[var(--color-nav-text)] p-2">
              <MenuIcon className="w-6 h-6" />
            </Button>
          </div>
          <Navbar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
        </>
       )}
      
      <main className={`flex-1 overflow-y-auto text-[var(--color-text-main)] ${!isLogScreenPath ? 'md:ml-64' : ''} ${mainContentPadding}`}>
        <Routes>
          <Route path={AppView.DASHBOARD} element={<DashboardScreen />} />
          <Route path={AppView.TRACKER} element={<TrackerScreen />} />
          <Route path={AppView.ROUTINES} element={<RoutinesScreen />} />
          <Route path={AppView.REWARDS} element={<RewardsScreen />} />
          <Route path={AppView.LEADERBOARD} element={<LeaderboardScreen />} />
          <Route path={AppView.FEED} element={<FeedScreen />} />
          <Route path={AppView.GUIDES} element={<GuidesScreen />} />
          <Route path={AppView.SETTINGS} element={<SettingsScreen />} />
          <Route path="/log" element={<LogActivityScreen />} />
          <Route path="/log/:logId" element={<LogActivityScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="*" element={<Navigate to={AppView.DASHBOARD} replace />} />
        </Routes>
      </main>
    </div>
  );
};


// ... (imports)

// ... (AuthenticatedAppLayout)

// This component determines which part of the application to render based on auth state.
const AppRoutes: React.FC = () => {
  const { session, userProfile, isInitialLoadComplete, isProfileLoaded, appTheme } = useAppContext();

  useEffect(() => {
    const htmlElement = document.documentElement;
    // Remove all existing theme classes
    htmlElement.classList.remove('dark', 'theme-zen', 'theme-neon', 'theme-ocean', 'theme-japan-neon', 'theme-cafe-parisien', 'theme-fiesta-brasil');

    // Apply the new theme class
    if (appTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else if (appTheme !== 'light') { // Custom themes
      htmlElement.classList.add(`theme-${appTheme}`);
    }

    // Handle dark mode for custom themes if applicable
    // This assumes custom themes might have a 'dark' variant defined in CSS
    // If the system preference is dark and the appTheme is not explicitly 'light',
    // or if the appTheme is 'dark' or a custom theme that supports dark mode,
    // we might need to add the 'dark' class in addition to the custom theme class.
    // For now, we'll rely on the CSS definitions like html.dark.theme-zen

  }, [appTheme]);

  if (!isInitialLoadComplete) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-[var(--color-app-bg)]`}>
        <LoadingSpinner size="lg" text="Verificando sesión..." />
      </div>
    );
  }

  // This component will decide what to show on the main routes for non-public pages
  const ProtectedOrAuthRoutes: React.FC = () => {
    if (!session) {
      return <AuthScreen />;
    }
    
    // ESPERAR a que el perfil se cargue si hay una sesión
    if (!isProfileLoaded) {
        return (
            <div className={`flex items-center justify-center min-h-screen bg-[var(--color-app-bg)]`}>
                <LoadingSpinner size="lg" text="Cargando perfil..." />
            </div>
        );
    }

    if (!userProfile || userProfile.learning_languages.length === 0) {
      return <OnboardingScreen />;
    }
    return <AuthenticatedAppLayout />;
  };

  return (
    <Routes>
      {/* Publicly accessible routes first */}
      <Route path="/profile/:username" element={<ProfileScreen />} />
      
      {/* Catch-all for the main app logic (auth, onboarding, or the main app) */}
      <Route path="/*" element={<ProtectedOrAuthRoutes />} />
    </Routes>
  );
}

// ... (App)


const App: React.FC = () => {
  const [splashScreenDone, setSplashScreenDone] = useState(false);

  useEffect(() => {
    initializeOfflineSync();
  }, []);

  if (!splashScreenDone) {
    return <SplashScreen onComplete={() => setSplashScreenDone(true)} />;
  }

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;