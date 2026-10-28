/**
 * Firestore Security Rules Test Suite for Dirty Dozen Payloads (Bekendmakingen)
 */
export interface DirtyDozenTestCase {
  name: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    name: '1. Unauthenticated Write',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: null,
    payload: { id: 'scan_2026-10-27_001' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Unverified Email Spoof',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: false },
    payload: { id: 'scan_2026-10-27_001', ownerId: 'user_1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Identity Spoofing on Create',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'attacker_uid', email_verified: true },
    payload: { id: 'scan_2026-10-27_001', ownerId: 'victim_uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Shadow Field Injection on Create',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: { id: 'scan_2026-10-27_001', ownerId: 'user_1', ghostField: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. ID Poisoning',
    operation: 'create',
    path: '/bekendmakingScans/invalid$id!',
    auth: { uid: 'user_1', email_verified: true },
    payload: { id: 'invalid$id!', ownerId: 'user_1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Denial-of-Wallet String Overflow',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      id: 'scan_2026-10-27_001',
      ownerId: 'user_1',
      timestamp: 'A'.repeat(1000),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Invalid Enum State',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      id: 'scan_2026-10-27_001',
      ownerId: 'user_1',
      status: 'unknown_status',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Client-Forged Timestamp on Create',
    operation: 'create',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      id: 'scan_2026-10-27_001',
      ownerId: 'user_1',
      createdAt: '1999-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Ownership Hijack on Update',
    operation: 'update',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_2' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Unauthorized Field Mutation on Update',
    operation: 'update',
    path: '/bekendmakingScans/scan_2026-10-27_001',
    auth: { uid: 'user_1', email_verified: true },
    payload: { timestamp: '2099-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Cross-Tenant Read (get)',
    operation: 'get',
    path: '/bekendmakingScans/other_user_doc',
    auth: { uid: 'user_1', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Unscoped List Scraping (list)',
    operation: 'list',
    path: '/bekendmakingScans',
    auth: { uid: 'user_1', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
