
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { TrackerScreen } from './features/tracker/TrackerScreen';
import { RoutinesScreen } from './features/routines/RoutinesScreen';
// import { WeeklyPlanner } from './features/routines/WeeklyPlanner'; // Removed Import
import { GuidesScreen } from './features/guides/GuidesScreen';
import { LogActivityScreen } from './features/tracker/LogActivityScreen'; 
import { SettingsScreen } from './features/settings/SettingsScreen'; 
import { RewardsScreen } from './features/rewards/RewardsScreen'; // New Rewards screen
import { AppView, UserProfile } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MenuIcon } from './components/icons/MenuIcon';
import { Button } from './components/Button';
import { SplashScreen } from './features/splash/SplashScreen';

// Componente que maneja la lógica de rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isInitialLoadComplete } = useAppContext();

  if (!isInitialLoadComplete) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-[var(--color-app-bg)]`}>
        <LoadingSpinner size="lg" text="Cargando datos..." />
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to={AppView.ONBOARDING} replace />;
  }
  return <>{children}</>;
};

// Componente principal de la aplicación con el router y la lógica de navegación
const MainApplication: React.FC = () => {
  const { userProfile, isInitialLoadComplete, appTheme } = useAppContext();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.className = appTheme;
    // For meta theme-color, if you want it to adapt
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', appTheme === 'dark' ? '#121212' : '#4a148c');
    }
  }, [appTheme]);

  // Check if current route is LogActivityScreen or its variants
  const isLogScreenPath = location.pathname.startsWith('/log');

  const showNavbar = isInitialLoadComplete && userProfile && location.pathname !== AppView.ONBOARDING && !isLogScreenPath;


  useEffect(() => {
    setIsMobileNavOpen(false); // Cerrar nav móvil en cambio de ruta
  }, [location.pathname]);

  if (!isInitialLoadComplete) {
     return (
      <div className={`flex items-center justify-center min-h-screen bg-[var(--color-app-bg)]`}>
        <LoadingSpinner size="lg" text="Inicializando aplicación..." />
      </div>
    );
  }
  
  // Apply top padding only if the mobile navbar is potentially visible (i.e., showNavbar is true)
  // And not on the LogActivityScreen itself as it has its own full-screen header.
  const mainContentPadding = showNavbar ? 'pt-16 md:pt-0' : '';


  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-[var(--color-app-bg)]`}>
      {showNavbar && (
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
          <Route path={AppView.ONBOARDING} element={<OnboardingScreen />} />
          <Route 
            path={AppView.DASHBOARD} 
            element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} 
          />
          <Route 
            path={AppView.TRACKER} 
            element={<ProtectedRoute><TrackerScreen /></ProtectedRoute>} 
          />
          <Route 
            path={AppView.ROUTINES} 
            element={<ProtectedRoute><RoutinesScreen /></ProtectedRoute>} 
          />
           <Route 
            path={AppView.REWARDS} 
            element={<ProtectedRoute><RewardsScreen /></ProtectedRoute>} 
          />
          {/* Removed WeeklyPlanner Route */}
          <Route 
            path={AppView.GUIDES} 
            element={<ProtectedRoute><GuidesScreen /></ProtectedRoute>} 
          />
           <Route 
            path={AppView.SETTINGS} 
            element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} 
          />
          <Route 
            path="/log" 
            element={<ProtectedRoute><LogActivityScreen /></ProtectedRoute>} 
          />
          <Route 
            path="/log/:logId" 
            element={<ProtectedRoute><LogActivityScreen /></ProtectedRoute>} 
          />
          <Route 
            path="*" 
            element={
              <Navigate to={userProfile ? AppView.DASHBOARD : AppView.ONBOARDING} replace />
            } 
          />
        </Routes>
      </main>
    </div>
  );
};


const App: React.FC = () => {
  const [splashScreenDone, setSplashScreenDone] = useState(false);

  if (!splashScreenDone) {
    return <SplashScreen onComplete={() => setSplashScreenDone(true)} />;
  }

  return (
    <HashRouter>
      <MainApplication />
    </HashRouter>
  );
};

export default App;