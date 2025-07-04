import React, { useState, useEffect } from 'react';
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
import { ProfileScreen } from './features/profile/ProfileScreen.tsx';
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
              <img src="/assets/logo-iqOCGSoa.png" alt="Logo" className="h-8 w-auto mr-2"/>
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

  // Handle OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check if this is an OAuth redirect
      if (urlParams.has('code') || hashParams.has('access_token')) {
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthRedirect();
  }, []);

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