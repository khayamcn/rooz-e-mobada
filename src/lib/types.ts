/**
 * Rooz-e Mobada — Domain Types
 * Mirrors the 10-entity schema from the design brief, with
 * local-first fields (sync_status, conflict_data).
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
  relation: string;
  avatarInitials: string;
  isCurrentUser?: boolean;
  lastActiveJalali: string;
}

export interface Family {
  id: string;
  title: string;
  inviteCode: string;
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
  documentNumber: string;
  issueJalali: string;
  expiryJalali: string | null;
  expiryDays: number | null; // <0 = expired, 0-30 = expiring soon, >30 = valid
  physicalLocation: string;
  notes?: string;
  isPrivate: boolean;
  ownerName: string;
  attachmentLabel: string;
  attachmentStatus: FileTransferStatus;
  syncStatus: SyncStatus;
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
  isSystemEmergency?: boolean; // for 115, 110, 125...
  iconLabel: string; // emoji or short label
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
}

export interface SyncMetadata {
  connectionStatus: "online" | "offline";
  serverReachable: boolean;
  lastSuccessfulSyncJalali: string;
  lastSuccessfulSyncTime: string;
  pendingOperationsCount: number;
  conflictsCount: number;
}
