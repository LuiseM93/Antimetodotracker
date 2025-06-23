
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AppDataExport, Language, ActivityCategory, ActivityLogEntry, TimerMode, UserProfile, AppView, ActivityDetailType } from '../../types';
import { ArrowDownTrayIcon } from '../../components/icons/ArrowDownTrayIcon';
import { ArrowUpTrayIcon } from '../../components/icons/ArrowUpTrayIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon';
import { InformationCircleIcon } from '../../components/icons/InformationCircleIcon';


const inputBaseStyle = "mt-1 block w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

interface BulkImportState {
  totalHours: string;
  language: Language;
  startDate: string;
  endDate: string;
  percentages: Partial<Record<string, string>>; // Key: subActivity.name, Value: percentage string
}

const groupedActivitiesForBulkImport = ANTIMETHOD_ACTIVITIES_DETAILS.reduce((acc, act) => {
    const cat = act.category || ActivityCategory.ACTIVE_IMMERSION; // Default if undefined
    if (!acc[cat]) {
        acc[cat] = [];
    }
    acc[cat].push(act);
    return acc;
}, {} as Record<ActivityCategory, ActivityDetailType[]>);


export const SettingsScreen: React.FC = () => {
  const { exportAppData, importAppData, userProfile, updateUserProfile, addActivityLog, resetAllData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // State for preferences
  const [userName, setUserName] = useState(userProfile?.name || '');
  const [currentLearningLanguages, setCurrentLearningLanguages] = useState<Language[]>(userProfile?.learningLanguages || []);
  const [primaryLanguage, setPrimaryLanguage] = useState(userProfile?.primaryLanguage || (userProfile?.learningLanguages[0] || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language));
  const [defaultLogDuration, setDefaultLogDuration] = useState(userProfile?.defaultLogDurationMinutes || 30);
  const [defaultLogTimerMode, setDefaultLogTimerMode] = useState<TimerMode>(userProfile?.defaultLogTimerMode || 'manual');
  const [languageToAdd, setLanguageToAdd] = useState<Language | ''>('');
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');


  useEffect(() => {
    if (userProfile) {
        setUserName(userProfile.name || '');
        setCurrentLearningLanguages(userProfile.learningLanguages || []);
        setPrimaryLanguage(userProfile.primaryLanguage || ((userProfile.learningLanguages || []).length > 0 ? userProfile.learningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language));
        setDefaultLogDuration(userProfile.defaultLogDurationMinutes || 30);
        setDefaultLogTimerMode(userProfile.defaultLogTimerMode || 'manual');
    }
  }, [userProfile]);


  const handleAddLearningLanguage = () => {
    if (languageToAdd && !currentLearningLanguages.includes(languageToAdd)) {
        const newLearningLanguages = [...currentLearningLanguages, languageToAdd];
        setCurrentLearningLanguages(newLearningLanguages);
        
        // If this is the first language being added, also make it primary.
        if (newLearningLanguages.length === 1) {
            setPrimaryLanguage(languageToAdd);
        }
        setLanguageToAdd(''); // Reset dropdown
    }
  };

  const handleRemoveLearningLanguage = (langToRemove: Language) => {
    if (currentLearningLanguages.length <= 1 && langToRemove === primaryLanguage) {
        alert("No puedes eliminar el único idioma de aprendizaje si también es tu idioma principal. Añade otro idioma primero o cambia tu idioma principal.");
        return;
    }
    const newLearningLanguages = currentLearningLanguages.filter(lang => lang !== langToRemove);
    setCurrentLearningLanguages(newLearningLanguages);
    // If the removed language was primary, update primary language to the first in the new list or a default
    if (primaryLanguage === langToRemove) {
        setPrimaryLanguage(newLearningLanguages.length > 0 ? newLearningLanguages[0] : AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language);
    }
  };

  const handlePreferencesSave = () => {
    if (userProfile) {
        // Validate that primary language is one of the learning languages
        let finalPrimaryLang = primaryLanguage;
        if (currentLearningLanguages.length > 0 && !currentLearningLanguages.includes(primaryLanguage)) {
            finalPrimaryLang = currentLearningLanguages[0]; // Default to first if current primary is no longer valid
        } else if (currentLearningLanguages.length === 0) {
            finalPrimaryLang = AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language; // Global default
        }

        const updates: Partial<UserProfile> = {
            name: userName.trim(),
            learningLanguages: currentLearningLanguages,
            primaryLanguage: finalPrimaryLang,
            defaultLogDurationMinutes: defaultLogDuration,
            defaultLogTimerMode: defaultLogTimerMode
        };
        updateUserProfile(updates);
        // Update local state to reflect the potentially adjusted primary language
        setPrimaryLanguage(finalPrimaryLang); 
        alert("Preferencias guardadas con éxito.");
    }
  };


  const [bulkImportState, setBulkImportState] = useState<BulkImportState>({
    totalHours: '',
    language: userProfile?.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language,
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    percentages: {},
  });
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportFeedback, setBulkImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = () => {
    const data = exportAppData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `antimetodo_datos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as AppDataExport;
        if (data && typeof data === 'object' && ('userProfile' in data || 'activityLogs' in data)) {
          importAppData(data);
          setImportSuccess("¡Datos importados correctamente! La aplicación reflejará los cambios.");
        } else {
          throw new Error("El archivo no parece tener el formato esperado de datos de El Antimétodo.");
        }
      } catch (error) {
        console.error("Error al importar datos:", error);
        setImportError(`Error al importar: ${error instanceof Error ? error.message : "Formato de archivo inválido."}`);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleBulkImportChange = (field: keyof BulkImportState, value: string | Language | Partial<Record<string, string>>) => {
    setBulkImportState(prev => ({ ...prev, [field]: value }));
  };

  const handlePercentageChange = (subActivityName: string, value: string) => {
    setBulkImportState(prev => ({
      ...prev,
      percentages: {
        ...prev.percentages,
        [subActivityName]: value,
      },
    }));
  };

  const processBulkImport = useCallback(async () => {
    setIsBulkImporting(true);
    setBulkImportFeedback(null);

    const { totalHours, language, startDate, endDate, percentages } = bulkImportState;

    const numTotalHours = parseFloat(totalHours);
    if (isNaN(numTotalHours) || numTotalHours <= 0) {
      setBulkImportFeedback({ type: 'error', message: "Las horas totales deben ser un número positivo." });
      setIsBulkImporting(false);
      return;
    }

    if (!startDate || !endDate) {
      setBulkImportFeedback({ type: 'error', message: "Por favor, selecciona un rango de fechas." });
      setIsBulkImporting(false);
      return;
    }

    const dStart = new Date(startDate);
    const dEnd = new Date(endDate);
    if (dStart > dEnd) {
      setBulkImportFeedback({ type: 'error', message: "La fecha de inicio no puede ser posterior a la fecha de fin." });
      setIsBulkImporting(false);
      return;
    }

    let totalPercentage = 0;
    for (const subActivityName in percentages) {
      totalPercentage += parseFloat(percentages[subActivityName] || '0');
    }

    if (Math.abs(totalPercentage - 100) > 0.1 && totalPercentage !== 0) { // Allow small floating point inaccuracies
      setBulkImportFeedback({ type: 'error', message: `La suma de los porcentajes debe ser 100% (actual: ${totalPercentage.toFixed(1)}%).` });
      setIsBulkImporting(false);
      return;
    }
    if (totalPercentage === 0 && numTotalHours > 0) {
        setBulkImportFeedback({ type: 'error', message: "Si hay horas totales, al menos una sub-actividad debe tener un porcentaje." });
        setIsBulkImporting(false);
        return;
    }

    const timeDiff = dEnd.getTime() - dStart.getTime();
    const numDays = Math.max(1, Math.round(timeDiff / (1000 * 3600 * 24)) + 1);
    
    let logsCreatedCount = 0;

    for (const subActivityName in percentages) {
      const percentageStr = percentages[subActivityName];
      if (!percentageStr) continue;

      const percentage = parseFloat(percentageStr);
      if (percentage <= 0) continue;
      
      const activityDetail = ANTIMETHOD_ACTIVITIES_DETAILS.find(act => act.name === subActivityName);
      if (!activityDetail || !activityDetail.category) {
        setBulkImportFeedback({ type: 'error', message: `Detalle de actividad o categoría no encontrada para "${subActivityName}". Por favor, revisa las definiciones.`});
        console.warn(`Activity detail or category not found for ${subActivityName}, skipping.`);
        // Stop processing if a definition is missing to prevent incorrect data
        setIsBulkImporting(false);
        return;
      }
      const category = activityDetail.category;


      const subActivityTotalMinutes = Math.round(numTotalHours * (percentage / 100) * 60);
      if (subActivityTotalMinutes <= 0) continue;

      const baseMinutesPerDay = Math.floor(subActivityTotalMinutes / numDays);
      let remainderMinutes = subActivityTotalMinutes % numDays;

      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(dStart);
        currentDate.setDate(dStart.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        let dailyDuration = baseMinutesPerDay;
        if (remainderMinutes > 0) {
          dailyDuration += 1;
          remainderMinutes -= 1;
        }

        if (dailyDuration > 0) {
          const logEntry: Omit<ActivityLogEntry, 'id'> = {
            language,
            category,
            subActivity: subActivityName,
            durationMinutes: dailyDuration,
            date: dateString,
            notes: `Importado masivamente: ${subActivityName} (${numTotalHours}h totales, ${percentage}% para esta sub-actividad) distribuidas en ${numDays} días.`,
          };
          await new Promise(resolve => setTimeout(resolve, 1)); // Small delay to allow UI updates if many logs
          addActivityLog(logEntry);
          logsCreatedCount++;
        }
      }
    }
    
    setBulkImportFeedback({ type: 'success', message: `Importación completada. Se crearon ${logsCreatedCount} registros.` });
    setIsBulkImporting(false);
    // Optionally reset parts of the form:
    // setBulkImportState(prev => ({ ...prev, totalHours: '', percentages: {} })); 
  }, [bulkImportState, addActivityLog]);

  const handleResetDataConfirmed = () => {
    if (resetConfirmationText.toLowerCase() === 'borrar todo') {
      resetAllData();
      setIsResetModalOpen(false);
      setResetConfirmationText('');
      // AppContext's resetAllData will alert and App.tsx will handle navigation
      // by re-evaluating ProtectedRoute due to userProfile becoming null.
    } else {
      alert("Texto de confirmación incorrecto.");
    }
  };

  const availableLanguagesToAdd = AVAILABLE_LANGUAGES_FOR_LEARNING.filter(lang => !currentLearningLanguages.includes(lang as Language));


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className={`text-3xl font-poppins font-bold text-[var(--color-primary)]`}>Configuración</h1>

      <Card title="Preferencias de Registro y Perfil">
        <div className="space-y-6">
           <div>
            <label htmlFor="userName" className={`block text-sm font-medium text-[var(--color-text-main)]`}>
              Tu Nombre (Opcional):
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ej: Alex"
              className={inputBaseStyle}
            />
          </div>
          {/* Learning Languages Management */}
          <fieldset className="border border-[var(--color-light-purple)] p-4 rounded-md">
            <legend className="text-md font-semibold text-[var(--color-secondary)] px-1">Mis Idiomas de Aprendizaje</legend>
            {currentLearningLanguages.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {currentLearningLanguages.map(lang => (
                  <li key={lang} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span className="text-[var(--color-text-main)]">{lang} {lang === primaryLanguage && <span className="text-xs text-[var(--color-accent)]">(Principal)</span>}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveLearningLanguage(lang)}
                      className="text-red-500 hover:bg-red-100"
                      aria-label={`Quitar ${lang}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-light)] mb-3 italic">No has añadido ningún idioma de aprendizaje.</p>
            )}
            {availableLanguagesToAdd.length > 0 && (
                <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label htmlFor="languageToAdd" className={`block text-xs font-medium text-[var(--color-text-main)]`}>Añadir nuevo idioma:</label>
                    <select
                    id="languageToAdd"
                    value={languageToAdd}
                    onChange={(e) => setLanguageToAdd(e.target.value as Language)}
                    className={inputBaseStyle}
                    >
                    <option value="" disabled>Selecciona un idioma...</option>
                    {availableLanguagesToAdd.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                    </select>
                </div>
                <Button onClick={handleAddLearningLanguage} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} disabled={!languageToAdd}>Añadir</Button>
                </div>
            )}
             {availableLanguagesToAdd.length === 0 && currentLearningLanguages.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">Has añadido todos los idiomas disponibles.</p>
             )}
          </fieldset>

          {/* Other Preferences */}
          <div>
            <label htmlFor="primaryLanguageSelect" className={`block text-sm font-medium text-[var(--color-text-main)]`}>
              Idioma Principal por Defecto (para registros y vistas):
            </label>
            <select
              id="primaryLanguageSelect"
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value as Language)}
              className={inputBaseStyle}
              disabled={currentLearningLanguages.length === 0}
            >
              {currentLearningLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
              {currentLearningLanguages.length === 0 && <option value="" disabled>Añade un idioma de aprendizaje</option>}
            </select>
          </div>
          <div>
            <label htmlFor="defaultLogDuration" className={`block text-sm font-medium text-[var(--color-text-main)]`}>
              Duración por Defecto para Nuevos Registros (minutos):
            </label>
            <input
              type="number"
              id="defaultLogDuration"
              value={defaultLogDuration}
              onChange={(e) => setDefaultLogDuration(parseInt(e.target.value, 10) || 0)}
              min="1"
              step="1"
              className={inputBaseStyle}
            />
          </div>
          <div>
            <label htmlFor="defaultLogTimerMode" className={`block text-sm font-medium text-[var(--color-text-main)]`}>
              Modo de Temporizador por Defecto al Registrar:
            </label>
            <select
              id="defaultLogTimerMode"
              value={defaultLogTimerMode}
              onChange={(e) => setDefaultLogTimerMode(e.target.value as TimerMode)}
              className={inputBaseStyle}
            >
              <option value="manual">Manual</option>
              <option value="stopwatch">Cronómetro</option>
              <option value="countdown">Temporizador</option>
            </select>
          </div>
          <Button onClick={handlePreferencesSave} variant="primary" className="mt-4">
            Guardar Preferencias y Perfil
          </Button>
        </div>
      </Card>

      <Card title="Gestión de Datos (JSON)">
        <div className="p-3 mb-4 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800 text-sm flex items-start">
            <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-yellow-600" />
            <div>
              <span className="font-semibold">Importante:</span> Tus datos se guardan únicamente en este navegador. Te recomendamos
              exportar tus datos regularmente para tener una copia de seguridad y evitar pérdidas si limpias los datos de tu navegador o cambias de dispositivo.
            </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className={`text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-1`}>Exportar Datos</h3>
            <p className={`text-sm text-[var(--color-text-main)] mb-2`}>
              Guarda una copia de todos tus datos de la aplicación en un archivo JSON.
            </p>
            <Button onClick={handleExport} variant="primary" leftIcon={<ArrowDownTrayIcon />}>
              Exportar Mis Datos
            </Button>
          </div>

          <hr className="my-4 border-[var(--color-light-purple)]" />

          <div>
            <h3 className={`text-lg font-poppins font-semibold text-[var(--color-secondary)] mb-1`}>Importar Datos</h3>
            <p className={`text-sm text-[var(--color-text-main)] mb-1`}>
              Importa datos desde un archivo JSON previamente exportado.
            </p>
            <p className={`text-xs text-[var(--color-warning)] bg-yellow-50 border border-yellow-200 p-2 rounded-md mb-2`}>
              <strong className="font-semibold">Advertencia:</strong> Esta acción sobrescribirá todos tus datos actuales.
            </p>
            <Button onClick={handleImportClick} variant="outline" leftIcon={<ArrowUpTrayIcon />}>
              Seleccionar Archivo JSON
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            {importError && <p className="mt-2 text-xs text-[var(--color-error)]">{importError}</p>}
            {importSuccess && <p className="mt-2 text-xs text-[var(--color-success)]">{importSuccess}</p>}
          </div>

          <hr className="my-4 border-[var(--color-light-purple)]" />

          <div>
             <h3 className={`text-lg font-poppins font-semibold text-red-600 mb-1`}>Zona Peligrosa: Restablecer Datos</h3>
             <p className={`text-sm text-[var(--color-text-main)] mb-2`}>
                Esta acción eliminará permanentemente todos tus datos de la aplicación (perfil, registros, metas, rutinas) y te llevará de nuevo a la pantalla de bienvenida.
             </p>
             <Button onClick={() => setIsResetModalOpen(true)} variant="danger" leftIcon={<TrashIcon />}>
                Restablecer Todos los Datos
             </Button>
          </div>
        </div>
      </Card>

      <Card title="Importar Actividad Agregada">
        <p className={`text-[var(--color-text-main)] mb-3`}>
          Si vienes de otra app o tienes muchas horas pasadas sin registrar, puedes importarlas aquí de forma agregada.
          La app distribuirá las horas especificadas diariamente a lo largo del rango de fechas.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="bulkTotalHours" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Total de Horas a Importar:</label>
            <input
              type="number"
              id="bulkTotalHours"
              value={bulkImportState.totalHours}
              onChange={(e) => handleBulkImportChange('totalHours', e.target.value)}
              placeholder="Ej: 170"
              className={inputBaseStyle}
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label htmlFor="bulkLanguage" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Idioma:</label>
            <select
              id="bulkLanguage"
              value={bulkImportState.language}
              onChange={(e) => handleBulkImportChange('language', e.target.value as Language)}
              className={inputBaseStyle}
              disabled={currentLearningLanguages.length === 0}
            >
              {currentLearningLanguages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
               {currentLearningLanguages.length === 0 && <option value="" disabled>Añade un idioma de aprendizaje</option>}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bulkStartDate" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Fecha de Inicio del Período:</label>
              <input type="date" id="bulkStartDate" value={bulkImportState.startDate} onChange={e => handleBulkImportChange('startDate', e.target.value)} className={inputBaseStyle} />
            </div>
            <div>
              <label htmlFor="bulkEndDate" className={`block text-sm font-medium text-[var(--color-text-main)]`}>Fecha de Fin del Período:</label>
              <input type="date" id="bulkEndDate" value={bulkImportState.endDate} onChange={e => handleBulkImportChange('endDate', e.target.value)} className={inputBaseStyle} />
            </div>
          </div>
          
          <fieldset className="mt-4 p-3 border border-[var(--color-input-border)] rounded-md">
            <legend className={`text-md font-semibold text-[var(--color-secondary)] mb-2 px-1`}>Desglose por Sub-Actividad (% del total de horas):</legend>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {Object.entries(groupedActivitiesForBulkImport).map(([categoryName, activities]) => (
                <div key={categoryName} className="mb-3">
                    <h5 className="text-sm font-semibold text-[var(--color-primary)] mb-1.5">{categoryName}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-2 border-l-2 border-[var(--color-light-purple)]">
                        {activities.map(activity => (
                             <div key={activity.name}>
                                <label htmlFor={`percentage-${activity.name}`} className={`block text-xs font-medium text-[var(--color-text-main)] truncate`} title={activity.name}>
                                    {activity.name}:
                                </label>
                                <input
                                    type="number"
                                    id={`percentage-${activity.name}`}
                                    value={bulkImportState.percentages[activity.name] || ''}
                                    onChange={(e) => handlePercentageChange(activity.name, e.target.value)}
                                    placeholder="%"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className={`${inputBaseStyle} text-xs p-1.5`}
                                />
                             </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
          </fieldset>

          {bulkImportFeedback && (
            <p className={`mt-3 text-sm ${bulkImportFeedback.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
              {bulkImportFeedback.message}
            </p>
          )}

          <Button onClick={processBulkImport} variant="accent" disabled={isBulkImporting || currentLearningLanguages.length === 0} className="w-full mt-4">
            {isBulkImporting ? <LoadingSpinner size="sm" text="Importando..." /> : "Importar Horas Agregadas"}
          </Button>
           <p className="text-xs text-gray-500 mt-2">
                Nota: Esta herramienta creará múltiples registros diarios. La suma total de minutos podría variar ligeramente de tu entrada debido al redondeo para la distribución diaria.
           </p>
        </div>
      </Card>

      <Modal 
        isOpen={isResetModalOpen} 
        onClose={() => {setIsResetModalOpen(false); setResetConfirmationText('');}}
        title="Confirmar Restablecimiento de Datos"
      >
        <div className="space-y-4">
          <p className="text-sm text-red-600">
            <strong>¡ADVERTENCIA!</strong> Estás a punto de borrar TODOS tus datos de la aplicación. Esto incluye tu perfil, todos los registros de actividad, metas y plantillas de rutinas.
          </p>
          <p className="text-sm text-[var(--color-text-main)]">
            Esta acción no se puede deshacer.
          </p>
          <p className="text-sm text-[var(--color-text-main)]">
            Para confirmar, por favor escribe "<strong className="text-[var(--color-primary)]">borrar todo</strong>" en el campo de abajo:
          </p>
          <input 
            type="text"
            value={resetConfirmationText}
            onChange={(e) => setResetConfirmationText(e.target.value)}
            className={inputBaseStyle}
            placeholder="borrar todo"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => {setIsResetModalOpen(false); setResetConfirmationText('');}}>Cancelar</Button>
            <Button 
              variant="danger" 
              onClick={handleResetDataConfirmed}
              disabled={resetConfirmationText.toLowerCase() !== 'borrar todo'}
            >
              Restablecer Datos Ahora
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
