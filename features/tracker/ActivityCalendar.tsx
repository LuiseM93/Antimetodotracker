

import React, { useState, useMemo } from 'react';
import { ActivityLogEntry, Language } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

interface ActivityCalendarProps {
  logs: ActivityLogEntry[];
  selectedLanguage: Language | 'Total';
  onDayClick: (date: string, logsOnDate: ActivityLogEntry[]) => void;
}

const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ logs, selectedLanguage, onDayClick }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const filteredLogs = useMemo(() => {
    return selectedLanguage === 'Total' 
      ? logs 
      : logs.filter(log => log.language === selectedLanguage);
  }, [logs, selectedLanguage]);

  const monthActivities = useMemo(() => {
    const activities: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const dateKey = log.date; // YYYY-MM-DD
      if (new Date(dateKey).getMonth() === currentMonthDate.getMonth() && new Date(dateKey).getFullYear() === currentMonthDate.getFullYear()) {
        activities[dateKey] = (activities[dateKey] || 0) + Math.round(log.duration_seconds / 60);
      }
    });
    return activities;
  }, [filteredLogs, currentMonthDate]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0 (Mon) - 6 (Sun)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getIntensityColor = (minutes: number): string => {
    if (minutes === 0) return `bg-[var(--color-card-bg)]`; 
    if (minutes < 30) return `bg-[var(--color-light-purple)] bg-opacity-30`;
    if (minutes < 60) return `bg-[var(--color-light-purple)] bg-opacity-60`;
    if (minutes < 120) return `bg-[var(--color-accent)] bg-opacity-40`;
    return `bg-[var(--color-accent)] bg-opacity-70`;
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      cells.push(<div key={`empty-start-${i}`} className="p-1 sm:p-2 border border-gray-200"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const totalMinutes = monthActivities[dateKey] || 0;
      const logsOnThisDate = filteredLogs.filter(log => log.date === dateKey);

      cells.push(
        <div
          key={dateKey}
          className={`p-1 sm:p-2 border border-gray-200 aspect-square flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-[var(--color-accent)] transition-all ${getIntensityColor(totalMinutes)}`}
          onClick={() => onDayClick(dateKey, logsOnThisDate)}
        >
          <span className={`text-xs sm:text-sm font-medium ${totalMinutes > 0 ? `text-[var(--color-primary)]` : `text-[var(--color-text-light)]`}`}>{day}</span>
          {totalMinutes > 0 && (
             <span className="text-xxs sm:text-xs text-purple-700">{Math.floor(totalMinutes/60)}h {totalMinutes%60}m</span>
          )}
        </div>
      );
    }
    const totalCells = cells.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        cells.push(<div key={`empty-end-${i}`} className="p-1 sm:p-2 border border-gray-200"></div>);
    }

    return cells;
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevMonth} variant="ghost" size="sm" aria-label="Mes anterior" title="Mes anterior">
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <h3 className={`text-lg font-poppins font-semibold text-[var(--color-primary)]`}>
          {currentMonthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </h3>
        <Button onClick={handleNextMonth} variant="ghost" size="sm" aria-label="Mes siguiente" title="Mes siguiente">
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {daysOfWeek.map(day => (
          <div key={day} className={`p-1 sm:p-2 text-center font-poppins text-xs sm:text-sm font-medium text-[var(--color-secondary)] bg-[var(--color-light-purple)] bg-opacity-50`}>
            {day}
          </div>
        ))}
        {renderCells()}
      </div>
    </Card>
  );
};