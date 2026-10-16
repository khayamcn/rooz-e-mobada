/**
 * Rooz-e Mobada — Domain Types v3.0
 *
 * Comprehensive offline personal vault for managing:
 * - People (family members with profiles)
 * - Bank cards (card, account, IBAN, CVV2, expiry)
 * - Bills (water, electricity, gas, other)
 * - Identity documents (national ID, birth cert, passport, driver license)
 * - Vehicle documents (vehicle card, ownership, insurance)
 * - Property documents (deeds, contracts, power of attorney)
 * - Education documents (certificates, diplomas, awards)
 * - Credentials (usernames and passwords)
 * - Medical info
 * - Emergency contacts and guides
 *
 * All data is stored locally. Backup/restore is encrypted.
 */

// ── Theme ──────────────────────────────────────────────
export type Theme = "light" | "dark";
export type ColorTheme = "violet" | "emerald" | "rose" | "blue";

// ── People ────────────────────────────────────────────
export interface Person {
  id: string;
  fullName: string;
  relation: string;
  phone: string;
  avatarDataUrl?: string;
  avatarColor: string; // gradient seed
  birthDateJalali?: string;
  bloodType?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
}

// ── Bank Cards ────────────────────────────────────────
export interface BankCard {
  id: string;
  personId: string;
  bankName: string;
  cardNumber: string; // 16 digits
  accountNumber: string;
  shaba: string; // IR...
  cvv2: string;
  expiryMonth: string; // MM
  expiryYear: string; // YY (Jalali or Gregorian)
  cardHolderName: string;
  cardImageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

// ── Bills ─────────────────────────────────────────────
export type BillType = "water" | "electricity" | "gas" | "telephone" | "mobile" | "internet" | "other";
export interface Bill {
  id: string;
  personId: string;
  billType: BillType;
  provider: string;
  billId: string; // شناسه قبض
  paymentId: string; // شناسه پرداخت
  isPaid: boolean;
  imageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

// ── Documents (unified) ───────────────────────────────
export type DocumentCategory =
  | "identity" // مدارک شناسایی (کارت ملی، شناسنامه، گذرنامه، گواهینامه)
  | "vehicle" // مدارک خودرو (کارت خودرو، سند، بیمه)
  | "property" // مدارک ملکی (سند، قرارداد، وکالت)
  | "education" // مدارک تحصیلی (گواهی، لوح تقدیر)
  | "insurance" // بیمه‌نامه‌ها
  | "medical" // مدارک پزشکی
  | "contract" // قراردادها
  | "other"; // سایر

export interface DocumentItem {
  id: string;
  personId: string;
  title: string;
  category: DocumentCategory;
  documentType?: string;
  documentNumber: string;
  issueDateJalali?: string;
  expiryDateJalali?: string;
  physicalLocation?: string;
  notes?: string;
  imageUrls: string[];
  createdAt: string;
  // ── Vehicle-specific fields ──
  licenseNumber?: string; // شماره گواهینامه
  licenseSerial?: string; // شماره سریال گواهینامه
  licenseIssueDate?: string; // تاریخ صدور گواهینامه
  vinNumber?: string; // شماره VIN خودرو
  plateNumber?: string; // شماره پلاک
  cardSerial?: string; // شماره سریال بارکد کارت ماشین
  serialNumber?: string; // شماره مسلسل
  chassisNumber?: string; // شماره شاسی
  engineNumber?: string; // شماره موتور
  // ── Property-specific fields ──
  contractNumber?: string; // شماره قولنامه
  trackingCode?: string; // کد رهگیری
  // ── Insurance-specific fields ──
  insuranceNumber?: string; // شماره بیمه
  insuranceType?: string; // نوع بیمه (تامین اجتماعی، ماشین، درمانی)
  insuranceDate?: string; // تاریخ بیمه
}

// ── Credentials ───────────────────────────────────────
export interface Credential {
  id: string;
  personId: string;
  serviceName: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  isPrivate: boolean;
  updatedAt: string;
}

// ── Emergency Contacts ────────────────────────────────
export interface EmergencyContact {
  id: string;
  name: string;
  relationOrRole: string;
  phonePrimary: string;
  phoneSecondary?: string;
  address?: string;
  medicalOrUrgentNote?: string;
  iconLabel: string;
  priorityOrder: number;
  isSystemEmergency?: boolean;
}

// ── Guides ────────────────────────────────────────────
export interface EmergencyGuide {
  id: string;
  title: string;
  category: "first_aid" | "earthquake" | "fire" | "home_utilities";
  readingTimeMinutes: number;
  summary: string;
  steps: string[];
}

// ── App State ─────────────────────────────────────────
export type ScreenId = "home" | "people" | "documents" | "cards" | "bills" | "passwords" | "settings";
