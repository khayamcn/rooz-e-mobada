// Core types for "Rooz-e Mobada" personal vault app

export type Theme = "light" | "dark";
export type ColorTheme = "violet" | "emerald" | "rose" | "blue";
export type ScreenId =
  | "home"
  | "people"
  | "documents"
  | "cards"
  | "bills"
  | "passwords"
  | "settings";

export interface Person {
  id: string;
  fullName: string;
  relation: string;
  phone: string;
  avatarDataUrl?: string;
  birthDateJalali?: string;
  bloodType?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
}

export interface BankCard {
  id: string;
  personId: string;
  bankName: string;
  cardNumber: string;
  accountNumber: string;
  shiba: string;
  cvv2: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  cardImageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

export type BillType =
  | "water"
  | "electricity"
  | "gas"
  | "telephone"
  | "mobile"
  | "internet"
  | "other";

export interface Bill {
  id: string;
  personId: string;
  billType: BillType;
  provider: string;
  billId: string;
  paymentId: string;
  isPaid: boolean;
  imageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

export type DocumentCategory =
  | "identity"
  | "vehicle"
  | "property"
  | "education"
  | "insurance"
  | "medical"
  | "contract"
  | "other";

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

  // Vehicle fields
  licenseNumber?: string;
  licenseSerial?: string;
  licenseIssueDate?: string;
  vinNumber?: string;
  plateNumber?: string;
  cardSerial?: string;
  serialNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;

  // Property fields
  contractNumber?: string;
  trackingCode?: string;

  // Insurance fields
  insuranceNumber?: string;
  insuranceType?: string;
  insuranceDate?: string;
}

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
