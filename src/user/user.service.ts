import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PROVIDER } from 'src/common/redis/redis.constant';
import { PrismaService } from 'src/prisma/prisma.service';

interface RolesPermissionsCacheEntry {
    roles: string[]
    permissions: string[]
    expiresAt: number
}

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_PROVIDER) private readonly redis: Redis,
    ) { }

    private readonly rolesPermissionsCache = new Map<number, RolesPermissionsCacheEntry>()
    private readonly CACHE_TTL_MS = 300_000

    private rolesPermissionsCacheKey(userId: number) {
        return `user_roles_permissions:${userId}`
    }

    private async getRolesPermissionsFromRedis(userId: number) {
        const key = this.rolesPermissionsCacheKey(userId)
        const raw = await this.redis.get(key)
        if (!raw) return null
        try {
            const parsed = JSON.parse(raw) as { roles: string[]; permissions: string[] }
            this.rolesPermissionsCache.set(userId, {
                roles: parsed.roles ?? [],
                permissions: parsed.permissions ?? [],
                expiresAt: Date.now() + this.CACHE_TTL_MS,
            })
            return parsed
        } catch {
            await this.redis.del(key)
            return null
        }
    }

    private async setRolesPermissionsCache(userId: number, data: { roles: string[]; permissions: string[] }) {
        const key = this.rolesPermissionsCacheKey(userId)
        const payload = JSON.stringify(data)
        this.rolesPermissionsCache.set(userId, {
            roles: data.roles ?? [],
            permissions: data.permissions ?? [],
            expiresAt: Date.now() + this.CACHE_TTL_MS,
        })
        await this.redis.set(key, payload, 'EX', Math.ceil(this.CACHE_TTL_MS / 1000))
    }

    // CREATE
    // async create(createUserDTO: CreateUserDTO) {
    //     const { email, password, username } = createUserDTO
    //     const passwordHash = await this.hasher.hash(password)

    //     const newUser = await this.userRepository.create({
    //         email: email.toLowerCase(),
    //         username: username.toLowerCase(),
    //         passwordHash
    //     })

    //     return await this.userRepository.save(newUser)
    // }


    // READ
    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            omit: {
                passwordHash: true,
            },
        })
    }

    async findOneByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
        })
    }

    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        })
    }

    // PERMISSION
    async findUserPermissions(userId: number): Promise<string[]> {
        const { permissions } = await this.findUserRolesAndPermissions(userId)
        return permissions
    }

    async findUserRolesAndPermissions(userId: number): Promise<{ roles: string[]; permissions: string[] }> {
        const inMemory = this.rolesPermissionsCache.get(userId)
        if (inMemory && inMemory.expiresAt > Date.now()) {
            return {
                roles: inMemory.roles,
                permissions: inMemory.permissions,
            }
        }

        const fromRedis = await this.getRolesPermissionsFromRedis(userId)
        if (fromRedis) {
            return fromRedis
        }

        const userRoles = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                roles: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        code: true,
                        permissions: {
                            select: {
                                code: true,
                            },
                        },
                    },
                },
            },
        })

        if (!userRoles || !userRoles.roles || userRoles.roles.length === 0) {
            const empty = { roles: [] as string[], permissions: [] as string[] }
            await this.setRolesPermissionsCache(userId, empty)
            return empty
        }

        const roles: string[] = []
        const permissionSet = new Set<string>()

        for (const role of userRoles.roles) {
            roles.push(role.code)

            if (!role.permissions) continue

            for (const permission of role.permissions) {
                const permissionCode = permission.code
                if (!permissionCode) continue
                permissionSet.add(permissionCode)
            }
        }

        const result = {
            roles,
            permissions: Array.from(permissionSet),
        }

        await this.setRolesPermissionsCache(userId, result)
        return result
    }
}
