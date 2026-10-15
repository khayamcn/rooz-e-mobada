/**
 * Persian (Farsi) text utilities.
 * Converts Latin digits to Persian digits and applies proper grouping.
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Convert any Latin digits in a string/value to Persian digits.
 */
export function toPersian(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Convert Persian/Arabic digits back to Latin for calculations.
 */
export function toLatin(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/**
 * Format an integer with thousands separators (Persian style).
 */
export function persianNumber(value: number): string {
  return toPersian(value.toLocaleString("en-US"));
}

/**
 * Format a phone number in Persian digit groups.
 * Example: 09121112233 → ۰۹۱۲ ۱۱۱ ۲۲۳۳
 */
export function persianPhone(phone: string): string {
  const digits = toLatin(phone).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return toPersian(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
  }
  if (digits.length === 3) {
    return toPersian(digits); // emergency short codes like 115
  }
  return toPersian(digits);
}
