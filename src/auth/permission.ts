export const PermissionCodes = {
  // User
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ASSIGN_ROLE: 'user.assign_role',

  // Role
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_ASSIGN_PERMISSION: 'role.assign_permission',

  // Workshop / Production line
  WORKSHOP_VIEW: 'workshop.view',
  WORKSHOP_CREATE: 'workshop.create',
  WORKSHOP_UPDATE: 'workshop.update',
  WORKSHOP_DELETE: 'workshop.delete',

  PRODUCTION_LINE_VIEW: 'production_line.view',
  PRODUCTION_LINE_CREATE: 'production_line.create',
  PRODUCTION_LINE_UPDATE: 'production_line.update',
  PRODUCTION_LINE_DELETE: 'production_line.delete',

  // Brick types
  BRICK_TYPE_VIEW: 'brick_type.view',
  BRICK_TYPE_CREATE: 'brick_type.create',
  BRICK_TYPE_UPDATE: 'brick_type.update',
  BRICK_TYPE_DELETE: 'brick_type.delete',

  // Brick quota config
  BRICK_QUOTA_VIEW: 'brick_quota.view',
  BRICK_QUOTA_UPDATE: 'brick_quota.update',

  // Plans
  PLAN_VIEW: 'plan.view',
  PLAN_CREATE: 'plan.create',
  PLAN_UPDATE: 'plan.update',
  PLAN_APPROVE: 'plan.approve',
  PLAN_DELETE: 'plan.delete',

  // Payroll
  PAYROLL_VIEW: 'payroll.view',
  PAYROLL_CALCULATE: 'payroll.calculate',
  PAYROLL_APPROVE: 'payroll.approve',
  PAYROLL_EXPORT: 'payroll.export',

  // Reports
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
} as const;

export type PermissionCode =
  (typeof PermissionCodes)[keyof typeof PermissionCodes];
