import test from 'node:test';
import assert from 'node:assert/strict';
import { getMakassarDateTime, formatIndoDate, isSameDayAttendance } from './timezone';

test('getMakassarDateTime computes valid format', () => {
  // Using fixed UTC date: 2026-11-08T11:00:00Z -> Makassar is UTC+8, so 2026-11-08 19:00:00
  const fixedDate = new Date('2026-11-08T11:00:00.000Z');
  const res = getMakassarDateTime(fixedDate);
  assert.equal(res.tanggal, '2026-11-08');
  assert.equal(res.waktu, '19:00:00');
  assert.equal(res.year, 2026);
  assert.equal(res.month, 11);
  assert.equal(res.day, 8);
  assert.equal(res.formattedTimeWITA, '19:00:00 WITA');
});

test('formatIndoDate formats YYYY-MM-DD properly', () => {
  const formatted = formatIndoDate('2026-11-08');
  assert.match(formatted, /8/);
  assert.match(formatted, /November/i);
  assert.match(formatted, /2026/);
});

test('isSameDayAttendance correctly checks duplicate day attendance', () => {
  assert.equal(isSameDayAttendance('2026-11-08', '2026-11-08'), true);
  assert.equal(isSameDayAttendance('2026-11-08', '2026-11-09'), false);
});
