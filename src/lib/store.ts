/**
 * Rooz-e Mobada — Global app store (Zustand) — v3.0
 *
 * Fully offline personal vault with token activation.
 * Manages people, bank cards, bills, documents, credentials.
 * Supports multiple color themes + day/night.
 * Encrypted backup/restore.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Bill,
  BankCard,
  ColorTheme,
  Credential,
  DocumentItem,
  EmergencyContact,
  EmergencyGuide,
  Person,
  Theme,
} from "./types";

// ════════════════════════════════════════════════════════════════
// VALID ACTIVATION TOKENS
// ════════════════════════════════════════════════════════════════
export const VALID_TOKENS: string[] = [
  "dA55@5-811-1442dilI-25210Km@ndi-25-11-258",
  "dAwwe5-811-1423ilI-2erweV@ndi-25-11-258",
  "dG#ff@5-831-1442dilI-252sdvEndi-25-11-258",
  "d1Fw5-431-1442dilI-25210Km@ndi-25-11-258",
  "dArwe@5-841-1442dilI-252345433ndi-25-11-258",
];

const APP_VERSION = "3.0.0";

interface AppState {
  // ── App versioning ───────────────────────────────────
  appVersion: string;

  // ── Token activation ─────────────────────────────────
  activated: boolean;
  hasSeenOnboarding: boolean;
  activate: (token: string) => boolean;
  deactivate: () => void;
  completeOnboarding: () => void;

  // ── Theme + Color ────────────────────────────────────
  theme: Theme;
  colorTheme: ColorTheme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setColorTheme: (c: ColorTheme) => void;

  // ── People ────────────────────────────────────────────
  people: Person[];
  addPerson: (p: Omit<Person, "id" | "createdAt">) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;

  // ── Active person (for filtering) ────────────────────
  activePersonId: string | null;
  setActivePerson: (id: string | null) => void;

  // ── Bank Cards ───────────────────────────────────────
  bankCards: BankCard[];
  addBankCard: (c: Omit<BankCard, "id" | "createdAt">) => void;
  updateBankCard: (id: string, patch: Partial<BankCard>) => void;
  removeBankCard: (id: string) => void;

  // ── Bills ────────────────────────────────────────────
  bills: Bill[];
  addBill: (b: Omit<Bill, "id" | "createdAt">) => void;
  updateBill: (id: string, patch: Partial<Bill>) => void;
  removeBill: (id: string) => void;

  // ── Documents ────────────────────────────────────────
  documents: DocumentItem[];
  addDocument: (d: Omit<DocumentItem, "id" | "createdAt">) => void;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  removeDocument: (id: string) => void;

  // ── Credentials ─────────────────────────────────────
  credentials: Credential[];
  addCredential: (c: Omit<Credential, "id" | "updatedAt">) => void;
  updateCredential: (id: string, patch: Partial<Credential>) => void;
  removeCredential: (id: string) => void;

  // ── Emergency contacts (read-only seed) ──────────────
  contacts: EmergencyContact[];
  guides: EmergencyGuide[];

  // ── Backup / restore with encryption ────────────────
  exportBackup: (passphrase: string) => string;
  importBackup: (encrypted: string, passphrase: string) => boolean;
  lastBackupAt: string | null;
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

// ── Simple XOR stream cipher for backup encryption ──
function deriveKey(passphrase: string): Uint8Array {
  const salt = "rooz-e-mobada-v3-salt";
  const input = passphrase + salt;
  const key = new Uint8Array(32);
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
    key[i % 32] ^= h & 0xff;
  }
  for (let round = 0; round < 1000; round++) {
    for (let i = 0; i < 32; i++) {
      key[i] = (key[i] * 31 + round) & 0xff;
    }
  }
  return key;
}

function encryptBackup(json: string, passphrase: string): string {
  const key = deriveKey(passphrase);
  const data = new TextEncoder().encode(json);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  let bin = "";
  for (let i = 0; i < out.length; i++) bin += String.fromCharCode(out[i]);
  return `ROOZ-V3:${btoa(bin)}`;
}

function decryptBackup(encrypted: string, passphrase: string): string | null {
  if (!encrypted.startsWith("ROOZ-V3:")) return null;
  const b64 = encrypted.slice("ROOZ-V3:".length);
  const key = deriveKey(passphrase);
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    return null;
  }
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  try {
    return new TextDecoder().decode(out);
  } catch {
    return null;
  }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      // ── App versioning ───────────────────────────────
      appVersion: APP_VERSION,

      // ── Token activation ──────────────────────────────
      activated: false,
      hasSeenOnboarding: false,
      activate: (token: string) => {
        const trimmed = token.trim();
        if (VALID_TOKENS.includes(trimmed)) {
          set({ activated: true });
          return true;
        }
        return false;
      },
      deactivate: () => set({ activated: false }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),

      // ── Theme + Color ──────────────────────────────────
      theme: "dark",
      colorTheme: "violet",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setColorTheme: (c) => set({ colorTheme: c }),

      // ── People ────────────────────────────────────────
      people: [],
      addPerson: (p) =>
        set((s) => ({
          people: [
            ...s.people,
            {
              ...p,
              id: uid("p"),
              createdAt: now(),
              avatarColor: p.avatarColor || ["violet", "emerald", "rose", "blue"][Math.floor(Math.random() * 4)],
            },
          ],
        })),
      updatePerson: (id, patch) =>
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePerson: (id) =>
        set((s) => {
          const remaining = s.people.filter((p) => p.id !== id);
          const next =
            s.activePersonId === id ? null : s.activePersonId;
          return { people: remaining, activePersonId: next };
        }),

      // ── Active person ──────────────────────────────────
      activePersonId: null,
      setActivePerson: (id) => set({ activePersonId: id }),

      // ── Bank Cards ────────────────────────────────────
      bankCards: [],
      addBankCard: (c) =>
        set((s) => ({
          bankCards: [...s.bankCards, { ...c, id: uid("card"), createdAt: now() }],
        })),
      updateBankCard: (id, patch) =>
        set((s) => ({
          bankCards: s.bankCards.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      removeBankCard: (id) =>
        set((s) => ({ bankCards: s.bankCards.filter((c) => c.id !== id) })),

      // ── Bills ──────────────────────────────────────────
      bills: [],
      addBill: (b) =>
        set((s) => ({
          bills: [...s.bills, { ...b, id: uid("bill"), createdAt: now() }],
        })),
      updateBill: (id, patch) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      removeBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      // ── Documents ────────────────────────────────────
      documents: [],
      addDocument: (d) =>
        set((s) => ({
          documents: [
            { ...d, id: uid("doc"), createdAt: now() },
            ...s.documents,
          ],
        })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      // ── Credentials ──────────────────────────────────
      credentials: [],
      addCredential: (c) =>
        set((s) => ({
          credentials: [
            { ...c, id: uid("cr"), updatedAt: now() },
            ...s.credentials,
          ],
        })),
      updateCredential: (id, patch) =>
        set((s) => ({
          credentials: s.credentials.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: now() } : c
          ),
        })),
      removeCredential: (id) =>
        set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) })),

      // ── Emergency contacts (seed) ──────────────────────
      contacts: [
        { id: "ec-115", name: "اورژانس", relationOrRole: "مرکز امداد پزشکی", phonePrimary: "115", iconLabel: "🏥", priorityOrder: 1, isSystemEmergency: true },
        { id: "ec-110", name: "پلیس", relationOrRole: "مرکز برخورد پلیس", phonePrimary: "110", iconLabel: "🚓", priorityOrder: 2, isSystemEmergency: true },
        { id: "ec-125", name: "آتش‌نشانی", relationOrRole: "مرکز امداد و نجات", phonePrimary: "125", iconLabel: "🚒", priorityOrder: 3, isSystemEmergency: true },
        { id: "ec-123", name: "گاز", relationOrRole: "مرکز فوری پخش گاز", phonePrimary: "123", iconLabel: "🔥", priorityOrder: 4, isSystemEmergency: true },
      ],
      guides: [
        {
          id: "g-cpr",
          title: "احیای قلبی-ریوی (CPR)",
          category: "first_aid",
          readingTimeMinutes: 2,
          summary: "گام‌به‌گام انجام CPR برای بزرگسالان.",
          steps: [
            "امنیت محیط را بررسی کنید.",
            "وضعیت هوشیاری را بررسی کنید.",
            "اگر پاسخی نبود، با ۱۱۵ تماس بگیرید.",
            "دست‌ها را روی مرکز قفسه سینه قرار دهید.",
            "۱۰۰ تا ۱۲۰ فشار در دقیقه با عمق ۵ سانتی‌متر.",
            "پس از هر ۳۰ فشار، ۲ تنفس مصنوعی بدهید.",
          ],
        },
        {
          id: "g-earthquake",
          title: "اقدامات فوری در زلزله",
          category: "earthquake",
          readingTimeMinutes: 3,
          summary: "نقاط امن خانه و مسیر خروج اضطراری.",
          steps: [
            "زیر میز محکم پناه بگیرید.",
            "دور از پنجره و آینه باشید.",
            "سر و گردن را بپوشانید.",
            "شیر اصلی گاز را ببندید.",
            "فیوز برق اصلی را خاموش کنید.",
            "از آسانسور استفاده نکنید.",
          ],
        },
      ],

      // ── Backup / restore with encryption ──────────────
      lastBackupAt: null,
      exportBackup: (passphrase: string) => {
        const s = get();
        const data = {
          version: APP_VERSION,
          exportedAt: new Date().toISOString(),
          people: s.people,
          bankCards: s.bankCards.map((c) => ({ ...c, cardImageDataUrl: undefined })),
          bills: s.bills.map((b) => ({ ...b, imageDataUrl: undefined })),
          documents: s.documents.map((d) => ({ ...d, imageUrls: [] })),
          credentials: s.credentials,
        };
        const json = JSON.stringify(data, null, 2);
        const encrypted = encryptBackup(json, passphrase);
        set({ lastBackupAt: new Date().toLocaleString("fa-IR") });
        return encrypted;
      },
      importBackup: (encrypted, passphrase) => {
        const json = decryptBackup(encrypted, passphrase);
        if (!json) return false;
        try {
          const data = JSON.parse(json);
          if (!data.version || !data.people) return false;
          set({
            people: data.people ?? [],
            bankCards: data.bankCards ?? [],
            bills: data.bills ?? [],
            documents: data.documents ?? [],
            credentials: data.credentials ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "rooz-e-mobada-v3",
      partialize: (s) => ({
        activated: s.activated,
        hasSeenOnboarding: s.hasSeenOnboarding,
        theme: s.theme,
        colorTheme: s.colorTheme,
        people: s.people,
        activePersonId: s.activePersonId,
        bankCards: s.bankCards,
        bills: s.bills,
        documents: s.documents,
        credentials: s.credentials,
        lastBackupAt: s.lastBackupAt,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────
export function useActivePerson(): Person | undefined {
  const people = useApp((s) => s.people);
  const activePersonId = useApp((s) => s.activePersonId);
  return people.find((p) => p.id === activePersonId);
}
