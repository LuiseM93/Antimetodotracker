
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { ActivityLogEntry, ActivityCategory, Language, Skill, ActivityDetailType } from '../../types';
import { CATEGORY_COLORS_CHART_HEX, ANTIMETHOD_ACTIVITIES_DETAILS, SKILL_COLORS_CHART_HEX } from '../../constants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAppContext } from '../../contexts/AppContext';

interface ActivityReportChartsProps {
  logs: ActivityLogEntry[];
  selectedLanguage: Language | 'Total';
  dateRange: { start: string; end: string }; // YYYY-MM-DD
}

type ChartViewMode = 'daily' | 'weekly' | 'monthly';

const getWeekKey = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00'); 
  const year = date.getFullYear();
  const target = new Date(date.valueOf());
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7)); 
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const activityDetailsMap = new Map<string, ActivityDetailType>(
  ANTIMETHOD_ACTIVITIES_DETAILS.map(detail => [detail.name, detail])
);

const formatDisplayDate = (isoDateString: string): string => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const ActivityReportCharts: React.FC<ActivityReportChartsProps> = ({ logs, selectedLanguage, dateRange }) => {
  const { appTheme } = useAppContext(); // appTheme might not be needed if label color is fixed
  const [timeChartViewMode, setTimeChartViewMode] = useState<ChartViewMode>('monthly');

  const filteredLogs = useMemo(() => {
    const start = new Date(dateRange.start + 'T00:00:00');
    const end = new Date(dateRange.end + 'T23:59:59');
    return logs.filter(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      const langMatch = selectedLanguage === 'Total' || log.language === selectedLanguage;
      return langMatch && logDate >= start && logDate <= end;
    });
  }, [logs, selectedLanguage, dateRange]);

  const totalTimeData = useMemo(() => {
    const aggregatedData: Record<string, number> = {};
    filteredLogs.forEach(log => {
      let key = '';
      if (timeChartViewMode === 'daily') {
        key = log.date; 
      } else if (timeChartViewMode === 'weekly') {
        key = getWeekKey(log.date);
      } else { 
        key = log.date.substring(0, 7); // YYYY-MM for monthly
      }
      aggregatedData[key] = (aggregatedData[key] || 0) + log.durationMinutes;
    });
    return Object.entries(aggregatedData)
      .map(([name, minutes]) => ({ 
        name: timeChartViewMode === 'daily' ? formatDisplayDate(name) : name,
        originalName: name, // For sorting
        'Horas': parseFloat((minutes / 60).toFixed(2)) 
      }))
      .sort((a,b) => a.originalName.localeCompare(b.originalName));
  }, [filteredLogs, timeChartViewMode]);

  const activityBreakdownData = useMemo(() => {
    const categoryData: Record<ActivityCategory, number> = {
      [ActivityCategory.ACTIVE_IMMERSION]: 0,
      [ActivityCategory.PASSIVE_IMMERSION]: 0,
      [ActivityCategory.ACTIVE_STUDY]: 0,
      [ActivityCategory.PRODUCTION]: 0,
    };
    filteredLogs.forEach(log => {
      categoryData[log.category] = (categoryData[log.category] || 0) + log.durationMinutes;
    });
    return Object.entries(categoryData)
      .map(([name, value]) => ({ name: name as ActivityCategory, value }))
      .filter(item => item.value > 0);
  }, [filteredLogs]);

  const skillBreakdownData = useMemo(() => {
    const skillData: Record<Skill, number> = {
      [Skill.LISTENING]: 0,
      [Skill.READING]: 0,
      [Skill.SPEAKING]: 0,
      [Skill.WRITING]: 0,
      [Skill.STUDY]: 0,
    };
    filteredLogs.forEach(log => {
      const activityDetail = activityDetailsMap.get(log.subActivity);
      if (activityDetail?.skill) {
        skillData[activityDetail.skill] = (skillData[activityDetail.skill] || 0) + log.durationMinutes;
      } else if (activityDetail) { 
          switch(activityDetail.category) {
              case ActivityCategory.ACTIVE_IMMERSION:
              case ActivityCategory.PASSIVE_IMMERSION:
                  skillData[Skill.LISTENING] += log.durationMinutes; 
                  break;
              case ActivityCategory.ACTIVE_STUDY:
                  skillData[Skill.STUDY] += log.durationMinutes;
                  break;
              case ActivityCategory.PRODUCTION: 
                  skillData[Skill.SPEAKING] += log.durationMinutes;
                  break;
          }
      }
    });
    return Object.entries(skillData)
      .map(([name, minutes]) => ({ name: name as Skill, 'Horas': parseFloat((minutes / 60).toFixed(2)) }))
      .filter(item => item.Horas > 0)
      .sort((a,b) => b.Horas - a.Horas);
  }, [filteredLogs]);

  const cardClasses = `bg-[var(--color-card-bg)] text-[var(--color-text-main)] border-[var(--color-border-light)]`;
  const titleClasses = `text-[var(--color-text-main)]`;
  const axisProps = {
    stroke: `var(--color-chart-text)`,
    tick: { fill: `var(--color-chart-text)`, fontSize: 10 }
  };
  const yAxisLabelProps = {
    value: 'Horas', angle: -90, position: 'insideLeft', fill: `var(--color-chart-text)`, dx: 10
  };
  const legendProps = { wrapperStyle: { color: `var(--color-chart-text)`, fontSize: '12px', paddingTop: '10px' } };
  const tooltipProps = {
    contentStyle: { backgroundColor: `var(--color-chart-tooltip-bg)`, borderColor: `var(--color-chart-tooltip-border)`, borderRadius: '0.5rem' },
    itemStyle: { color: `var(--color-chart-text)` },
    cursor: { fill: `var(--color-chart-grid-line)`, fillOpacity: 0.3 }
  };

  if (filteredLogs.length === 0) {
    return <p className={`text-center text-[var(--color-text-light)] py-8`}>No hay datos para mostrar con los filtros seleccionados.</p>;
  }
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent * 100 < 5) return null; 
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize="11px" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <Card title="Tiempo Total Registrado" className={cardClasses} titleClassName={titleClasses}>
        <div className="flex justify-center space-x-2 mb-4">
          {(['daily', 'weekly', 'monthly'] as ChartViewMode[]).map(mode => (
            <Button
              key={mode}
              variant={timeChartViewMode === mode ? 'primary' : 'outline'}
              onClick={() => setTimeChartViewMode(mode)}
              size="sm"
            >
              {mode === 'daily' ? 'Diario' : mode === 'weekly' ? 'Semanal' : 'Mensual'}
            </Button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={totalTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`var(--color-chart-grid-line)`} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} label={yAxisLabelProps}/>
            <Tooltip {...tooltipProps} formatter={(value: number) => [`${value} horas`, 'Total']} />
            <Legend {...legendProps} />
            <Line type="monotone" dataKey="Horas" stroke={`var(--color-chart-primary-line-bar)`} strokeWidth={2} dot={{r:3, fill: `var(--color-chart-primary-line-bar)`}} activeDot={{r:5, stroke: `var(--color-card-bg)`, strokeWidth: 2}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Desglose por Tipo de Actividad" className={cardClasses} titleClassName={titleClasses}>
          {activityBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                    data={activityBreakdownData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" // Adjusted to ensure legend fits well
                    innerRadius="55%" // Adjusted for thicker donut
                    outerRadius="80%" // Adjusted for thicker donut
                    labelLine={false}
                    label={renderCustomizedLabel}
                    paddingAngle={activityBreakdownData.length > 1 ? 2 : 0}
                >
                  {activityBreakdownData.map((entry) => (
                    <Cell key={`cell-cat-${entry.name}`} fill={CATEGORY_COLORS_CHART_HEX[entry.name]} stroke={`var(--color-card-bg)`} strokeWidth={2}/>
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(value: number, name: string) => [`${(value/60).toFixed(1)} horas (${((value / filteredLogs.reduce((acc, log) => acc + log.durationMinutes, 0)) * 100).toFixed(1)}%)`, name]} />
                <Legend {...legendProps} verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={`text-center text-[var(--color-text-light)] py-4`}>Sin datos.</p>}
        </Card>

        <Card title="Tiempo por Habilidad" className={cardClasses} titleClassName={titleClasses}>
          {skillBreakdownData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`var(--color-chart-grid-line)`}/>
              <XAxis type="number" {...axisProps} />
              <YAxis dataKey="name" type="category" {...axisProps} width={80} interval={0} tick={{...axisProps.tick, fontSize: 10}}/>
              <Tooltip {...tooltipProps} formatter={(value: number) => [`${value} horas`, 'Total']} />
              <Bar dataKey="Horas" barSize={20}>
                {skillBreakdownData.map((entry, index) => (
                    <Cell key={`cell-skill-${index}`} fill={SKILL_COLORS_CHART_HEX[entry.name as Skill]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
           ) : <p className={`text-center text-[var(--color-text-light)] py-4`}>Sin datos.</p>}
        </Card>
      </div>
    </div>
  );
};
