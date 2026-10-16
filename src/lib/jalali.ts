/**
 * Jalali (Shamsi) date utilities — lightweight, no external dependency.
 * Algorithm: astronomical conversion based on the algorithm by Kazimierz M. Borkowski
 * (with high accuracy 1249 to 3320 Gregorian years). Adapted to TypeScript.
 *
 * All public functions return Persian-digit strings ready to render in the UI.
 */

import { toPersian } from "./persian";

export interface JalaliDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const JALALI_WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/** Returns days since a known epoch; algorithm matches the well-known gregorian_to_jalali. */
function div(a: number, b: number) {
  return Math.floor(a / b);
}

function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    div(gy + 3, 4) -
    div(gy + 99, 100) +
    div(gy + 399, 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * div(days, 12053);
  days = days % 12053;
  jy += 4 * div(days, 1461);
  days = days % 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { year: jy, month: jm, day: jd };
}

/**
 * Convert a JS Date to a Jalali date object.
 */
export function toJalali(date: Date): JalaliDate {
  return gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

/**
 * Format a Jalali date as "YYYY/MM/DD" with Persian digits.
 * Example: 1405/07/23 → ۱۴۰۵/۰۷/۲۳
 */
export function formatJalaliShort(date: Date | JalaliDate): string {
  const j = date instanceof Date ? toJalali(date) : date;
  const mm = String(j.month).padStart(2, "0");
  const dd = String(j.day).padStart(2, "0");
  return toPersian(`${j.year}/${mm}/${dd}`);
}

/**
 * Format a Jalali date as "۲۳ مهر ۱۴۰۵" with Persian digits.
 */
export function formatJalaliLong(date: Date | JalaliDate): string {
  const j = date instanceof Date ? toJalali(date) : date;
  return `${toPersian(j.day)} ${JALALI_MONTHS[j.month - 1]} ${toPersian(j.year)}`;
}

/**
 * Format a Jalali date with weekday: "جمعه ۲۳ مهر ۱۴۰۵"
 */
export function formatJalaliWithWeekday(date: Date): string {
  const j = toJalali(date);
  const wd = JALALI_WEEKDAYS[date.getDay()];
  return `${wd} ${toPersian(j.day)} ${JALALI_MONTHS[j.month - 1]} ${toPersian(j.year)}`;
}

/**
 * Parse a stored "YYYY/MM/DD" Jalali string (Latin or Persian digits) into a JalaliDate.
 */
export function parseJalali(input: string): JalaliDate {
  const latin = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const [y, m, d] = latin.split("/").map((x) => parseInt(x.trim(), 10));
  return { year: y, month: m, day: d };
}

/**
 * Compute days from today (Gregorian) to a Jalali date.
 * Returns negative if already past, 0 if today, >0 if in future.
 *
 * Implementation: convert Jalali → Gregorian, then diff in days.
 */
export function daysUntilJalali(jalaliInput: string): number {
  const j = parseJalali(jalaliInput);
  // Convert Jalali to Gregorian using the inverse algorithm.
  const g = jalaliToGregorian(j);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(g.getFullYear(), g.getMonth(), g.getDate());
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function jalaliToGregorian(j: JalaliDate): Date {
  let gy: number;
  let jy = j.year;
  let jm = j.month;
  let jd = j.day;
  let days: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  if (jm < 7) {
    days = (jm - 1) * 31;
  } else {
    days = (jm - 7) * 30 + 186;
  }
  days += jd + (jy % 4) * 1;
  days += div(jy, 4) * 31 * 4 - div(div(jy, 4) + 3, 4) * 1 - 1;

  gy += 4 * div(days, 1461);
  days = days % 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gd = days + 1;
  let sal_a: number;
  let gm: number;
  if (gy % 4 === 0 && gy % 100 !== 0) {
    sal_a = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  } else {
    sal_a = g_d_m;
  }
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
  }
  gd = days - sal_a[gm - 1] + 1;
  return new Date(gy, gm - 1, gd);
}

/**
 * Format a clock time with Persian digits.
 * Example: "14:20" → "۱۴:۲۰"
 */
export function persianTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return toPersian(`${hh}:${mm}`);
}
