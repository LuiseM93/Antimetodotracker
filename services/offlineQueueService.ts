
import { ActivityLogEntry } from '../types';
import { supabase } from './supabaseClient';

const OFFLINE_QUEUE_KEY = 'offlineActivityQueue';

// Obtener la cola del localStorage
const getQueue = (): ActivityLogEntry[] => {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
};

// Guardar la cola en el localStorage
const saveQueue = (queue: ActivityLogEntry[]) => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

// Añadir una actividad a la cola
export const addToOfflineQueue = (activity: ActivityLogEntry) => {
    const queue = getQueue();
    queue.push(activity);
    saveQueue(queue);
};

// Sincronizar la cola con Supabase
export const syncOfflineQueue = async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    console.log(`Sincronizando ${queue.length} actividades pendientes...`);

    const successfulUploads: ActivityLogEntry[] = [];

    for (const activity of queue) {
        try {
            const { error } = await supabase.from('activity_logs').insert(activity);
            if (error) {
                throw error;
            }
            successfulUploads.push(activity);
        } catch (error) {
            console.error("Error al sincronizar la actividad:", error);
            // Si hay un error, dejamos de sincronizar para no perder datos
            break;
        }
    }

    // Eliminar las actividades subidas correctamente de la cola
    const newQueue = queue.filter(activity => !successfulUploads.includes(activity));
    saveQueue(newQueue);

    if (successfulUploads.length > 0) {
        console.log(`${successfulUploads.length} actividades sincronizadas correctamente.`);
        // Opcional: mostrar una notificación al usuario
    }
};

// Escuchar los cambios de estado de la conexión
export const initializeOfflineSync = () => {
    window.addEventListener('online', syncOfflineQueue);

    // Sincronizar al iniciar la aplicación por si había algo pendiente
    if (navigator.onLine) {
        syncOfflineQueue();
    }
};
