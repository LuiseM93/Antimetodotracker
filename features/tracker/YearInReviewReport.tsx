
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Language, YearInReviewData, ActivityCategory, Skill } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CATEGORY_COLORS_CHART_HEX, SKILL_COLORS_CHART_HEX, COLORS } from '../../constants';
import { ShareIcon } from '../../components/icons/ShareIcon';

interface YearInReviewReportProps {
  isOpen: boolean;
  onClose: () => void;
  initialYear?: number;
}

const inputBaseStyle = "block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const YearInReviewReport: React.FC<YearInReviewReportProps> = ({ isOpen, onClose, initialYear }) => {
  const { getAvailableReportYears, getYearInReviewData, activityLogs, userProfile, appTheme } = useAppContext();
  
  const availableYears = useMemo(() => getAvailableReportYears(), [activityLogs]);
  
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear() -1) );
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'Total'> (userProfile?.primaryLanguage || 'Total');
  const [reportData, setReportData] = useState<YearInReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const languagesInSelectedYear = useMemo(() => {
    if (!userProfile) return ['Total'];
    const langs = new Set<Language>(['Total' as Language]); // 'Total' is not a Language enum but a filter option
    activityLogs.forEach(log => {
      if (new Date(log.date).getFullYear() === selectedYear && userProfile.learningLanguages.includes(log.language)) {
        langs.add(log.language);
      }
    });
    return Array.from(langs);
  }, [activityLogs, selectedYear, userProfile]);

  useEffect(() => {
    // Auto-select primary language if available in the new year's data, else 'Total'
    if (userProfile?.primaryLanguage && languagesInSelectedYear.includes(userProfile.primaryLanguage)) {
        setSelectedLanguage(userProfile.primaryLanguage);
    } else if (!languagesInSelectedYear.includes(selectedLanguage as Language) && selectedLanguage !== 'Total') {
        setSelectedLanguage('Total');
    }
  }, [selectedYear, languagesInSelectedYear, userProfile?.primaryLanguage]);


  useEffect(() => {
    if (isOpen && availableYears.length > 0) {
      setIsLoading(true);
      try {
        const data = getYearInReviewData(selectedYear, selectedLanguage);
        setReportData(data);
      } catch (e) {
        console.error("Error fetching report data", e);
        setReportData(null); // Or set some error state
      } finally {
        setIsLoading(false);
      }
    } else if (isOpen && availableYears.length === 0) {
      setReportData(null); // No data if no years available
      setIsLoading(false);
    }
  }, [isOpen, selectedYear, selectedLanguage, getYearInReviewData, availableYears]);

  const handleShare = async () => {
    setShareFeedback(null);
    if (!reportData) return;

    const appUrl = "https://luisem93.github.io/Antimetodotracker/";
    const langText = selectedLanguage === 'Total' ? 'todos los idiomas' : selectedLanguage;
    
    let shareText = `¡Mi resumen del ${selectedYear} en El Antimétodo! 🚀\n`;
    shareText += `Dediqué ${reportData.totalHours} horas a ${langText}.\n`;
    if (reportData.topSubActivity) {
      shareText += `Mi actividad más frecuente fue "${reportData.topSubActivity.name}" (${reportData.topSubActivity.hours}h).\n`;
    }
    shareText += `¡Únete al reto! #ElAntimetodo #LanguageLearning\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi Resumen ${selectedYear} - El Antimétodo`,
          text: shareText,
          url: appUrl,
        });
        setShareFeedback("¡Contenido compartido!");
      } catch (error) {
        console.error('Error al compartir:', error);
        setShareFeedback("No se pudo compartir.");
        // Fallback to clipboard if sharing fails for some reason (e.g. user cancels)
        navigator.clipboard.writeText(shareText)
            .then(() => setShareFeedback("¡No se pudo compartir directamente, pero el resumen se copió al portapapeles!"))
            .catch(() => setShareFeedback("Error al compartir y al copiar al portapapeles."));
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(shareText)
        .then(() => setShareFeedback("¡Resumen copiado al portapapeles!"))
        .catch(() => setShareFeedback("Error al copiar al portapapeles."));
    }
     setTimeout(() => setShareFeedback(null), 3000);
  };
  
  // Chart styling based on theme
  const chartTextColor = appTheme === 'dark' ? COLORS.textLightDark : '#555555';
  const chartGridColor = appTheme === 'dark' ? '#4B5563' : '#e0e0e0';
  const chartCardBgColor = appTheme === 'dark' ? COLORS.cardBgDark : COLORS.cardBgLight;

  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent * 100 < 5) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const RADIAN = Math.PI / 180;

  const modalFooter = (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
       <Button onClick={handleShare} variant="accent" size="md" leftIcon={<ShareIcon />} disabled={!reportData || isLoading}>
            Compartir Resumen
        </Button>
      {shareFeedback && <p className="text-xs text-[var(--color-text-light)] text-center sm:text-left">{shareFeedback}</p>}
      <Button onClick={onClose} variant="ghost" size="md">Cerrar</Button>
    </div>
  );


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reporte Anual Detallado" size="xl" footerContent={modalFooter}>
      {availableYears.length === 0 && !isLoading ? (
        <p className="text-center text-[var(--color-text-light)] py-8">
          Aún no hay suficientes datos para generar un reporte anual. ¡Sigue registrando tu progreso!
        </p>
      ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-1">
          <div>
            <label htmlFor="reportYear" className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Año del Reporte:</label>
            <select
              id="reportYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={inputBaseStyle}
              disabled={isLoading}
            >
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="reportLanguage" className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Idioma:</label>
            <select
              id="reportLanguage"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language | 'Total')}
              className={inputBaseStyle}
              disabled={isLoading || languagesInSelectedYear.length <=1}
            >
              {languagesInSelectedYear.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </div>

        {isLoading && <div className="min-h-[300px] flex justify-center items-center"><LoadingSpinner text="Generando reporte..." /></div>}
        
        {!isLoading && reportData && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <Card title="Horas Totales" className="shadow-md">
                <p className="text-4xl font-bold text-[var(--color-primary)]">{reportData.totalHours.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-text-light)]">en {selectedYear}</p>
              </Card>
              <Card title="Días Activos" className="shadow-md">
                <p className="text-4xl font-bold text-[var(--color-primary)]">{reportData.activeDays.toLocaleString()}</p>
                <p className="text-sm text-[var(--color-text-light)]">de actividad</p>
              </Card>
              <Card title="Actividad Top" className="shadow-md">
                {reportData.topSubActivity ? (
                  <>
                    <p className="text-xl font-semibold text-[var(--color-primary)] truncate" title={reportData.topSubActivity.name}>{reportData.topSubActivity.name}</p>
                    <p className="text-sm text-[var(--color-text-light)]">{reportData.topSubActivity.hours.toLocaleString()} horas</p>
                  </>
                ) : (
                  <p className="text-lg text-[var(--color-text-light)] italic">N/A</p>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Desglose por Tipo de Actividad" className="shadow-md">
                {reportData.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reportData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedPieLabel}
                        outerRadius="80%"
                        innerRadius="50%"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={reportData.categoryBreakdown.length > 1 ? 2 : 0}
                      >
                        {reportData.categoryBreakdown.map((entry) => (
                          <Cell key={`cell-cat-${entry.name}`} fill={CATEGORY_COLORS_CHART_HEX[entry.name]} stroke={chartCardBgColor} strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${(value / 60).toFixed(1)} horas`, name]} />
                      <Legend wrapperStyle={{fontSize: '11px', color: chartTextColor}}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-sm text-[var(--color-text-light)] py-4">Sin datos de categorías.</p>}
              </Card>

              <Card title="Desglose por Habilidad" className="shadow-md">
                {reportData.skillBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.skillBreakdown.map(s=> ({...s, value: parseFloat((s.value/60).toFixed(1))}))} layout="vertical" margin={{ top: 5, right:25, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis type="number" stroke={chartTextColor} tick={{ fill: chartTextColor, fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" stroke={chartTextColor} tick={{ fill: chartTextColor, fontSize: 10 }} width={70} interval={0} />
                    <Tooltip formatter={(value: number) => [`${value} horas`, 'Total']} />
                    {/* <Legend wrapperStyle={{fontSize: '11px', color: chartTextColor}} /> */}
                    <Bar dataKey="value" name="Horas" barSize={20}>
                       {reportData.skillBreakdown.map((entry) => (
                        <Cell key={`cell-skill-${entry.name}`} fill={SKILL_COLORS_CHART_HEX[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-center text-sm text-[var(--color-text-light)] py-4">Sin datos de habilidades.</p>}
              </Card>
            </div>
          </div>
        )}
         {!isLoading && !reportData && availableYears.length > 0 && (
             <p className="text-center text-[var(--color-text-light)] py-8">
                No hay datos de actividad para el año {selectedYear} y el idioma "{selectedLanguage}". Prueba con otros filtros.
            </p>
         )}
      </>
      )}
    </Modal>
  );
};
