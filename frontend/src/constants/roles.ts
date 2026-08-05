export enum Role {
  ADMIN = 'admin',
  PROCUREMENT_MANAGER = 'procurement_manager',
  FINANCE = 'finance',
  VENDOR = 'vendor',
  APPROVER = 'approver',
  DIRECTOR = 'director',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.PROCUREMENT_MANAGER]: 'Procurement Manager',
  [Role.FINANCE]: 'Finance',
  [Role.VENDOR]: 'Vendor',
  [Role.APPROVER]: 'Approver',
  [Role.DIRECTOR]: 'Director',
};

export const INTERNAL_ROLES = [Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.APPROVER, Role.DIRECTOR];
