export enum Role {
  ADMIN = 'admin',
  PROCUREMENT_MANAGER = 'procurement_manager',
  FINANCE = 'finance',
  VENDOR = 'vendor',
  APPROVER = 'approver',
  DIRECTOR = 'director',
}

export const INTERNAL_ROLES = [
  Role.ADMIN,
  Role.PROCUREMENT_MANAGER,
  Role.FINANCE,
  Role.APPROVER,
  Role.DIRECTOR,
];
