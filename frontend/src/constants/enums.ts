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

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-light text-warning',
  verified: 'bg-success-light text-success',
  approved: 'bg-success-light text-success',
  rejected: 'bg-danger-light text-danger',
  draft: 'bg-border text-muted',
  published: 'bg-primary-light text-primary',
  closed: 'bg-border text-muted',
  cancelled: 'bg-danger-light text-danger',
  submitted: 'bg-primary-light text-primary',
  under_review: 'bg-warning-light text-warning',
  shortlisted: 'bg-success-light text-success',
  accepted: 'bg-success-light text-success',
  pending_approval: 'bg-warning-light text-warning',
  po_generated: 'bg-success-light text-success',
  active: 'bg-success-light text-success',
  expiring_soon: 'bg-warning-light text-warning',
  expired: 'bg-danger-light text-danger',
  terminated: 'bg-danger-light text-danger',
  renewed: 'bg-primary-light text-primary',
};
