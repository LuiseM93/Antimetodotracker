
import React, { useRef, useState, useCallback, useEffect } from 'react';
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

const inputBaseStyle = "w-full p-2.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg shadow-sm text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm";

export const SettingsScreen: React.FC = () => {
    const { 
        userProfile, updateUserProfile, signOut, exportAppData, importAppData, resetAllData, appTheme, updateAppTheme 
    } = useAppContext();
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmationInput, setResetConfirmationInput] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const importFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userProfile) {
            setProfileForm({
                ...userProfile,
                defaultLogDurationSeconds: userProfile.defaultLogDurationSeconds || 30 * 60,
                defaultLogTimerMode: userProfile.defaultLogTimerMode || 'manual',
                dashboardCardDisplayMode: userProfile.dashboardCardDisplayMode || DEFAULT_DASHBOARD_CARD_DISPLAY_MODE
            });
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
                        <label htmlFor="appTheme" className="block text-sm font-medium text-[var(--color-text-main)]">Tema de la Aplicación</label>
                        <select
                            id="appTheme"
                            value={appTheme}
                            onChange={e => updateAppTheme(e.target.value as AppTheme)}
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