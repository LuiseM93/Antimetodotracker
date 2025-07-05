
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppView } from '../types.ts';
import { HomeIcon } from './icons/HomeIcon.tsx';
import { ChartBarIcon } from './icons/ChartBarIcon.tsx';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon.tsx';
import { BookOpenIcon } from './icons/BookOpenIcon.tsx';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon.tsx';
import { CogSolidIcon } from './icons/CogSolidIcon.tsx';
import { SunIcon } from './icons/SunIcon.tsx';
import { MoonIcon } from './icons/MoonIcon.tsx';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { TrophyIcon } from './icons/TrophyIcon.tsx';
import { NewspaperIcon } from './icons/NewspaperIcon.tsx'; // New icon
import { useAppContext } from '../contexts/AppContext.tsx';
import { Button } from './Button.tsx';

export const Navbar: React.FC = () => {
  const { appTheme, updateAppTheme, userProfile } = useAppContext();

  const toggleTheme = () => {
    updateAppTheme(appTheme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { to: AppView.DASHBOARD, label: 'Dashboard', icon: <HomeIcon /> },
    { to: AppView.TRACKER, label: 'Tracker', icon: <ChartBarIcon /> },
    { to: AppView.ROUTINES, label: 'Rutinas', icon: <CalendarDaysIcon /> },
    { to: AppView.LEADERBOARD, label: 'Leaderboard', icon: <TrophyIcon /> },
    { to: AppView.FEED, label: 'Feed', icon: <NewspaperIcon /> },
    { to: AppView.REWARDS, label: 'Tienda', icon: <ShoppingBagIcon /> },
    { to: AppView.GUIDES, label: 'Guías', icon: <BookOpenIcon /> },
    { to: `/profile/${userProfile?.username}`, label: 'Mi Perfil', icon: <UserIcon /> },
    { to: AppView.SETTINGS, label: 'Configuración', icon: <CogSolidIcon /> }, 
  ];

  const activeLinkClass = `bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-text)]`;
  const inactiveLinkClass = `text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-active-text)]`;

  const navClasses = `
    bg-[var(--color-nav-bg)] 
    shadow-lg 
    flex flex-col
    transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:w-64 md:min-h-screen md:p-4 
    fixed top-0 left-0 h-full w-64 z-50 p-4 pt-20 md:pt-4 
  `;

  return (
    <nav className={`${navClasses} hidden md:flex`}> {/* Added hidden md:flex */}
        <NavLink 
            to={AppView.DASHBOARD} 
            className="mb-8 items-center px-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-text-inverse)] rounded-md"
            aria-label="Ir al Dashboard"
        >
          <img src="./assets/logo.png" alt="El Antimétodo Logo" className="h-10 w-auto" />
          <span className={`ml-3 text-xl font-poppins font-bold text-[var(--color-text-inverse)] whitespace-nowrap`}>
            El Antimétodo
          </span>
        </NavLink>
        
        <ul className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-150 ${isActive ? activeLinkClass : inactiveLinkClass}`
                }
              >
                <span className="w-6 h-6">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto pt-4 border-t border-[var(--color-secondary)]">
          {/* Theme Toggle Button:
              The Button component's 'ghost' variant sets text to var(--color-primary).
              In light mode, nav-bg is var(--color-primary), causing invisibility.
              The fix is to ensure children (icon and span) explicitly use var(--color-nav-text).
              The Button's className handles hover background and focus ring.
              Hover text color is handled by Tailwind's group-hover on children, with 'group' added to Button.
          */}
          <Button
            onClick={toggleTheme}
            variant="ghost" 
            className={`group w-full flex items-center justify-start space-x-3 p-3 rounded-lg 
                       hover:bg-[var(--color-nav-hover-bg)] 
                       focus:ring-[var(--color-accent)] 
                       transition-colors duration-150 mb-2`}
            aria-label={`Cambiar a tema ${appTheme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {appTheme === 'light' ? 
              <MoonIcon className="w-6 h-6 text-[var(--color-nav-text)] group-hover:text-[var(--color-nav-active-text)]" /> : 
              <SunIcon className="w-6 h-6 text-[var(--color-nav-text)] group-hover:text-[var(--color-nav-active-text)]" />
            }
            <span className="font-medium text-[var(--color-nav-text)] group-hover:text-[var(--color-nav-active-text)]">
              Tema {appTheme === 'light' ? 'Oscuro' : 'Claro'}
            </span>
          </Button>
          <a
            href="https://luisem93.github.io/ElAntimetodo/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-150 ${inactiveLinkClass}`}
          >
            <ExternalLinkIcon className="w-6 h-6" />
            <span className="font-medium">Más Info (Web)</span>
          </a>
        </div>
      </nav>
  );
};