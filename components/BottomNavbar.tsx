
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppView } from '../types.ts';
import { HomeIcon } from './icons/HomeIcon.tsx';
import { ChartBarIcon } from './icons/ChartBarIcon.tsx';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon.tsx';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon.tsx';
import { TrophyIcon } from './icons/TrophyIcon.tsx';
import { NewspaperIcon } from './icons/NewspaperIcon.tsx';

export const BottomNavbar: React.FC = () => {

  const navItems = [
    { to: AppView.DASHBOARD, label: 'Inicio', icon: <HomeIcon className="w-6 h-6" /> },
    { to: AppView.TRACKER, label: 'Tracker', icon: <ChartBarIcon className="w-6 h-6" /> },
    { to: AppView.ROUTINES, label: 'Rutinas', icon: <CalendarDaysIcon className="w-6 h-6" /> },
    { to: AppView.REWARDS, label: 'Tienda', icon: <ShoppingBagIcon className="w-6 h-6" /> },
    { to: AppView.LEADERBOARD, label: 'Ranking', icon: <TrophyIcon className="w-6 h-6" /> },
    { to: AppView.FEED, label: 'Feed', icon: <NewspaperIcon className="w-6 h-6" /> },
  ];

  const activeLinkClass = "text-[var(--color-accent)]";
  const inactiveLinkClass = "text-[var(--color-nav-text)]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-nav-bg)] border-t border-[var(--color-border-light)] shadow-lg md:hidden z-50">
      <ul className="flex justify-around h-16 items-center">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center h-full text-xs font-medium transition-colors duration-150 
                ${isActive ? activeLinkClass : inactiveLinkClass}`
              }
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
