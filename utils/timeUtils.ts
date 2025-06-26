
export const formatDurationFromMinutes = (
  totalMinutes: number,
  format: 'short' | 'long' | 'hhmmss' = 'short'
): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return '00:00:00'; // Default for hhmmss if invalid
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  if (format === 'hhmmss') {
    // For hhmmss, we consider seconds to be 0 as we only store total minutes.
    // If you need actual seconds, the source data (ActivityLogEntry) would need to store seconds.
    const seconds = 0; 
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  if (format === 'long') {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // Default to 'short' format
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}min`;
};

// Formatter for HH:MM:SS from total seconds
export const formatTimeHHMMSS = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00:00';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (hours > 0) {
    formatted = `${String(hours).padStart(2, '0')}:${formatted}`;
  }
  return formatted;
};