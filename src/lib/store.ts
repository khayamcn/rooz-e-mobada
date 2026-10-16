/**
 * Rooz-e Mobada — Global app store (Zustand).
 *
 * Responsibilities:
 *  - Auth: signup, OTP, family creation/joining, session
 *  - Theme (light/dark) with localStorage persistence
 *  - Active family member selection
 *  - Members with profile photos
 *  - Per-member documents, credentials, personal info
 *  - Cloud storage: folders, files, trash, activity log, quota
 *  - App versioning / update check
 *  - Backup / restore (export & import JSON)
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type {
  AuthScreen,
  AuthSession,
  AuthUser,
  CloudFile,
  CloudFolder,
  ConflictRecord,
  CredentialItem,
  DocumentItem,
  EmergencyContact,
  FamilyMemberProfile,
  FileActivityLog,
  PersonalInfo,
  StorageQuota,
  SyncMetadata,
  SyncOperation,
  Vehicle,
} from "./types";
import {
  conflictRecord as seedConflict,
  documents as seedDocs,
  emergencyContacts as seedContacts,
  emergencyGuides as seedGuides,
  family as seedFamily,
  syncMetadata as seedSyncMeta,
  syncOperations as seedOps,
  vehicles as seedVehicles,
} from "./mock-data";

export type Theme = "light" | "dark";

// Demo OTP — in production this is sent via SMS and never returned to the client.
const DEMO_OTP = "12345";
const APP_VERSION = "1.2.0";
const LATEST_VERSION = "1.2.0";

interface AppState {
  // ── App versioning ───────────────────────────────────
  appVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  checkForUpdate: () => void;

  // ── Theme ────────────────────────────────────────────
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // ── Auth ─────────────────────────────────────────────
  authScreen: AuthScreen;
  setAuthScreen: (s: AuthScreen) => void;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  currentUser: AuthUser | null;
  session: AuthSession | null;
  pendingOtp: { mobile: string; code: string; expiresAt: number } | null;

  signup: (input: { mobile: string; displayName: string; nationalId?: string }) => string;
  verifyOtp: (code: string) => boolean;
  resendOtp: () => void;
  createFamily: (title: string) => string; // returns invite code
  joinFamily: (inviteCode: string) => boolean;
  logout: () => void;

  // ── Active member (family view) ──────────────────────
  activeMemberId: string;
  setActiveMember: (id: string) => void;

  // ── Family members ────────────────────────────────────
  members: FamilyMemberProfile[];
  addMember: (m: Omit<FamilyMemberProfile, "id">) => void;
  updateMember: (id: string, patch: Partial<FamilyMemberProfile>) => void;
  removeMember: (id: string) => void;
  revokeMember: (id: string) => void;
  transferOwnership: (id: string) => void;
  regenerateInviteCode: () => string;

  // ── Personal info (per member) ──────────────────────
  personalInfo: Record<string, PersonalInfo>;
  updatePersonalInfo: (memberId: string, patch: Partial<PersonalInfo>) => void;

  // ── Documents ────────────────────────────────────────
  documents: DocumentItem[];
  addDocument: (d: Omit<DocumentItem, "id">) => void;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  removeDocument: (id: string) => void;

  // ── Credentials (usernames & passwords) ─────────────
  credentials: CredentialItem[];
  addCredential: (c: Omit<CredentialItem, "id">) => void;
  updateCredential: (id: string, patch: Partial<CredentialItem>) => void;
  removeCredential: (id: string) => void;

  // ── Vehicles ─────────────────────────────────────────
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  // ── Contacts ─────────────────────────────────────────
  contacts: EmergencyContact[];
  addContact: (c: Omit<EmergencyContact, "id">) => void;
  updateContact: (id: string, patch: Partial<EmergencyContact>) => void;
  removeContact: (id: string) => void;

  // ── Sync ──────────────────────────────────────────────
  operations: SyncOperation[];
  conflict: ConflictRecord;
  resolveConflict: (choice: "local" | "server") => void;
  syncMeta: SyncMetadata;
  guides: typeof seedGuides;
  family: typeof seedFamily;

  // ── Cloud Storage ────────────────────────────────────
  folders: CloudFolder[];
  files: CloudFile[];
  activityLog: FileActivityLog[];
  quota: StorageQuota;
  addFolder: (name: string, parentId: string | null) => void;
  renameFolder: (id: string, name: string) => void;
  removeFolder: (id: string) => void;
  uploadFile: (file: { name: string; mimeType: string; sizeBytes: number; dataUrl?: string; folderId: string | null }) => void;
  renameFile: (id: string, name: string) => void;
  moveFile: (id: string, folderId: string | null) => void;
  removeFile: (id: string) => void;
  restoreFile: (id: string) => void;
  permanentDeleteFile: (id: string) => void;
  toggleOfflineAvailable: (id: string) => void;
  toggleFilePrivate: (id: string) => void;
  clearTrash: () => void;

  // ── Backup & restore ─────────────────────────────────
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  lastBackupAt: string | null;
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowJalali(): string {
  return "۱۴۰۵/۰۷/۲۳ - ۱۴:۳۰";
}

const FAMILY_QUOTA = 1024 * 1024 * 1024; // 1 GB demo quota

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      // ── App versioning ───────────────────────────────────
      appVersion: APP_VERSION,
      latestVersion: LATEST_VERSION,
      updateAvailable: false,
      checkForUpdate: () => {
        // شبیه‌سازی: در نسخه دمو همیشه آخرین نسخه است.
        set({ updateAvailable: APP_VERSION !== LATEST_VERSION });
      },

      // ── Theme ─────────────────────────────────────────────
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // ── Auth ──────────────────────────────────────────────
      authScreen: "splash",
      setAuthScreen: (s) => set({ authScreen: s }),
      hasSeenOnboarding: false,
      completeOnboarding: () => set({ hasSeenOnboarding: true, authScreen: "login" }),
      currentUser: null,
      session: null,
      pendingOtp: null,

      signup: ({ mobile, displayName, nationalId }) => {
        const code = DEMO_OTP;
        const expiresAt = Date.now() + 2 * 60 * 1000;
        set({
          pendingOtp: { mobile, code, expiresAt },
          authScreen: "otp",
          currentUser: {
            id: uid("u"),
            mobile,
            displayName,
            nationalId,
            createdAt: nowJalali(),
          },
        });
        return code;
      },

      verifyOtp: (code) => {
        const otp = get().pendingOtp;
        if (!otp) return false;
        if (Date.now() > otp.expiresAt) return false;
        if (otp.attempts >= 5) return false;
        if (code !== otp.code) {
          set({
            pendingOtp: { ...otp, attempts: otp.attempts + 1 },
          });
          return false;
        }
        const user = get().currentUser;
        if (!user) return false;
        set({
          pendingOtp: null,
          session: {
            userId: user.id,
            token: uid("tok"),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          },
        });
        if (!user.familyId) {
          set({ authScreen: "create-family" });
        } else {
          set({ authScreen: "main-app" });
        }
        return true;
      },

      resendOtp: () => {
        const otp = get().pendingOtp;
        if (!otp) return;
        set({
          pendingOtp: {
            ...otp,
            code: DEMO_OTP,
            expiresAt: Date.now() + 2 * 60 * 1000,
            attempts: 0,
          },
        });
      },

      createFamily: (title) => {
        const user = get().currentUser;
        if (!user) return "";
        const inviteCode = generateInviteCode();
        const ownerId = user.id;
        // در نسخه دمو، اولین عضو از members برداشت می‌شود
        const firstMember: FamilyMemberProfile = {
          id: ownerId,
          fullName: user.displayName,
          role: "admin",
          status: "active",
          phone: user.mobile,
          nationalId: user.nationalId,
          relation: "شما",
          avatarInitials: user.displayName.split(" ").map((s) => s[0]).join(" ").slice(0, 3),
          isCurrentUser: true,
          lastActiveJalali: "همین حالا",
        };
        set({
          members: [firstMember],
          activeMemberId: ownerId,
          currentUser: { ...user, familyId: "fam-demo", role: "admin" },
          family: { ...get().family, title, inviteCode, ownerName: user.displayName },
          session: {
            userId: user.id,
            token: uid("tok"),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          },
          authScreen: "main-app",
        });
        return inviteCode;
      },

      joinFamily: (inviteCode) => {
        // در نسخه دمو هر کد ۶ رقمی پذیرفته می‌شود.
        if (!/^[A-Z0-9]{6}$/i.test(inviteCode)) return false;
        const user = get().currentUser;
        if (!user) return false;
        const newMember: FamilyMemberProfile = {
          id: user.id,
          fullName: user.displayName,
          role: "editor",
          status: "active",
          phone: user.mobile,
          nationalId: user.nationalId,
          relation: "عضو جدید",
          avatarInitials: user.displayName.split(" ").map((s) => s[0]).join(" ").slice(0, 3),
          isCurrentUser: true,
          lastActiveJalali: "همین حالا",
        };
        set((s) => ({
          members: [...s.members, newMember],
          activeMemberId: user.id,
          currentUser: { ...user, familyId: "fam-demo", role: "editor" },
          session: {
            userId: user.id,
            token: uid("tok"),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          },
          authScreen: "main-app",
        }));
        return true;
      },

      logout: () => {
        set({
          currentUser: null,
          session: null,
          authScreen: "splash",
          pendingOtp: null,
        });
      },

      // ── Active member ─────────────────────────────────────
      activeMemberId: seedFamily.members[0].id,
      setActiveMember: (id) => set({ activeMemberId: id }),

      // ── Family members ────────────────────────────────────
      members: seedFamily.members,
      addMember: (m) =>
        set((s) => ({ members: [...s.members, { ...m, id: uid("u") }] })),
      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: (id) =>
        set((s) => {
          const remaining = s.members.filter((m) => m.id !== id);
          const next =
            s.activeMemberId === id
              ? remaining[0]?.id ?? ""
              : s.activeMemberId;
          return { members: remaining, activeMemberId: next };
        }),
      revokeMember: (id) =>
        set((s) => ({
          members: s.members.map((m) =>
            m.id === id ? { ...m, status: "revoked" as const } : m
          ),
        })),
      transferOwnership: (id) =>
        set((s) => ({
          members: s.members.map((m) => {
            if (m.id === id) return { ...m, role: "admin" as const };
            if (m.isCurrentUser) return { ...m, role: "editor" as const };
            return m;
          }),
        })),
      regenerateInviteCode: () => {
        const newCode = generateInviteCode();
        set((s) => ({ family: { ...s.family, inviteCode: newCode } }));
        return newCode;
      },

      // ── Personal info ─────────────────────────────────────
      personalInfo: {},
      updatePersonalInfo: (memberId, patch) =>
        set((s) => ({
          personalInfo: {
            ...s.personalInfo,
            [memberId]: {
              memberId,
              ...s.personalInfo[memberId],
              ...patch,
            },
          },
        })),

      // ── Documents ──────────────────────────────────────────
      documents: seedDocs,
      addDocument: (d) =>
        set((s) => ({ documents: [{ ...d, id: uid("doc") }, ...s.documents] })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),
      removeDocument: (id) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
        })),

      // ── Credentials ────────────────────────────────────────
      credentials: [],
      addCredential: (c) =>
        set((s) => ({ credentials: [{ ...c, id: uid("cr") }, ...s.credentials] })),
      updateCredential: (id, patch) =>
        set((s) => ({
          credentials: s.credentials.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      removeCredential: (id) =>
        set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) })),

      // ── Vehicles ──────────────────────────────────────────
      vehicles: seedVehicles,
      addVehicle: (v) =>
        set((s) => ({ vehicles: [{ ...v, id: uid("veh") }, ...s.vehicles] })),
      updateVehicle: (id, patch) =>
        set((s) => ({
          vehicles: s.vehicles.map((v) =>
            v.id === id ? { ...v, ...patch } : v
          ),
        })),
      removeVehicle: (id) =>
        set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),

      // ── Contacts ───────────────────────────────────────────
      contacts: seedContacts,
      addContact: (c) =>
        set((s) => ({ contacts: [...s.contacts, { ...c, id: uid("ec") }] })),
      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      // ── Sync ───────────────────────────────────────────────
      operations: seedOps,
      conflict: seedConflict,
      resolveConflict: (choice) =>
        set((s) => ({
          conflict: { ...s.conflict, resolvedAs: choice },
          syncMeta: {
            ...s.syncMeta,
            conflictsCount: Math.max(0, s.syncMeta.conflictsCount - 1),
          },
        })),
      syncMeta: seedSyncMeta,
      guides: seedGuides,
      family: seedFamily,

      // ── Cloud Storage ──────────────────────────────────────
      folders: [],
      files: [],
      activityLog: [],
      quota: { totalBytes: FAMILY_QUOTA, usedBytes: 0 },

      addFolder: (name, parentId) => {
        const user = get().currentUser;
        if (!user) return;
        const folder: CloudFolder = {
          id: uid("fld"),
          familyId: user.familyId ?? "fam-demo",
          parentId,
          name,
          isPrivate: false,
          ownerId: user.id,
          createdAt: nowJalali(),
        };
        set((s) => ({
          folders: [...s.folders, folder],
          activityLog: [
            {
              id: uid("log"),
              folderId: folder.id,
              action: "upload",
              actorName: user.displayName,
              details: `پوشه «${name}» ایجاد شد`,
              timestamp: nowJalali(),
            },
            ...s.activityLog,
          ],
        }));
      },
      renameFolder: (id, name) => {
        const user = get().currentUser;
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
          activityLog: user
            ? [
                {
                  id: uid("log"),
                  folderId: id,
                  action: "rename",
                  actorName: user.displayName,
                  details: `نام پوشه به «${name}» تغییر کرد`,
                  timestamp: nowJalali(),
                },
                ...s.activityLog,
              ]
            : s.activityLog,
        }));
      },
      removeFolder: (id) => {
        const user = get().currentUser;
        set((s) => {
          // حذف نرم پوشه و فایل‌های داخل آن
          const folderIds = new Set([id, ...s.folders.filter((f) => f.parentId === id).map((f) => f.id)]);
          return {
            folders: s.folders.filter((f) => !folderIds.has(f.id)),
            files: s.files.map((f) =>
              f.folderId && folderIds.has(f.folderId)
                ? { ...f, deletedAt: nowJalali() }
                : f
            ),
            activityLog: user
              ? [
                  {
                    id: uid("log"),
                    folderId: id,
                    action: "delete",
                    actorName: user.displayName,
                    details: "پوشه حذف شد",
                    timestamp: nowJalali(),
                  },
                  ...s.activityLog,
                ]
              : s.activityLog,
          };
        });
      },
      uploadFile: ({ name, mimeType, sizeBytes, dataUrl, folderId }) => {
        const user = get().currentUser;
        if (!user) return;
        const file: CloudFile = {
          id: uid("file"),
          familyId: user.familyId ?? "fam-demo",
          folderId,
          name,
          mimeType,
          sizeBytes,
          ownerId: user.id,
          ownerName: user.displayName,
          dataUrl,
          isPrivate: false,
          isOfflineAvailable: false,
          deletedAt: null,
          createdAt: nowJalali(),
          updatedAt: nowJalali(),
        };
        set((s) => ({
          files: [file, ...s.files],
          quota: {
            ...s.quota,
            usedBytes: s.quota.usedBytes + sizeBytes,
          },
          activityLog: [
            {
              id: uid("log"),
              fileId: file.id,
              action: "upload",
              actorName: user.displayName,
              details: `فایل «${name}» بارگذاری شد`,
              timestamp: nowJalali(),
            },
            ...s.activityLog,
          ],
        }));
      },
      renameFile: (id, name) => {
        const user = get().currentUser;
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, name, updatedAt: nowJalali() } : f
          ),
          activityLog: user
            ? [
                {
                  id: uid("log"),
                  fileId: id,
                  action: "rename",
                  actorName: user.displayName,
                  details: `نام فایل به «${name}» تغییر کرد`,
                  timestamp: nowJalali(),
                },
                ...s.activityLog,
              ]
            : s.activityLog,
        }));
      },
      moveFile: (id, folderId) => {
        const user = get().currentUser;
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, folderId, updatedAt: nowJalali() } : f
          ),
          activityLog: user
            ? [
                {
                  id: uid("log"),
                  fileId: id,
                  action: "move",
                  actorName: user.displayName,
                  details: "فایل جابه‌جا شد",
                  timestamp: nowJalali(),
                },
                ...s.activityLog,
              ]
            : s.activityLog,
        }));
      },
      removeFile: (id) => {
        const user = get().currentUser;
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, deletedAt: nowJalali() } : f
          ),
          activityLog: user
            ? [
                {
                  id: uid("log"),
                  fileId: id,
                  action: "delete",
                  actorName: user.displayName,
                  details: "فایل به سطل بازیافت منتقل شد",
                  timestamp: nowJalali(),
                },
                ...s.activityLog,
              ]
            : s.activityLog,
        }));
      },
      restoreFile: (id) => {
        const user = get().currentUser;
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, deletedAt: null, updatedAt: nowJalali() } : f
          ),
          activityLog: user
            ? [
                {
                  id: uid("log"),
                  fileId: id,
                  action: "restore",
                  actorName: user.displayName,
                  details: "فایل بازیابی شد",
                  timestamp: nowJalali(),
                },
                ...s.activityLog,
              ]
            : s.activityLog,
        }));
      },
      permanentDeleteFile: (id) =>
        set((s) => {
          const file = s.files.find((f) => f.id === id);
          return {
            files: s.files.filter((f) => f.id !== id),
            quota: file
              ? {
                  ...s.quota,
                  usedBytes: Math.max(0, s.quota.usedBytes - file.sizeBytes),
                }
              : s.quota,
          };
        }),
      toggleOfflineAvailable: (id) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id
              ? { ...f, isOfflineAvailable: !f.isOfflineAvailable }
              : f
          ),
        })),
      toggleFilePrivate: (id) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, isPrivate: !f.isPrivate } : f
          ),
        })),
      clearTrash: () =>
        set((s) => {
          const trashed = s.files.filter((f) => f.deletedAt);
          const freed = trashed.reduce((sum, f) => sum + f.sizeBytes, 0);
          return {
            files: s.files.filter((f) => !f.deletedAt),
            quota: {
              ...s.quota,
              usedBytes: Math.max(0, s.quota.usedBytes - freed),
            },
          };
        }),

      // ── Backup & restore ───────────────────────────────────
      lastBackupAt: null,
      exportBackup: () => {
        const s = get();
        const backup = {
          version: APP_VERSION,
          exportedAt: new Date().toISOString(),
          family: s.family,
          members: s.members,
          personalInfo: s.personalInfo,
          documents: s.documents,
          credentials: s.credentials,
          vehicles: s.vehicles,
          contacts: s.contacts,
          folders: s.folders,
          files: s.files.map((f) => ({
            ...f,
            dataUrl: undefined, // فایل‌های بزرگ در بکاپ قرار نمی‌گیرند
          })),
          activityLog: s.activityLog,
        };
        set({ lastBackupAt: nowJalali() });
        return JSON.stringify(backup, null, 2);
      },
      importBackup: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.version || !data.members) return false;
          set({
            family: data.family ?? get().family,
            members: data.members ?? get().members,
            personalInfo: data.personalInfo ?? {},
            documents: data.documents ?? [],
            credentials: data.credentials ?? [],
            vehicles: data.vehicles ?? [],
            contacts: data.contacts ?? [],
            folders: data.folders ?? [],
            files: data.files ?? [],
            activityLog: data.activityLog ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "rooz-e-mobada-v2",
      partialize: (s) => ({
        theme: s.theme,
        currentUser: s.currentUser,
        session: s.session,
        authScreen: s.authScreen,
        hasSeenOnboarding: s.hasSeenOnboarding,
        members: s.members,
        activeMemberId: s.activeMemberId,
        personalInfo: s.personalInfo,
        documents: s.documents,
        credentials: s.credentials,
        vehicles: s.vehicles,
        contacts: s.contacts,
        folders: s.folders,
        files: s.files,
        activityLog: s.activityLog,
        quota: s.quota,
        family: s.family,
        lastBackupAt: s.lastBackupAt,
      }),
    }
  )
);

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون کاراکترهای مشابه
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Selectors ────────────────────────────────────────────────
export function useActiveMember(): FamilyMemberProfile | undefined {
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => members.find((m) => m.id === activeMemberId),
    [members, activeMemberId]
  );
}

export function useVisibleDocuments(): DocumentItem[] {
  const documents = useApp((s) => s.documents);
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(() => {
    const m = members.find((x) => x.id === activeMemberId);
    if (!m) return documents;
    if (m.role === "admin") return documents;
    return documents.filter(
      (d) => !d.isPrivate || d.ownerId === m.id || d.ownerName === m.fullName
    );
  }, [documents, members, activeMemberId]);
}

export function useVisibleContacts(): EmergencyContact[] {
  const contacts = useApp((s) => s.contacts);
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(() => {
    const m = members.find((x) => x.id === activeMemberId);
    if (!m) return contacts;
    return contacts.filter(
      (c) =>
        c.isSystemEmergency || !c.isPrivate || c.name.includes(m.fullName)
    );
  }, [contacts, members, activeMemberId]);
}

export function useVisibleVehicles(): Vehicle[] {
  return useApp((s) => s.vehicles);
}

export function useCredentialsForActiveMember(): CredentialItem[] {
  const credentials = useApp((s) => s.credentials);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => credentials.filter((c) => c.ownerId === activeMemberId),
    [credentials, activeMemberId]
  );
}

export function useDocumentsForActiveMember(): DocumentItem[] {
  const documents = useApp((s) => s.documents);
  const activeMemberId = useApp((s) => s.activeMemberId);
  const members = useApp((s) => s.members);
  return useMemo(() => {
    const m = members.find((x) => x.id === activeMemberId);
    if (!m) return [];
    if (m.role === "admin") return documents;
    return documents.filter(
      (d) => !d.isPrivate || d.ownerId === m.id || d.ownerName === m.fullName
    );
  }, [documents, activeMemberId, members]);
}
