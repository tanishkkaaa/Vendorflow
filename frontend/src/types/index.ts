import { Role } from '@/constants/roles';
import { VendorStatus, RFQStatus, QuotationStatus, ApprovalStatus, PurchaseRequestStatus, ContractStatus } from '@/constants/enums';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  department?: string;
  isActive: boolean;
  vendorId?: string;
}

export interface Vendor {
  _id: string;
  organizationId: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  category?: string;
  bankDetails?: { accountHolder?: string; accountNumber?: string; ifsc?: string; bankName?: string };
  documents: VendorDocument[];
  status: VendorStatus;
  rejectionReason?: string;
  ratingAverage: number;
  ratingCount: number;
  score: number;
  isDuplicateFlagged: boolean;
  createdAt: string;
}

export interface VendorDocument {
  type: 'gst' | 'pan' | 'certificate' | 'bank_proof' | 'other';
  label: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface RFQItem {
  name: string;
  quantity: number;
  specifications?: string;
}

export interface RFQ {
  _id: string;
  rfqCode: string;
  title: string;
  department?: string;
  items: RFQItem[];
  budget?: number;
  deliveryDate?: string;
  specifications?: string;
  invitedVendors: string[] | Vendor[];
  status: RFQStatus;
  submissionDeadline?: string;
  createdAt: string;
}

export interface ExtractedQuoteData {
  price?: number;
  currency?: string;
  warrantyMonths?: number;
  deliveryDays?: number;
  paymentTerms?: string;
  penaltyClause?: string;
  otherTerms?: string;
  rawSummary?: string;
  extractionConfidence?: number;
  extractedAt?: string;
}

export interface Quotation {
  _id: string;
  rfqId: string;
  vendorId: string | Vendor;
  price: number;
  deliveryTimelineDays: number;
  warrantyMonths?: number;
  quotationPdfUrl: string;
  extracted: ExtractedQuoteData;
  status: QuotationStatus;
  aiRank?: number;
  aiRecommendationNotes?: string;
  submittedAt: string;
}

export interface QuotationComparisonResult {
  ranking: Array<{
    quotationId: string;
    vendorName: string;
    rank: number;
    pros: string[];
    cons: string[];
    estimatedSavingsVsHighest: number;
  }>;
  recommendedQuotationId: string;
  recommendationReason: string;
  pendingCount: number;
}

export interface ApprovalStep {
  stage: 'manager' | 'finance' | 'director';
  approverId?: string;
  status: ApprovalStatus;
  comment?: string;
  actedAt?: string;
}

export interface ApprovalWorkflow {
  _id: string;
  purchaseRequestId: string;
  steps: ApprovalStep[];
  finalStatus: ApprovalStatus;
}

export interface PurchaseRequest {
  _id: string;
  vendorId: string | Vendor;
  title: string;
  amount: number;
  department?: string;
  justification?: string;
  status: PurchaseRequestStatus;
  currentStage: 'manager' | 'finance' | 'director' | 'completed';
  createdAt: string;
}

export interface ContractVersion {
  version: number;
  fileUrl: string;
  uploadedAt: string;
  changeNote?: string;
  aiSummary?: string;
  aiRiskFlags?: string[];
}

export interface Contract {
  _id: string;
  vendorId: string | Vendor;
  title: string;
  contractValue?: number;
  startDate: string;
  endDate: string;
  reminderDaysBefore: number;
  status: ContractStatus;
  versions: ContractVersion[];
  currentVersion: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  _id: string;
  purchaseRequestId: string;
  vendorId: string | Vendor;
  poNumber: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  deliveryDate?: string;
  paymentTerms?: string;
  aiSummary?: string;
  pdfUrl?: string;
  emailedToVendor: boolean;
  createdAt: string;
}

export interface VendorRating {
  _id: string;
  vendorId: string;
  purchaseOrderId: string;
  delivery: number;
  quality: number;
  support: number;
  cost: number;
  overall: number;
  comment?: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorId: { name: string; email: string } | string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  createdAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta & Record<string, unknown>;
}
