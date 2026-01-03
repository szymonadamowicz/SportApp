export const formatTimeDiff = (
  scheduledAt: Date,
  now: Date = new Date()
): string => {
  const diffMs = scheduledAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return scheduledAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `in ${days}d ${hours}h` : `in ${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`;
  }

  if (minutes > 0) {
    return `in ${minutes}m`;
  }

  return `in ${totalSeconds}s`;
};

export const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

export const isThisWeek = (date: Date, now = new Date()) => {
  const d = new Date(date);
  const n = new Date(now);

  d.setHours(0, 0, 0, 0);
  n.setHours(0, 0, 0, 0);

  const dayOfWeek = (n.getDay() + 6) % 7;

  const startOfWeek = new Date(n);
  startOfWeek.setDate(n.getDate() - dayOfWeek);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return d >= startOfWeek && d < endOfWeek;
};
