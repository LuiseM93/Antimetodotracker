
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppView } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon'; 
import { XMarkIcon } from './icons/XMarkIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './Button';

const navItems = [
  { to: AppView.DASHBOARD, label: 'Dashboard', icon: <HomeIcon /> },
  { to: AppView.TRACKER, label: 'Tracker', icon: <ChartBarIcon /> },
  { to: AppView.ROUTINES, label: 'Rutinas', icon: <CalendarDaysIcon /> },
  { to: AppView.GUIDES, label: 'Guías', icon: <BookOpenIcon /> },
  { to: AppView.SETTINGS, label: 'Configuración', icon: <Cog6ToothIcon /> }, 
];

interface NavbarProps {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMobileNavOpen, setIsMobileNavOpen }) => {
  const { appTheme, updateAppTheme } = useAppContext();

  const toggleTheme = () => {
    updateAppTheme(appTheme === 'light' ? 'dark' : 'light');
  };

  const activeLinkClass = `bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-text)]`;
  const inactiveLinkClass = `text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-active-text)]`;

  const navClasses = `
    bg-[var(--color-nav-bg)] 
    shadow-lg 
    flex flex-col
    transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:w-64 md:min-h-screen md:p-4 
    fixed top-0 left-0 h-full w-64 z-50 p-4 pt-20 md:pt-4 
    ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay for mobile nav */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        ></div>
      )}

      <nav className={navClasses}>
        {/* Close button for mobile */}
        <button 
          onClick={() => setIsMobileNavOpen(false)}
          className="absolute top-4 right-4 p-2 text-[var(--color-nav-text)] hover:text-white md:hidden"
          aria-label="Cerrar menú"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <NavLink 
            to={AppView.DASHBOARD} 
            className="hidden md:flex mb-8 items-center px-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-text-inverse)] rounded-md"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Ir al Dashboard"
        >
          <img src="assets/logo.png" alt="El Antimétodo Logo" className="h-10 w-auto" />
          <span className={`ml-3 text-xl font-poppins font-bold text-[var(--color-text-inverse)] whitespace-nowrap`}>
            El Antimétodo
          </span>
        </NavLink>
        
        <ul className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setIsMobileNavOpen(false)} 
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
          <Button
            onClick={toggleTheme}
            variant="ghost"
            className={`w-full flex items-center justify-start space-x-3 p-3 rounded-lg transition-colors duration-150 ${inactiveLinkClass} mb-2`}
            aria-label={`Cambiar a tema ${appTheme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {appTheme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            <span className="font-medium">Tema {appTheme === 'light' ? 'Oscuro' : 'Claro'}</span>
          </Button>
          <a
            href="https://luisem93.github.io/ElAntimetodo/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileNavOpen(false)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-150 ${inactiveLinkClass}`}
          >
            <ExternalLinkIcon className="w-6 h-6" />
            <span className="font-medium">Más Info (Web)</span>
          </a>
        </div>
      </nav>
    </>
  );
};