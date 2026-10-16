/**
 * Rooz-e Mobada — Domain Types (expanded)
 * Adds: profile photos, per-member categories, auth, cloud storage,
 * backup, and versioning.
 */

export type Role = "admin" | "editor" | "viewer";
export type MemberStatus = "active" | "revoked";
export type DocCategory =
  | "identity"
  | "insurance"
  | "property"
  | "medical"
  | "vehicle"
  | "other";
/**
 * Per-member category — replaces flat document list with a tabbed
 * view per member: personal info / ID / education / credentials.
 */
export type MemberCategory =
  | "personal" // اطلاعات فردی
  | "identity" // مدارک شناسایی
  | "education" // مدارک تحصیلی
  | "credentials" // نام‌های کاربری و گذرواژه‌ها
  | "medical" // اطلاعات پزشکی
  | "financial"; // اطلاعات مالی و بانکی
export type GuideCategory =
  | "first_aid"
  | "earthquake"
  | "fire"
  | "home_utilities";
export type SyncStatus = "synced" | "pending" | "conflict" | "failed";
export type OperationType = "INSERT" | "UPDATE" | "SOFT_DELETE";
export type OutboxStatus = "pending" | "in_progress" | "failed" | "conflict";
export type FileTransferStatus =
  | "local_only"
  | "uploading"
  | "uploaded"
  | "downloading"
  | "cached";

export interface FamilyMemberProfile {
  id: string;
  fullName: string;
  role: Role;
  status: MemberStatus;
  phone: string;
  nationalId?: string; // کد ملی — فقط در صورت نیاز، محدود و امن
  relation: string;
  avatarInitials: string;
  avatarDataUrl?: string; // عکس پروفایل — base64 data URL
  isCurrentUser?: boolean;
  lastActiveJalali: string;
}

export interface Family {
  id: string;
  title: string;
  inviteCode: string;
  inviteExpiresAt?: string; // ISO Jalali
  inviteRevoked?: boolean;
  ownerName: string;
  members: FamilyMemberProfile[];
}

export interface VehiclePlate {
  twoDigits: string;
  letter: string;
  threeDigits: string;
  iranCode: string;
}

export interface Vehicle {
  id: string;
  title: string;
  plate: VehiclePlate;
  chassis: string;
  thirdPartyInsCompany: string;
  thirdPartyInsCode: string;
  thirdPartyExpiryJalali: string;
  thirdPartyDaysToExpiry: number;
  bodyInsExpiryJalali: string | null;
  bodyInsStatus: "valid" | "expiring" | "expired" | "none";
  attachmentStatus: FileTransferStatus;
  notes?: string;
  syncStatus: SyncStatus;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: DocCategory;
  memberCategory?: MemberCategory; // اگر متعلق به دسته‌بندی فردی باشد
  ownerId: string; // شناسه عضو صاحب مدرک
  documentNumber: string;
  issueJalali: string;
  expiryJalali: string | null;
  expiryDays: number | null;
  physicalLocation: string;
  notes?: string;
  isPrivate: boolean;
  ownerName: string;
  attachmentLabel: string;
  attachmentStatus: FileTransferStatus;
  imageDataUrl?: string; // تصویر بارگذاری‌شده (base64)
  syncStatus: SyncStatus;
}

/** یک رکورد از دسته «نام کاربری و گذرواژه» — قابل کپی. */
export interface CredentialItem {
  id: string;
  ownerId: string; // عضو صاحب رکورد
  serviceName: string; // مثلاً «اینستاگرام»، «بانک ملت»
  username: string;
  password: string;
  url?: string;
  notes?: string;
  isPrivate: boolean;
  updatedAt: string;
}

/** اطلاعات فردی عضو — نمایش در دسته personal. */
export interface PersonalInfo {
  memberId: string;
  nationalId?: string;
  birthDateJalali?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  emergencyNote?: string;
  address?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationOrRole: string;
  phonePrimary: string;
  phoneSecondary?: string;
  address?: string;
  medicalOrUrgentNote?: string;
  isPrivate: boolean;
  isSystemEmergency?: boolean;
  iconLabel: string;
  priorityOrder: number;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  category: GuideCategory;
  readingTimeMinutes: number;
  summary: string;
  isPinned: boolean;
  isSystemDefault: boolean;
  steps: string[];
}

export interface SyncOperation {
  id: string;
  entityTable: string;
  entityLabel: string;
  operationType: OperationType;
  status: OutboxStatus;
  retryCount: number;
  createdAtJalali: string;
  lastErrorFa?: string;
}

export interface ConflictRecord {
  id: string;
  entityLabel: string;
  localVersion: {
    author: string;
    timestampJalali: string;
    fields: { label: string; value: string }[];
  };
  serverVersion: {
    author: string;
    timestampJalali: string;
    fields: { label: string; value: string }[];
  };
  resolvedAs?: "local" | "server";
}

export interface SyncMetadata {
  connectionStatus: "online" | "offline";
  serverReachable: boolean;
  lastSuccessfulSyncJalali: string;
  lastSuccessfulSyncTime: string;
  pendingOperationsCount: number;
  conflictsCount: number;
}

// ────────────────────────────────────────────────────────────────
// AUTH / FAMILY REGISTRATION MODULE
// ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  mobile: string; // شماره موبایل تأییدشده
  displayName: string;
  nationalId?: string;
  familyId?: string;
  role?: Role;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  token: string; // نشست موقت
  expiresAt: number;
}

export type AuthScreen =
  | "splash"
  | "signup"
  | "otp"
  | "create-family"
  | "join-family"
  | "main-app";

export interface PendingOtp {
  mobile: string;
  code: string; // در تولید: hash شده و در حافظه موقت
  expiresAt: number;
  attempts: number;
}

// ────────────────────────────────────────────────────────────────
// CLOUD STORAGE MODULE
// ────────────────────────────────────────────────────────────────

export interface CloudFolder {
  id: string;
  familyId: string;
  parentId: string | null;
  name: string;
  isPrivate: boolean;
  ownerId: string;
  createdAt: string;
}

export interface CloudFile {
  id: string;
  familyId: string;
  folderId: string | null;
  name: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  ownerName: string;
  dataUrl?: string; // در نسخه دمو: base64
  isPrivate: boolean;
  isOfflineAvailable: boolean;
  deletedAt?: string | null; // در سطل بازیافت
  createdAt: string;
  updatedAt: string;
}

export interface FileActivityLog {
  id: string;
  fileId?: string;
  folderId?: string;
  action:
    | "upload"
    | "rename"
    | "move"
    | "delete"
    | "restore"
    | "download"
    | "permission_change";
  actorName: string;
  details: string;
  timestamp: string;
}

export interface StorageQuota {
  totalBytes: number; // سهمیه کل خانواده (مثلاً ۱ گیگابایت)
  usedBytes: number;
}
