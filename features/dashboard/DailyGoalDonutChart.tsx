

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DailyActivityGoal, ActivityLogEntry, Language } from '../../types';
import { COLORS } from '../../constants';
import { formatDurationFromSeconds } from '../../utils/timeUtils';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';

const HABIT_COLORS_HEX = [
  '#9c27b0', // accent
  '#7b1fa2', // secondary
  '#6d28d9', 
  '#a855f7', 
  '#8b5cf6',
];

const SUCCESS_COLOR_HEX = '#22c55e'; // green-500

interface DailyGoalDonutChartProps {
  dailyTargets: DailyActivityGoal[];
  todaysLogs: ActivityLogEntry[];
  language?: Language | string;
}

export const DailyGoalDonutChart: React.FC<DailyGoalDonutChartProps> = ({ dailyTargets, todaysLogs, language }) => {
  
  const habitsProgressData = dailyTargets.map(habit => {
    const achievedSeconds = todaysLogs
      .filter(log => habit.components.some(comp => comp.category === log.category))
      .reduce((sum, log) => sum + log.durationSeconds, 0);
    
    // Use optimal target for visual representation of the pie, but min target for logic
    const displayTargetSeconds = habit.optimalSecondsTotal > 0 
      ? habit.optimalSecondsTotal
      : habit.minSecondsTotal;

    const remainingSeconds = Math.max(0, displayTargetSeconds - achievedSeconds);
    
    return {
      name: habit.customName,
      target: displayTargetSeconds,
      achieved: achievedSeconds,
      remaining: remainingSeconds,
      minTarget: habit.minSecondsTotal,
      optimalTarget: habit.optimalSecondsTotal,
      isMinMet: achievedSeconds >= habit.minSecondsTotal && habit.minSecondsTotal > 0,
    };
  }).filter(item => item.target > 0 || item.achieved > 0);


  if (habitsProgressData.length === 0) {
    return <p className={`text-center text-[var(--color-text-light)] py-4`}>No hay hábitos diarios configurados o actividad registrada hoy para este idioma. Ve a Rutinas para establecerlos.</p>;
  }
  
  const chartData = habitsProgressData.flatMap((item, index) => {
    const baseColor = HABIT_COLORS_HEX[index % HABIT_COLORS_HEX.length];
    const achievedColor = item.isMinMet ? SUCCESS_COLOR_HEX : baseColor;
    const lightColor = `${baseColor}60`; // Opacity for remaining part

    const segments = [];
    if (item.achieved > 0) {
        segments.push({ name: `${item.name} (Logrado)`, value: item.achieved, fill: achievedColor });
    }
    if (item.target > 0 && item.remaining > 0) {
        segments.push({ name: `${item.name} (Restante)`, value: item.remaining, fill: lightColor });
    } else if (item.achieved === 0 && item.target > 0) {
        segments.push({ name: `${item.name} (Pendiente)`, value: item.target, fill: lightColor });
    }
    return segments;
  }).filter(d => d.value > 0);


  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            formatter={(value: number, name: string) => [formatDurationFromSeconds(value, 'long'), name.substring(0, name.lastIndexOf(' ('))]} 
            contentStyle={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border-light)', borderRadius: '0.5rem' }}
            labelStyle={{ color: 'var(--color-text-light)' }}
            itemStyle={{ color: 'var(--color-text-main)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            layout="vertical"
            align="center"
            wrapperStyle={{fontSize: '11px', lineHeight: '1.4', color: 'var(--color-text-main)' }}
            formatter={(value, entry) => {
                const habitName = value.substring(0, value.lastIndexOf(' ('));
                const originalHabit = habitsProgressData.find(h => h.name === habitName);
                if (!originalHabit || entry.color?.endsWith('60')) return null;

                const achievedFormatted = formatDurationFromSeconds(originalHabit.achieved, 'short').replace(' 0s', '');
                const minTargetFormatted = formatDurationFromSeconds(originalHabit.minTarget, 'short').replace(' 0s', '');
                const optimalTargetFormatted = formatDurationFromSeconds(originalHabit.optimalTarget, 'short').replace(' 0s', '');
                
                let targetDisplay = '';
                if (originalHabit.minTarget > 0 && originalHabit.optimalTarget > 0) {
                    targetDisplay = `(${achievedFormatted} / ${minTargetFormatted} / ${optimalTargetFormatted})`;
                } else if (originalHabit.minTarget > 0) {
                    targetDisplay = `(${achievedFormatted} / ${minTargetFormatted})`;
                } else if (originalHabit.optimalTarget > 0) {
                    targetDisplay = `(${achievedFormatted} / ${optimalTargetFormatted})`;
                } else {
                    targetDisplay = `(${achievedFormatted})`;
                }

                return (
                    <span className="flex items-center">
                        {originalHabit.isMinMet && <CheckCircleIcon variant="solid" className="w-3.5 h-3.5 mr-1.5 text-green-500" />}
                        <span style={{ color: entry.color }} className="font-medium">{originalHabit.name}</span>
                        <span className="ml-1.5 text-[var(--color-text-light)] text-xs font-mono">{targetDisplay}</span>
                    </span>
                );
            }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%" // Adjust to make space for legend
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={chartData.length > 1 ? 2 : 0}
            dataKey="value"
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} strokeWidth={0.5}/>
            ))}
          </Pie>
           <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className={`font-poppins text-lg fill-[var(--color-primary)]`}>
            Hoy {language ? `(${language})` : ''}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};