import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Brush } from 'recharts';
import { ActivityLogEntry, ActivityCategory, Language, Skill } from '../../types';
import { formatDurationFromSeconds } from '../../utils/timeUtils';
import { CATEGORY_COLORS_CHART_HEX, SKILL_COLORS_CHART_HEX, COLORS } from '../../constants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAppContext } from '../../contexts/AppContext';

interface ActivityReportChartsProps {
  logs: ActivityLogEntry[];
  selectedLanguage: Language | 'Total';
}

type ChartViewMode = 'daily' | 'weekly' | 'monthly';

const getWeekKey = (d: Date): string => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

const getMonthKey = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const getDailyKey = (d: Date): string => {
    return d.toISOString().split('T')[0];
}

const SUB_ACTIVITY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#0088FE', '#F44336', '#E91E63', '#9C27B0'];

export const ActivityReportCharts: React.FC<ActivityReportChartsProps> = ({ logs, selectedLanguage }) => {
  const { appTheme, getCombinedActivities } = useAppContext();
  const [timeChartViewMode, setTimeChartViewMode] = useState<ChartViewMode>('daily');

  const allActivities = useMemo(() => getCombinedActivities(), [getCombinedActivities]);
  const activityDetailsMap = useMemo(() => new Map(allActivities.map(detail => [detail.name, detail])), [allActivities]);

  const filteredLogs = useMemo(() => {
    return selectedLanguage === 'Total' 
      ? logs 
      : logs.filter(log => log.language === selectedLanguage);
  }, [logs, selectedLanguage]);

  const totalTimeData = useMemo(() => {
    const aggregatedData: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.date + "T00:00:00");
      let key = '';
      if (timeChartViewMode === 'daily') key = getDailyKey(date);
      else if (timeChartViewMode === 'weekly') key = getWeekKey(date);
      else key = getMonthKey(date);
      
      aggregatedData[key] = (aggregatedData[key] || 0) + log.duration_seconds;
    });

    if (filteredLogs.length === 0) return [];

    const sortedLogs = [...filteredLogs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedLogs[0].date + "T00:00:00");
    const lastDate = new Date(); // Today is the last date
    
    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const fullDateRangeData: Record<string, number> = {};
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      let key = '';
      if (timeChartViewMode === 'daily') {
        key = getDailyKey(currentDate);
      } else if (timeChartViewMode === 'weekly') {
        key = getWeekKey(currentDate);
      } else { // monthly
        key = getMonthKey(currentDate);
      }
      
      if (fullDateRangeData[key] === undefined) {
          fullDateRangeData[key] = aggregatedData[key] || 0;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return Object.entries(fullDateRangeData)
      .map(([name, seconds]) => ({ 
        name,
        'Horas': parseFloat((seconds / 3600).toFixed(2)) 
      }))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [filteredLogs, timeChartViewMode]);


  const activityBreakdownData = useMemo(() => {
    const categoryData: Record<ActivityCategory, number> = {
      [ActivityCategory.ACTIVE_IMMERSION]: 0,
      [ActivityCategory.PASSIVE_IMMERSION]: 0,
      [ActivityCategory.ACTIVE_STUDY]: 0,
      [ActivityCategory.PRODUCTION]: 0,
    };
    filteredLogs.forEach(log => {
      categoryData[log.category] = (categoryData[log.category] || 0) + log.duration_seconds;
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
      const activityDetail = activityDetailsMap.get(log.sub_activity);
      if (activityDetail?.skill) {
        skillData[activityDetail.skill] = (skillData[activityDetail.skill] || 0) + log.duration_seconds;
      } else if (activityDetail) { 
          switch(activityDetail.category) {
              case ActivityCategory.ACTIVE_IMMERSION:
              case ActivityCategory.PASSIVE_IMMERSION:
                  skillData[Skill.LISTENING] += log.duration_seconds; 
                  break;
              case ActivityCategory.ACTIVE_STUDY:
                  skillData[Skill.STUDY] += log.duration_seconds;
                  break;
              case ActivityCategory.PRODUCTION: 
                  skillData[Skill.SPEAKING] += log.duration_seconds;
                  break;
          }
      }
    });
    return Object.entries(skillData)
      .map(([name, seconds]) => ({ name: name as Skill, 'Horas': parseFloat((seconds / 3600).toFixed(2)) }))
      .filter(item => item.Horas > 0)
      .sort((a,b) => b.Horas - a.Horas);
  }, [filteredLogs, activityDetailsMap]);

  const subActivityBreakdownData = useMemo(() => {
    const subActivityData: Record<string, number> = {};
    filteredLogs.forEach(log => {
      subActivityData[log.sub_activity] = (subActivityData[log.sub_activity] || 0) + log.duration_seconds;
    });
    
    return Object.entries(subActivityData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  const subActivityPieChartData = useMemo(() => {
    if (subActivityBreakdownData.length <= 6) {
      return subActivityBreakdownData;
    }
    
    const topItems = subActivityBreakdownData.slice(0, 5);
    const otherValue = subActivityBreakdownData.slice(5).reduce((acc, curr) => acc + curr.value, 0);
    
    if (otherValue > 0) {
        return [...topItems, { name: 'Otros', value: otherValue }];
    }
    return topItems;

  }, [subActivityBreakdownData]);

  const chartTextColor = appTheme === 'dark' ? COLORS.textLightDark : '#555555';
  const chartGridColor = appTheme === 'dark' ? '#4B5563' : '#e0e0e0';
  const chartPrimaryLineBarColor = appTheme === 'dark' ? '#bb86fc' : COLORS.accent;
  const chartCardBgColor = appTheme === 'dark' ? COLORS.cardBgDark : COLORS.cardBgLight;
  const chartTooltipBgColor = appTheme === 'dark' ? '#374151' : '#ffffff';
  const chartTooltipBorderColor = appTheme === 'dark' ? '#4B5563' : '#cccccc';


  const cardClasses = `bg-[var(--color-card-bg)] text-[var(--color-text-main)] border-[var(--color-border-light)]`;
  const titleClasses = `text-[var(--color-text-main)]`;
  
  const axisProps = {
    stroke: chartTextColor,
    tick: { fill: chartTextColor, fontSize: 10 }
  };
  const yAxisLabelProps = {
    value: 'Horas', angle: -90, position: 'insideLeft', fill: chartTextColor, dx: 10
  };
  const legendProps = { wrapperStyle: { color: chartTextColor, fontSize: '12px', paddingTop: '10px' } };
  const tooltipProps = {
    contentStyle: { backgroundColor: chartTooltipBgColor, borderColor: chartTooltipBorderColor, borderRadius: '0.5rem' },
    itemStyle: { color: chartTextColor },
    cursor: { fill: chartGridColor, fillOpacity: 0.3 }
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

  // Set default start index for the brush to show the last 13 days
  const defaultBrushStartIndex = totalTimeData.length > 13 ? totalTimeData.length - 13 : 0;

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
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="name" {...axisProps} tickFormatter={(tick) => timeChartViewMode === 'daily' ? new Date(tick + 'T00:00:00').toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit'}) : tick} />
            <YAxis {...axisProps} label={yAxisLabelProps}/>
            <Tooltip {...tooltipProps} formatter={(value: number) => [`${value} horas`, 'Total']} />
            <Legend {...legendProps} />
            <Line type="monotone" dataKey="Horas" stroke={chartPrimaryLineBarColor} strokeWidth={2} dot={{r:3, fill: chartPrimaryLineBarColor}} activeDot={{r:5, stroke: chartCardBgColor, strokeWidth: 2}}/>
            {timeChartViewMode === 'daily' && totalTimeData.length > 15 && (
                <Brush 
                    dataKey="name" 
                    height={30} 
                    stroke={chartPrimaryLineBarColor}
                    startIndex={defaultBrushStartIndex}
                    endIndex={totalTimeData.length - 1}
                >
                    <LineChart>
                        <Line type="monotone" dataKey="Horas" stroke={chartPrimaryLineBarColor} dot={false}/>
                        <XAxis 
                            dataKey="name"
                            tickFormatter={(tick) => new Date(tick + 'T00:00:00').toLocaleDateString('es-ES', {month: 'short', year: '2-digit'})}
                            tick={{ fill: chartTextColor, fontSize: 10 }}
                            stroke={chartGridColor}
                            interval="preserveStartEnd"
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis hide={true} />
                    </LineChart>
                </Brush>
            )}
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
                    cy="45%" 
                    innerRadius="55%" 
                    outerRadius="80%" 
                    labelLine={false}
                    label={renderCustomizedLabel}
                    paddingAngle={activityBreakdownData.length > 1 ? 2 : 0}
                >
                  {activityBreakdownData.map((entry) => (
                    <Cell key={`cell-cat-${entry.name}`} fill={CATEGORY_COLORS_CHART_HEX[entry.name]} stroke={chartCardBgColor} strokeWidth={2}/>
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(value: number, name: string) => [`${(value/3600).toFixed(1)} horas (${((value / filteredLogs.reduce((acc, log) => acc + log.duration_seconds, 0)) * 100).toFixed(1)}%)`, name]} />
                <Legend {...legendProps} verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={`text-center text-[var(--color-text-light)] py-4`}>Sin datos.</p>}
        </Card>

        <Card title="Tiempo por Habilidad" className={cardClasses} titleClassName={titleClasses}>
          {skillBreakdownData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
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

        <Card title="Desglose por Actividad Específica" className={`${cardClasses} md:col-span-2`}>
          {subActivityBreakdownData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                      data={subActivityPieChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="50%" 
                      outerRadius="75%" 
                      labelLine={false}
                      label={renderCustomizedLabel}
                      paddingAngle={subActivityPieChartData.length > 1 ? 2 : 0}
                  >
                    {subActivityPieChartData.map((entry, index) => (
                      <Cell key={`cell-sub-${index}`} fill={SUB_ACTIVITY_COLORS[index % SUB_ACTIVITY_COLORS.length]} stroke={chartCardBgColor} strokeWidth={2}/>
                    ))}
                  </Pie>
                  <Tooltip {...tooltipProps} formatter={(value: number, name: string) => [`${(value/3600).toFixed(1)} horas (${((value / filteredLogs.reduce((acc, log) => acc + log.duration_seconds, 0)) * 100).toFixed(1)}%)`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="max-h-[300px] overflow-y-auto pr-2 text-sm">
                <ul>
                  {subActivityBreakdownData.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-light)]">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SUB_ACTIVITY_COLORS[index % SUB_ACTIVITY_COLORS.length] }}></span>
                        {item.name}
                      </span>
                      <span className="font-mono text-xs">{formatDurationFromSeconds(item.value, 'hms')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : <p className={`text-center text-[var(--color-text-light)] py-4`}>Sin datos.</p>}
        </Card>
      </div>
    </div>
  );
};