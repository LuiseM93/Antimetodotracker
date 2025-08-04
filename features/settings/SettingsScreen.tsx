
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { UserProfile, Language, TimerMode, AppTheme, AppDataExport, DashboardCardDisplayMode, AppView } from '../../types.ts';
import { AVAILABLE_LANGUAGES_FOR_LEARNING, DEFAULT_DASHBOARD_CARD_DISPLAY_MODE, AVAILABLE_REWARDS } from '../../constants.ts';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ArrowDownTrayIcon } from '../../components/icons/ArrowDownTrayIcon.tsx';
import { ArrowUpTrayIcon } from '../../components/icons/ArrowUpTrayIcon.tsx';
import { TrashIcon } from '../../components/icons/TrashIcon.tsx';
import { AvatarUploader } from './AvatarUploader.tsx';
import { ActivityCategory, ActivityLogEntry, ActivityDetailType, Skill } from '../../types.ts';
import { ANTIMETHOD_ACTIVITIES_DETAILS } from '../../constants.ts';

const inputBaseStyle = "w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const SettingsScreen: React.FC = () => {
    const { 
        userProfile, updateUserProfile, signOut, exportAppData, importAppData, resetAllData, appTheme, updateAppTheme, addActivityLog, getCombinedActivities, bulkAddActivityLogs
    } = useAppContext();
    const navigate = useNavigate();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmationInput, setResetConfirmationInput] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isBulkImporting, setIsBulkImporting] = useState(false);
    const [bulkImportFeedback, setBulkImportFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);

    const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
    const [bulkImportState, setBulkImportState] = useState({
        totalHoursToImport: 0,
        language: AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language, // Initialize with a default language
        startDate: '',
        endDate: '',
        subActivityPercentages: {} as Record<string, number>, // { "Activity Name": percentage }
    });

    useEffect(() => {
        if (userProfile) {
            setProfileForm({
                ...userProfile,
                defaultLogDurationSeconds: userProfile.defaultLogDurationSeconds || 30 * 60,
                defaultLogTimerMode: userProfile.defaultLogTimerMode || 'manual',
                dashboardCardDisplayMode: userProfile.dashboardCardDisplayMode || DEFAULT_DASHBOARD_CARD_DISPLAY_MODE,
                aboutMe: userProfile.aboutMe || '',
                socialLinks: userProfile.socialLinks || {},
            });
            setBulkImportState(prev => ({
                ...prev,
                language: userProfile.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language,
            }));
        }
    }, [userProfile]);

    const handleFormChange = (field: keyof UserProfile, value: any) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLanguageToggle = (lang: Language) => {
        const currentLanguages = profileForm.learningLanguages || [];
        const newLanguages = currentLanguages.includes(lang)
            ? currentLanguages.filter(l => l !== lang)
            : [...currentLanguages, lang];
        handleFormChange('learningLanguages', newLanguages);
    };

    const handleSaveChanges = useCallback(() => {
        if (userProfile && profileForm) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (profileForm.username && !usernameRegex.test(profileForm.username)) {
                alert("El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guiones bajos.");
                return;
            }
            updateUserProfile(profileForm);
            alert('¡Configuración guardada!');
        }
    }, [userProfile, profileForm, updateUserProfile]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/'); // Navigate to auth screen after sign out
    };

    const handleExportData = () => {
        const data = exportAppData();
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `antimetodo_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleFileDataRead = async (event: ProgressEvent<FileReader>) => {
        setIsImporting(true);
        try {
            const text = event.target?.result;
            if (typeof text === 'string') {
                const data = JSON.parse(text) as AppDataExport;
                if (window.confirm("¿Estás seguro de que quieres importar estos datos? Esto sobrescribirá tus configuraciones locales y añadirá tus registros a la nube.")) {
                   const result = await importAppData(data);
                   if (result.success) {
                       alert("Datos importados con éxito. La página se recargará.");
                       window.location.reload();
                   } else {
                       alert(`Error al importar: ${result.error}`);
                   }
                }
            }
        } catch (error) {
            console.error("Error al importar el archivo:", error);
            alert("Error: El archivo no es un JSON válido.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = handleFileDataRead;
        reader.readAsText(file);
        // Reset file input value to allow re-uploading the same file
        event.target.value = '';
    };

    const handleBulkImportChange = (field: string, value: any) => {
        setBulkImportState(prev => ({ ...prev, [field]: value }));
    };

    const handlePercentageChange = (activityName: string, percentage: number) => {
        setBulkImportState(prev => ({
            ...prev,
            subActivityPercentages: {
                ...prev.subActivityPercentages,
                [activityName]: percentage,
            },
        }));
    };

    const processBulkImport = async () => {
        if (!userProfile) {
            setBulkImportFeedback({ message: "Perfil de usuario no cargado.", type: "error" });
            return;
        }

        setIsBulkImporting(true);
        setBulkImportFeedback(null);

        const { totalHoursToImport, language, startDate, endDate, subActivityPercentages } = bulkImportState;

        if (totalHoursToImport <= 0 || !language || !startDate || !endDate) {
            setBulkImportFeedback({ message: "Por favor, completa todos los campos requeridos y asegúrate que las horas sean positivas.", type: "error" });
            setIsBulkImporting(false);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            setBulkImportFeedback({ message: "La fecha de inicio no puede ser posterior a la fecha de fin.", type: "error" });
            setIsBulkImporting(false);
            return;
        }

        const totalPercentage = Object.values(subActivityPercentages).reduce((sum, p) => sum + p, 0);
        if (totalPercentage !== 100) {
            setBulkImportFeedback({ message: `Los porcentajes de sub-actividad deben sumar 100%. Actualmente suman ${totalPercentage}%.`, type: "error" });
            setIsBulkImporting(false);
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day

        const totalSecondsToImport = totalHoursToImport * 3600;
        const secondsPerDay = totalSecondsToImport / diffDays;

        let logsToCreate: Omit<ActivityLogEntry, 'id' | 'user_id' | 'created_at'>[] = [];
        const allActivities = getCombinedActivities();

        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            const formattedDate = currentDate.toISOString().split('T')[0];

            let remainingSecondsForDay = secondsPerDay;

            for (const activityName in subActivityPercentages) {
                const percentage = subActivityPercentages[activityName];
                if (percentage > 0) {
                    const activitySeconds = (secondsPerDay * percentage) / 100;
                    const activityDetail = allActivities.find(act => act.name === activityName);

                    if (activityDetail) {
                        logsToCreate.push({
                            language: language,
                            category: activityDetail.category || ActivityCategory.ACTIVE_IMMERSION, // Default if not found
                            sub_activity: activityName,
                            custom_title: null,
                            duration_seconds: Math.round(activitySeconds),
                            date: formattedDate,
                            start_time: null,
                            notes: "Importado masivamente",
                        });
                    } else {
                        console.warn(`Actividad ${activityName} no encontrada en la lista de actividades.`);
                    }
                }
            }
        }

        try {
            // Using addActivityLog for now, but a bulk insert would be better for performance
            // For simplicity, iterating and adding one by one.
            await bulkAddActivityLogs(logsToCreate);
            setBulkImportFeedback({ message: `¡${logsToCreate.length} registros de actividad importados con éxito!`, type: "success" });
            setBulkImportState({
                totalHoursToImport: 0,
                language: userProfile.primaryLanguage || AVAILABLE_LANGUAGES_FOR_LEARNING[0] as Language,
                startDate: '',
                endDate: '',
                subActivityPercentages: {},
            });
        } catch (error) {
            console.error("Error al importar actividades masivamente:", error);
            setBulkImportFeedback({ message: "Error al importar actividades masivamente.", type: "error" });
        } finally {
            setIsBulkImporting(false);
        }
    };

    const groupedActivitiesForBulkImport = useMemo(() => {
        const allActivities = getCombinedActivities();
        return allActivities.reduce((acc, activity) => {
            const category = activity.category || ActivityCategory.ACTIVE_IMMERSION;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(activity);
            return acc;
        }, {} as Record<ActivityCategory, ActivityDetailType[]>);
    }, [getCombinedActivities]);

    const totalPercentageEntered = Object.values(bulkImportState.subActivityPercentages).reduce((sum, p) => sum + p, 0);

    if (!userProfile) {
        return <div className="p-4 text-center">Cargando...</div>;
    }
    
    const availableThemes = AVAILABLE_REWARDS.filter(r => r.type === 'theme').map(r => ({id: r.id, name: r.name, value: r.value as AppTheme}));

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-poppins font-bold text-[var(--color-primary)]">Configuración</h1>

            <Card title="Foto de Perfil">
                <AvatarUploader />
            </Card>

            <Card title="Perfil de Usuario">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-[var(--color-text-main)]">Nombre a Mostrar</label>
                        <input id="displayName" type="text" value={profileForm.display_name || ''} onChange={e => handleFormChange('display_name', e.target.value)} className={inputBaseStyle} />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text-main)]">Nombre de Usuario (Único)</label>
                        <input id="username" type="text" value={profileForm.username || ''} onChange={e => handleFormChange('username', e.target.value)} className={inputBaseStyle} />
                        <p className="text-xs text-gray-500 mt-1">3-20 caracteres (a-z, 0-9, _). Cambiar esto afectará la URL de tu perfil.</p>
                    </div>
                    <div>
                        <label htmlFor="aboutMe" className="block text-sm font-medium text-[var(--color-text-main)]">Acerca de Mí</label>
                        <textarea id="aboutMe" value={profileForm.aboutMe || ''} onChange={e => handleFormChange('aboutMe', e.target.value)} className={`${inputBaseStyle} h-24 resize-y`} placeholder="Un poco sobre ti..."></textarea>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-md font-medium text-[var(--color-text-main)]">Enlaces Sociales</h3>
                        <div>
                            <label htmlFor="twitter" className="block text-sm font-medium text-[var(--color-text-light)]">Twitter URL</label>
                            <input id="twitter" type="url" value={profileForm.socialLinks?.twitter || ''} onChange={e => handleFormChange('socialLinks', { ...profileForm.socialLinks, twitter: e.target.value })} className={inputBaseStyle} placeholder="https://twitter.com/tu_usuario" />
                        </div>
                        <div>
                            <label htmlFor="youtube" className="block text-sm font-medium text-[var(--color-text-light)]">YouTube URL</label>
                            <input id="youtube" type="url" value={profileForm.socialLinks?.youtube || ''} onChange={e => handleFormChange('socialLinks', { ...profileForm.socialLinks, youtube: e.target.value })} className={inputBaseStyle} placeholder="https://youtube.com/tu_canal" />
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-medium text-[var(--color-text-light)]">Instagram URL</label>
                            <input id="instagram" type="url" value={profileForm.socialLinks?.instagram || ''} onChange={e => handleFormChange('socialLinks', { ...profileForm.socialLinks, instagram: e.target.value })} className={inputBaseStyle} placeholder="https://instagram.com/tu_usuario" />
                        </div>
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-[var(--color-text-light)]">Sitio Web URL</label>
                            <input id="website" type="url" value={profileForm.socialLinks?.website || ''} onChange={e => handleFormChange('socialLinks', { ...profileForm.socialLinks, website: e.target.value })} className={inputBaseStyle} placeholder="https://tu_sitio.com" />
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Idiomas">
                <p className="text-sm text-[var(--color-text-light)] mb-3">Selecciona los idiomas que estás aprendiendo activamente.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {AVAILABLE_LANGUAGES_FOR_LEARNING.map(lang => (
                        <div key={lang} className="flex items-center">
                            <input
                                id={`lang-${lang}`}
                                type="checkbox"
                                checked={(profileForm.learningLanguages || []).includes(lang)}
                                onChange={() => handleLanguageToggle(lang)}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                            />
                            <label htmlFor={`lang-${lang}`} className="ml-2 block text-sm text-[var(--color-text-main)]">{lang}</label>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Preferencias de Registro">
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="defaultLogDuration" className="block text-sm font-medium text-[var(--color-text-main)]">Duración Predeterminada del Registro (minutos)</label>
                        <input
                            id="defaultLogDuration"
                            type="number"
                            value={Math.round((profileForm.defaultLogDurationSeconds || 0) / 60)}
                            onChange={e => handleFormChange('defaultLogDurationSeconds', parseInt(e.target.value, 10) * 60)}
                            className={inputBaseStyle}
                            min="1"
                        />
                    </div>
                    <div>
                        <label htmlFor="defaultLogTimerMode" className="block text-sm font-medium text-[var(--color-text-main)]">Modo del Temporizador Predeterminado</label>
                        <select
                            id="defaultLogTimerMode"
                            value={profileForm.defaultLogTimerMode || 'manual'}
                            onChange={e => handleFormChange('defaultLogTimerMode', e.target.value as TimerMode)}
                            className={inputBaseStyle}
                        >
                            <option value="stopwatch">Cronómetro</option>
                            <option value="countdown">Temporizador</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Personalización">
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="appTheme" className="block text-sm font-medium text-[var(--color-text-main)]">Tema de la Aplicación (Solo para ti)</label>
                        <select
                            id="appTheme"
                            value={appTheme}
                            onChange={e => updateAppTheme(e.target.value as AppTheme)}
                            className={inputBaseStyle}
                        >
                            <option value="light">Claro (Predeterminado)</option>
                            <option value="dark">Oscuro (Predeterminado)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="profileTheme" className="block text-sm font-medium text-[var(--color-text-main)]">Tema de Perfil (Visible para otros)</label>
                        <select
                            id="profileTheme"
                            value={profileForm.theme || 'light'}
                            onChange={e => handleFormChange('theme', e.target.value as AppTheme)}
                            className={inputBaseStyle}
                        >
                            <option value="light">Claro (Predeterminado)</option>
                            <option value="dark">Oscuro (Predeterminado)</option>
                            {availableThemes.map(theme => (
                                 <option key={theme.id} value={theme.value} disabled={!userProfile.unlockedRewards.includes(theme.id)}>
                                    {theme.name.replace("Tema: ", "")} {!userProfile.unlockedRewards.includes(theme.id) ? '(Bloqueado)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dashboardCardDisplayMode" className="block text-sm font-medium text-[var(--color-text-main)]">Tarjetas de Estado del Dashboard</label>
                         <select
                            id="dashboardCardDisplayMode"
                            value={profileForm.dashboardCardDisplayMode || 'learning_days_and_health'}
                            onChange={e => handleFormChange('dashboardCardDisplayMode', e.target.value as DashboardCardDisplayMode)}
                            className={inputBaseStyle}
                        >
                             <option value="learning_days_and_health">Días y Consistencia (Separadas)</option>
                             <option value="combined">Combinadas</option>
                             <option value="learning_days_only">Solo Días de Aprendizaje</option>
                             <option value="health_only">Solo Consistencia de Hábitos</option>
                             <option value="none">Ocultar Tarjetas</option>
                         </select>
                    </div>
                 </div>
            </Card>

            <div className="flex justify-end mt-6">
                <Button variant="primary" size="lg" onClick={handleSaveChanges}>
                    Guardar Cambios
                </Button>
            </div>

            <Card title="Importar Actividad Agregada" className="border-t-4 border-blue-500">
                <p className="text-sm text-[var(--color-text-light)] mb-4">
                    Importa un total de horas distribuidas en un rango de fechas y sub-actividades.
                </p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="totalHoursToImport" className="block text-sm font-medium text-[var(--color-text-main)]">Total de Horas a Importar</label>
                        <input
                            id="totalHoursToImport"
                            type="number"
                            value={bulkImportState.totalHoursToImport || ''}
                            onChange={e => handleBulkImportChange('totalHoursToImport', parseInt(e.target.value, 10) || 0)}
                            className={inputBaseStyle}
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="bulkImportLanguage" className="block text-sm font-medium text-[var(--color-text-main)]">Idioma</label>
                        <select
                            id="bulkImportLanguage"
                            value={bulkImportState.language}
                            onChange={e => handleBulkImportChange('language', e.target.value as Language)}
                            className={inputBaseStyle}
                        >
                            {userProfile?.learningLanguages && userProfile.learningLanguages.length > 0
                                ? userProfile.learningLanguages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))
                                : AVAILABLE_LANGUAGES_FOR_LEARNING.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-[var(--color-text-main)]">Fecha de Inicio</label>
                            <input
                                id="startDate"
                                type="date"
                                value={bulkImportState.startDate}
                                onChange={e => handleBulkImportChange('startDate', e.target.value)}
                                className={inputBaseStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-[var(--color-text-main)]">Fecha de Fin</label>
                            <input
                                id="endDate"
                                type="date"
                                value={bulkImportState.endDate}
                                onChange={e => handleBulkImportChange('endDate', e.target.value)}
                                className={inputBaseStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-3 border border-[var(--color-input-border)] rounded-md">
                        <h4 className="text-md font-semibold text-[var(--color-text-main)]">Desglose por Sub-Actividad (Porcentaje)</h4>
                        <p className="text-sm text-[var(--color-text-light)] mb-2">Asegúrate de que el total sume 100%.</p>
                        
                        {Object.keys(groupedActivitiesForBulkImport).length === 0 ? (
                            <p className="text-sm text-[var(--color-text-light)] italic">No hay actividades disponibles para desglosar.</p>
                        ) : (
                            Object.entries(groupedActivitiesForBulkImport).map(([category, activities]) => (
                                <div key={category} className="mb-4">
                                    <h5 className="text-sm font-medium text-[var(--color-text-main)] mb-2">{category}</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activities.map(activity => (
                                            <div key={activity.name} className="flex items-center space-x-2">
                                                <label htmlFor={`percent-${activity.name}`} className="text-sm text-[var(--color-text-main)] flex-grow">{activity.name}</label>
                                                <input
                                                    id={`percent-${activity.name}`}
                                                    type="number"
                                                    value={bulkImportState.subActivityPercentages[activity.name] || ''}
                                                    onChange={e => handlePercentageChange(activity.name, parseInt(e.target.value, 10) || 0)}
                                                    className="w-20 p-1.5 text-sm border border-[var(--color-input-border)] rounded-md text-center"
                                                    min="0" max="100"
                                                />
                                                <span className="text-sm text-[var(--color-text-main)]">%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="text-right text-sm font-semibold text-[var(--color-text-main)] mt-4">
                            Total: <span className={`${totalPercentageEntered === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalPercentageEntered}%</span>
                        </div>
                    </div>

                    {bulkImportFeedback && (
                        <div className={`p-3 rounded-md text-center text-sm ${bulkImportFeedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {bulkImportFeedback.message}
                        </div>
                    )}

                    <Button
                        onClick={processBulkImport}
                        variant="primary"
                        isLoading={isBulkImporting}
                        disabled={isBulkImporting || totalPercentageEntered !== 100}
                        className="w-full"
                    >
                        {isBulkImporting ? 'Importando...' : 'Importar Horas Agregadas'}
                    </Button>
                </div>
            </Card>

             <Card title="Gestión de Datos" className="border-t-4 border-yellow-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={handleExportData} variant="outline" leftIcon={<ArrowDownTrayIcon />}>
                        Exportar mis datos
                    </Button>
                    <Button 
                        onClick={handleImportClick} 
                        variant="outline" 
                        leftIcon={<ArrowUpTrayIcon />}
                        isLoading={isImporting}
                        disabled={isImporting}
                    >
                        {isImporting ? 'Importando...' : 'Importar desde archivo'}
                    </Button>
                    <input type="file" ref={importFileRef} onChange={handleImportFileChange} className="hidden" accept=".json" />
                </div>
             </Card>
             
             <Card title="Zona de Peligro" className="border-t-4 border-red-500">
                <div className="space-y-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Reiniciar Todos los Datos</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Esta acción eliminará permanentemente todo tu perfil, registros, metas y configuraciones de este navegador. <strong>No se puede deshacer.</strong>
                        </p>
                        <Button onClick={() => setIsResetModalOpen(true)} variant="danger" className="mt-3">
                            Reiniciar Datos
                        </Button>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Cerrar Sesión</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">Cerrarás tu sesión en este dispositivo.</p>
                        <Button onClick={handleSignOut} variant="danger" className="mt-3">
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
             </Card>

            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirmación de Reinicio Total">
                <p className="text-[var(--color-text-main)] mb-4">
                    Estás a punto de borrar <strong>todos tus datos</strong>. Esta acción es irreversible. Para confirmar, por favor escribe "BORRAR" en el campo de abajo.
                </p>
                <input 
                    type="text"
                    value={resetConfirmationInput}
                    onChange={(e) => setResetConfirmationInput(e.target.value)}
                    className={inputBaseStyle}
                    placeholder='Escribe "BORRAR" aquí'
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>Cancelar</Button>
                    <Button 
                        variant="danger"
                        disabled={resetConfirmationInput !== 'BORRAR'}
                        onClick={() => {
                            resetAllData();
                            setIsResetModalOpen(false);
                            navigate(AppView.ONBOARDING);
                        }}
                    >
                        Entiendo, borrar todo
                    </Button>
                </div>
            </Modal>
        </div>
    );
};