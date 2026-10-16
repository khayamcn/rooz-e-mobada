/**
 * Rooz-e Mobada — Global app store (Zustand).
 *
 * Responsibilities:
 *  - Theme (light/dark) with localStorage persistence
 *  - Active family member selection (drives every other screen)
 *  - CRUD state for documents, contacts, vehicles, guides, sync ops
 *
 * The store is the single source of truth on the client side. Components
 * subscribe to slices via selectors. All mutations are immutable.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type {
  DocumentItem,
  EmergencyContact,
  FamilyMemberProfile,
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

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Active member
  activeMemberId: string;
  setActiveMember: (id: string) => void;

  // Family members
  members: FamilyMemberProfile[];
  addMember: (m: Omit<FamilyMemberProfile, "id">) => void;
  updateMember: (id: string, patch: Partial<FamilyMemberProfile>) => void;
  removeMember: (id: string) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (d: Omit<DocumentItem, "id">) => void;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  removeDocument: (id: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  // Contacts
  contacts: EmergencyContact[];
  addContact: (c: Omit<EmergencyContact, "id">) => void;
  updateContact: (id: string, patch: Partial<EmergencyContact>) => void;
  removeContact: (id: string) => void;

  // Sync ops (read-only mock, but expose conflict resolution)
  operations: SyncOperation[];
  conflict: typeof seedConflict;
  resolveConflict: (choice: "local" | "server") => void;

  syncMeta: typeof seedSyncMeta;
  guides: typeof seedGuides;
  family: typeof seedFamily;
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Theme ───────────────────────────────────────────────
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // ── Active member ──────────────────────────────────────
      activeMemberId: seedFamily.members[0].id,
      setActiveMember: (id) => set({ activeMemberId: id }),

      // ── Family members ─────────────────────────────────────
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

      // ── Vehicles ───────────────────────────────────────────
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

      // ── Sync / guides / family (read-only mock) ───────────
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
    }),
    {
      name: "rooz-e-mobada-v1",
      // Only persist user-changeable slices; theme + activeMemberId + items.
      partialize: (s) => ({
        theme: s.theme,
        activeMemberId: s.activeMemberId,
        members: s.members,
        documents: s.documents,
        vehicles: s.vehicles,
        contacts: s.contacts,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────
export function useActiveMember(): FamilyMemberProfile | undefined {
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => members.find((m) => m.id === activeMemberId),
    [members, activeMemberId]
  );
}

/** Documents visible to the active member: shared OR owned by them. */
export function useVisibleDocuments(): DocumentItem[] {
  const documents = useApp((s) => s.documents);
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(() => {
    const m = members.find((x) => x.id === activeMemberId);
    if (!m) return documents;
    if (m.role === "admin") return documents;
    return documents.filter(
      (d) => !d.isPrivate || d.ownerName === m.fullName
    );
  }, [documents, members, activeMemberId]);
}

/** Contacts visible to the active member. */
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
  return useApp((s) => s.vehicles); // vehicles are shared
}
