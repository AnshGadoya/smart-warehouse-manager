// utils/helpers.js

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

export const daysUntil = (dateStr) => {
  if (!dateStr) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((new Date(dateStr) - today) / (1000*60*60*24));
};

export const getExpiryStatus = (dateStr) => {
  const days = daysUntil(dateStr);
  if (days < 0)   return { label: 'Expired',    color: '#E53935' };
  if (days < 60)  return { label: 'Near Expiry', color: '#FB8C00' };
  if (days < 180) return { label: 'Medium',      color: '#FDD835' };
  return               { label: 'Far',          color: '#43A047' };
};

export const getRackFillPercent = (current, max) =>
  max ? Math.min(100, Math.round((current / max) * 100)) : 0;

export const getRackColor = (current, max) => {
  const pct = getRackFillPercent(current, max);
  if (pct === 0)  return '#43A047';
  if (pct < 80)   return '#FB8C00';
  return '#E53935';
};

export const getLevelColor = (level) => {
  switch (level) {
    case 'TOP':    return '#1E88E5';
    case 'MIDDLE': return '#FB8C00';
    case 'BOTTOM': return '#43A047';
    default:       return '#9E9E9E';
  }
};

export const truncate = (str, len = 28) =>
  str && str.length > len ? str.substring(0, len) + '…' : str;
