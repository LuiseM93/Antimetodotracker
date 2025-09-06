import React, { useState, useMemo } from 'react';
import { ActivityLogEntry, Language } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { formatTimeHHMMSS } from '../../utils/timeUtils';

interface AnnualHeatmapProps {
  logs: ActivityLogEntry[];
  selectedLanguage: Language | 'Total';
}

const getIntensityColor = (minutes: number): string => {
    if (minutes <= 0) return 'bg-gray-200 dark:bg-gray-700';
    if (minutes < 30) return 'bg-purple-200 dark:bg-purple-900';
    if (minutes < 60) return 'bg-purple-400 dark:bg-purple-700';
    if (minutes < 120) return 'bg-purple-600 dark:bg-purple-500';
    return 'bg-purple-800 dark:bg-purple-300';
};

export const AnnualHeatmap: React.FC<AnnualHeatmapProps> = ({ logs, selectedLanguage }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const filteredLogs = useMemo(() => {
    return selectedLanguage === 'Total'
      ? logs
      : logs.filter(log => log.language === selectedLanguage);
  }, [logs, selectedLanguage]);

  const dataByDate = useMemo(() => {
    const data: Map<string, number> = new Map();
    filteredLogs.forEach(log => {
      if (new Date(log.date).getFullYear() === year) {
        const dateKey = log.date; // YYYY-MM-DD
        const currentSeconds = data.get(dateKey) || 0;
        data.set(dateKey, currentSeconds + log.duration_seconds);
      }
    });
    return data;
  }, [filteredLogs, year]);

  const gridDays = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const days = [];
    
    // Add blank days for the first week to align days correctly
    for (let i = 0; i < startDate.getDay(); i++) {
        days.push({ key: `empty-start-${i}`, date: null, seconds: 0 });
    }

    for (let i = 0; i < 366; i++) {
        const currentDate = new Date(year, 0, i + 1);
        if (currentDate.getFullYear() !== year) continue; // Handle leap years correctly

        const dateKey = currentDate.toISOString().split('T')[0];
        days.push({
            key: dateKey,
            date: new Date(currentDate),
            seconds: dataByDate.get(dateKey) || 0,
        });
    }
    return days;
  }, [year, dataByDate]);

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setYear(y => y - 1)} variant="ghost" size="sm" aria-label="Año anterior" title="Año anterior">
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-poppins font-semibold text-[var(--color-primary)]">{year}</h3>
        <Button onClick={() => setYear(y => y + 1)} variant="ghost" size="sm" aria-label="Año siguiente" title="Año siguiente" disabled={year === new Date().getFullYear()}>
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex justify-center overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {gridDays.map(day => (
                <div
                    key={day.key}
                    className={`w-4 h-4 rounded-sm ${day.date ? getIntensityColor(day.seconds / 60) : 'bg-transparent'}`}
                    title={day.date ? `${day.date.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}: ${formatTimeHHMMSS(day.seconds)}` : ''}
                >
                </div>
            ))}
        </div>
      </div>
       <div className="flex justify-end items-center text-xs space-x-2 mt-2 text-[var(--color-text-light)]">
            <span>Menos</span>
            <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
            <div className="w-3 h-3 rounded-sm bg-purple-200 dark:bg-purple-900"></div>
            <div className="w-3 h-3 rounded-sm bg-purple-400 dark:bg-purple-700"></div>
            <div className="w-3 h-3 rounded-sm bg-purple-600 dark:bg-purple-500"></div>
            <div className="w-3 h-3 rounded-sm bg-purple-800 dark:bg-purple-300"></div>
            <span>Más</span>
        </div>
    </Card>
  );
};