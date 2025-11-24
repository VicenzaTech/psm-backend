export const RoleCodes = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PLANNER: 'planner',
  LINE_MANAGER: 'line_manager',
  VIEWER: 'viewer',
} as const;

export type RoleCode = (typeof RoleCodes)[keyof typeof RoleCodes];
