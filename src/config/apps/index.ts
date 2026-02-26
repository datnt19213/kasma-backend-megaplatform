
export enum UserType {
    KASMA_0 = 'KASMA_0',
    KASMA_1 = 'KASMA_1',
    KASMA_2 = 'KASMA_2',
    KASMA_3 = 'KASMA_3',
    KASMA_4 = 'KASMA_4',
    KASMA_5 = 'KASMA_5',

    TENANT_0 = 'TENANT_0',
    TENANT_1 = 'TENANT_1',
    TENANT_2 = 'TENANT_2',
    TENANT_3 = 'TENANT_3',
    TENANT_4 = 'TENANT_4',
    TENANT_5 = 'TENANT_5',

    GENERAL_0 = 'GENERAL_0',
    GENERAL_1 = 'GENERAL_1',
    GENERAL_2 = 'GENERAL_2',
    GENERAL_3 = 'GENERAL_3',
    GENERAL_4 = 'GENERAL_4',
    GENERAL_5 = 'GENERAL_5',
}

/**
 * User Status
 * @property ACTIVE: User is active and can login
 * @property INACTIVE: User is inactive and cannot login
 * @property PENDING: User is pending (situation: waiting for admin approval) and cannot login
 * @property SUSPENDED: User is suspended (situation: too many failed login attempts) and cannot login
 * @property LOCKED: User is locked (situation: too many failed login attempts or admin action) and cannot login
 * @property DELETED: User is deleted (situation: admin action) and cannot login
 */
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended',
    LOCKED = 'locked',
    DELETED = 'deleted',
}