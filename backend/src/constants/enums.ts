export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum QuotationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
}

export enum ApprovalStage {
  MANAGER = 'manager',
  FINANCE = 'finance',
  DIRECTOR = 'director',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PurchaseRequestStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PO_GENERATED = 'po_generated',
}

export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum NotificationType {
  APPROVAL_REQUEST = 'approval_request',
  CONTRACT_EXPIRING = 'contract_expiring',
  VENDOR_REGISTERED = 'vendor_registered',
  RFQ_RECEIVED = 'rfq_received',
  QUOTATION_SUBMITTED = 'quotation_submitted',
  PURCHASE_ORDER_GENERATED = 'purchase_order_generated',
  VENDOR_VERIFIED = 'vendor_verified',
  GENERIC = 'generic',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  LOGIN = 'login',
  STATUS_CHANGE = 'status_change',
}
