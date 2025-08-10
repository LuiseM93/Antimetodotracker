

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `hace ${years} año${years > 1 ? 's' : ''}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  if (seconds < 10) {
      return "justo ahora";
  }
  return `hace ${Math.floor(seconds)} segundos`;
}

export const getLocalDateISOString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

