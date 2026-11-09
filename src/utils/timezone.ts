/**
 * Utility functions for timezone handling (Asia/Makassar - WITA, UTC+8)
 */

export interface MakassarDateTime {
  tanggal: string; // YYYY-MM-DD
  waktu: string;   // HH:mm:ss
  year: number;
  month: number;
  day: number;
  formattedDateIndo: string; // e.g. "Minggu, 8 November 2026"
  formattedTimeWITA: string; // e.g. "19:03:00 WITA"
}

export function getMakassarDateTime(date: Date = new Date()): MakassarDateTime {
  const timeZone = 'Asia/Makassar';

  const partsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = partsFormatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

  const yearStr = getPart('year');
  const monthStr = getPart('month');
  const dayStr = getPart('day');
  let hourStr = getPart('hour');
  if (hourStr === '24') hourStr = '00';
  const minuteStr = getPart('minute');
  const secondStr = getPart('second');

  const tanggal = `${yearStr}-${monthStr}-${dayStr}`;
  const waktu = `${hourStr}:${minuteStr}:${secondStr}`;

  const indoDateFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    tanggal,
    waktu,
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
    day: parseInt(dayStr, 10),
    formattedDateIndo: indoDateFormatter.format(date),
    formattedTimeWITA: `${waktu} WITA`,
  };
}

export function formatIndoDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(Date.UTC(year, month - 1, day, 4, 0, 0)); // avoid local TZ offset shifts
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function isSameDayAttendance(existingDate: string, checkDate: string): boolean {
  return existingDate === checkDate;
}
