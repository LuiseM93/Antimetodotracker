
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DailyActivityGoal, ActivityLogEntry, Language } from '../../types';
import { COLORS } from '../../constants'; // Keep for structure, but direct hex/var might be better for recharts

// Generate distinct colors for habits, can be expanded or made more dynamic
// Using direct hex values here as Recharts fill prop might not directly support CSS vars in all contexts easily
const HABIT_COLORS_HEX = [
  '#9c27b0', // accent
  '#7b1fa2', // secondary
  '#6d28d9', // purple-700 (example)
  '#a855f7', // purple-500 (example)
  '#8b5cf6', // violet-500 (example)
];

interface DailyGoalDonutChartProps {
  dailyTargets: DailyActivityGoal[]; 
  todaysLogs: ActivityLogEntry[];
  language?: Language | string; // Accept language string for display
}

export const DailyGoalDonutChart: React.FC<DailyGoalDonutChartProps> = ({ dailyTargets, todaysLogs, language }) => {
  
  const habitsProgressData = dailyTargets.map(habit => {
    const achievedMinutes = todaysLogs
      .filter(log => habit.components.some(comp => comp.category === log.category))
      .reduce((sum, log) => sum + log.durationMinutes, 0);
    
    const displayTarget = habit.optimalMinutesTotal > 0 
      ? habit.optimalMinutesTotal
      : habit.minMinutesTotal; // Fallback to min if optimal is 0

    const remainingMinutes = Math.max(0, displayTarget - achievedMinutes);
    
    return {
      name: habit.customName,
      target: displayTarget,
      achieved: achievedMinutes,
      remaining: remainingMinutes,
    };
  }).filter(item => item.target > 0 || item.achieved > 0); // Show if there's a target or any achievement


  if (habitsProgressData.length === 0) {
    return <p className={`text-center text-[var(--color-text-light)] py-4`}>No hay hábitos diarios configurados o actividad registrada hoy para este idioma. Ve a Rutinas para establecerlos.</p>;
  }
  
  const chartData = habitsProgressData.flatMap((item, index) => {
    const baseColor = HABIT_COLORS_HEX[index % HABIT_COLORS_HEX.length];
    const lightColor = `${baseColor}60`; // Add opacity for remaining part

    const segments = [];
    if (item.achieved > 0) {
        segments.push({ name: `${item.name} (Logrado)`, value: item.achieved, fill: baseColor });
    }
    if (item.target > 0 && item.remaining > 0) {
        segments.push({ name: `${item.name} (Restante)`, value: item.remaining, fill: lightColor });
    } else if (item.achieved === 0 && item.target > 0) { // If nothing achieved but there's a target
        segments.push({ name: `${item.name} (Pendiente)`, value: item.target, fill: lightColor });
    }
    return segments;
  }).filter(d => d.value > 0);


  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={(value: number, name: string) => [`${value} min`, name.substring(0, name.lastIndexOf(' ('))]} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => {
                const habitName = value.substring(0, value.lastIndexOf(' ('));
                const originalHabit = habitsProgressData.find(h => h.name === habitName);
                if (!originalHabit || entry.color?.endsWith('60')) return null; 

                const targetDisplay = originalHabit.target > 0 ? `/${originalHabit.target} min` : '(sin meta)';
                return <span style={{ color: entry.color }}>{`${originalHabit.name} (${originalHabit.achieved}${targetDisplay})`}</span>;
            }}
            wrapperStyle={{fontSize: '10px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={chartData.length > 1 ? 2 : 0}
            dataKey="value"
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} strokeWidth={0.5}/>
            ))}
          </Pie>
           <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`font-poppins text-lg fill-[var(--color-primary)]`}>
            Hoy {language ? `(${language})` : ''}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
