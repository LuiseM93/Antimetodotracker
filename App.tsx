import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { TrackerScreen } from './features/tracker/TrackerScreen';
import { RoutinesScreen } from './features/routines/RoutinesScreen';
import { GuidesScreen } from './features/guides/GuidesScreen';
import { LogActivityScreen } from './features/tracker/LogActivityScreen'; 
import { SettingsScreen } from './features/settings/SettingsScreen'; 
import { RewardsScreen } from './features/rewards/RewardsScreen';
import { LeaderboardScreen } from './features/leaderboard/LeaderboardScreen'; // New
import { FeedScreen } from './features/feed/FeedScreen'; // New
import { AuthScreen } from './features/auth/Auth';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { AppView } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MenuIcon } from './components/icons/MenuIcon';
import { Button } from './components/Button';
import { SplashScreen } from './features/splash/SplashScreen';


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
              <img src="assets/logo.png" alt="Logo" className="h-8 w-auto mr-2"/>
              <span className="font-poppins font-semibold whitespace-nowrap">El Antimétodo</span>
            </Link>
            <Button variant="ghost" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="text-[var(--color-nav-text)] p-2">
              <MenuIcon className="w-6 h-6" />
            </Button>
          </div>
          <Navbar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
        </>
       )}
      
      <main className={`flex-1 overflow-y-auto text-[var(--color-text-main)] ${mainContentPadding}`}>
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
          <Route path="*" element={<Navigate to={AppView.DASHBOARD} replace />} />
        </Routes>
      </main>
    </div>
  );
};

// This component determines which part of the application to render based on auth state.
const AppRoutes: React.FC = () => {
  const { session, userProfile, isInitialLoadComplete, appTheme } = useAppContext();

  useEffect(() => {
    // Only set the theme if a user profile doesn't override it (e.g., on a public profile page)
    const isProfilePage = window.location.hash.startsWith('#/profile/');
    if (!isProfilePage) {
        document.documentElement.className = appTheme;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
        metaThemeColor.setAttribute('content', appTheme === 'dark' ? '#121212' : '#4a148c');
        }
    }
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
    if (!userProfile) {
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

const App: React.FC = () => {
  const [splashScreenDone, setSplashScreenDone] = useState(false);

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