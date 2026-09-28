const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const parseTimeToMinutes = (time) => {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

export const getRestaurantOpenStatus = (restaurant, now = new Date()) => {
  const schedule = restaurant?.businessHours;
  if (!schedule?.timezone || !schedule?.open || !schedule?.close || !Array.isArray(schedule.days)) {
    return { isOpen: true, label: restaurant?.statusText || 'Consulte disponibilidade' };
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: schedule.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const weekdayKey = WEEKDAY_KEYS[weekdayIndex];
  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  const openMinutes = parseTimeToMinutes(schedule.open);
  const closeMinutes = parseTimeToMinutes(schedule.close);

  if (!weekdayKey || openMinutes === null || closeMinutes === null || !schedule.days.includes(weekdayKey)) {
    return { isOpen: false, label: 'Fechada agora' };
  }

  const isOpen = closeMinutes > openMinutes
    ? currentMinutes >= openMinutes && currentMinutes < closeMinutes
    : currentMinutes >= openMinutes || currentMinutes < closeMinutes;

  return {
    isOpen,
    label: isOpen ? `Aberta agora, até ${schedule.close}` : `Fechada agora, abre às ${schedule.open}`,
  };
};
