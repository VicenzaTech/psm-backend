import { PrismaClient } from '@prisma/client';
import { PermissionCodes } from '../src/auth/permission';
import { RoleCodes } from '../src/auth/role';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log(' Seeding RBAC for 3-table schema...');

    // ------------------------------------------------------
    // 1. Seed Permissions
    // ------------------------------------------------------
    const permissionsData = Object.entries(PermissionCodes).map(([key, code]) => ({
        code,
        name: key.replace(/_/g, ' '),
        description: '',
    }));

    for (const p of permissionsData) {
        await prisma.permission.upsert({
            where: { code: p.code },
            update: {},
            create: p,
        });
    }

    console.log(` Seeded ${permissionsData.length} permissions`);

    const allPermissions = await prisma.permission.findMany();
    const permMap = Object.fromEntries(allPermissions.map((p) => [p.code, p]));

    // ------------------------------------------------------
    // 2. Seed Roles
    // ------------------------------------------------------
    const rolesData = [
        { code: RoleCodes.SUPER_ADMIN, name: 'Super Admin', description: 'Full access' },
        { code: RoleCodes.ADMIN, name: 'Admin', description: 'System administrator' },
        { code: RoleCodes.PLANNER, name: 'Planner', description: 'Plan manager' },
        { code: RoleCodes.LINE_MANAGER, name: 'Line Manager', description: 'Production manager' },
        { code: RoleCodes.VIEWER, name: 'Viewer', description: 'Read-only user' },
    ];

    for (const r of rolesData) {
        await prisma.role.upsert({
            where: { code: r.code },
            update: {},
            create: r,
        });
    }

    console.log(` Seeded ${rolesData.length} roles`);

    // Helper
    async function assignPermissions(roleCode: string, permCodes: string[]) {
        await prisma.role.update({
            where: { code: roleCode },
            data: {
                permissions: {
                    connect: permCodes.map((c) => ({ code: c })),
                },
            },
        });
    }

    const allCodes = Object.values(PermissionCodes);

    // ------------------------------------------------------
    // 3. Assign Permissions to Roles
    // ------------------------------------------------------

    // super_admin = full permissions
    await assignPermissions(RoleCodes.SUPER_ADMIN, allCodes);

    // admin
    await assignPermissions(RoleCodes.ADMIN, [
        PermissionCodes.USER_VIEW,
        PermissionCodes.USER_CREATE,
        PermissionCodes.USER_UPDATE,
        PermissionCodes.USER_DELETE,
        PermissionCodes.USER_ASSIGN_ROLE,

        PermissionCodes.ROLE_VIEW,
        PermissionCodes.ROLE_CREATE,
        PermissionCodes.ROLE_UPDATE,
        PermissionCodes.ROLE_DELETE,
        PermissionCodes.ROLE_ASSIGN_PERMISSION,

        PermissionCodes.BRICK_TYPE_VIEW,
        PermissionCodes.BRICK_TYPE_CREATE,
        PermissionCodes.BRICK_TYPE_UPDATE,
        PermissionCodes.BRICK_TYPE_DELETE,

        PermissionCodes.BRICK_QUOTA_VIEW,
        PermissionCodes.BRICK_QUOTA_UPDATE,

        PermissionCodes.REPORT_VIEW,
        PermissionCodes.REPORT_EXPORT,
    ]);

    // planner
    await assignPermissions(RoleCodes.PLANNER, [
        PermissionCodes.PLAN_VIEW,
        PermissionCodes.PLAN_CREATE,
        PermissionCodes.PLAN_UPDATE,
        PermissionCodes.PLAN_APPROVE,

        PermissionCodes.BRICK_TYPE_VIEW,
        PermissionCodes.BRICK_QUOTA_VIEW,

        PermissionCodes.REPORT_VIEW,
    ]);

    // line manager
    await assignPermissions(RoleCodes.LINE_MANAGER, [
        PermissionCodes.PLAN_VIEW,
        PermissionCodes.PAYROLL_VIEW,
        PermissionCodes.PAYROLL_CALCULATE,
    ]);

    // viewer
    await assignPermissions(RoleCodes.VIEWER, [
        PermissionCodes.PLAN_VIEW,
        PermissionCodes.REPORT_VIEW,
    ]);

    console.log(' Permissions assigned to roles');

    // ------------------------------------------------------
    // 4. Seed Users (5 users, each with 1 role)
    // ------------------------------------------------------

    const PASSWORD = '123456';
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const users = [
        { username: 'super', email: 'super@demo.com', fullName: 'Super Admin', role: RoleCodes.SUPER_ADMIN },
        { username: 'admin', email: 'admin@demo.com', fullName: 'Administrator', role: RoleCodes.ADMIN },
        { username: 'planner', email: 'planner@demo.com', fullName: 'Planner User', role: RoleCodes.PLANNER },
        { username: 'manager', email: 'manager@demo.com', fullName: 'Line Manager', role: RoleCodes.LINE_MANAGER },
        { username: 'viewer', email: 'viewer@demo.com', fullName: 'Viewer User', role: RoleCodes.VIEWER },
    ];

    for (const u of users) {
        const created = await prisma.user.upsert({
            where: { username: u.username },
            update: {},
            create: {
                username: u.username,
                email: u.email,
                fullName: u.fullName,
                passwordHash: hashed,
                isActive: true,
            },
        });

        // GA n role cho user (implicit M2M)
        await prisma.user.update({
            where: { id: created.id },
            data: {
                roles: {
                    connect: { code: u.role },
                },
            },
        });
    }

    // ------------------------------------------------------
    // 5. Seed Workshop
    // ------------------------------------------------------
    const workshop = await prisma.workshop.upsert({
        where: { code: 'PX1' },
        update: {},
        create: {
            code: 'PX1',
            name: 'Phân xưởng 1',
        },
    });

    // ------------------------------------------------------
    // 6. Seed Production Line
    // ------------------------------------------------------
    await prisma.productionLine.upsert({
        where: { id: 1 },
        update: {},
        create: {
            workshopId: workshop.id,
            code: 'DC1',
            name: 'Dây chuyền 1',
            iotClusterId: 1,
        },
    });

    console.log(' Seeded 5 users + assigned roles + default workshop/production line');
    console.log(' SEED DONE');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

