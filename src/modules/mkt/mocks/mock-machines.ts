import { MOCK_USERS } from './mock-users';
import { Machine, UserRole } from '../types';

export type MachineEmploymentStatus = 'active' | 'inactive';

export interface MachineAssignee {
  id: string;
  full_name: string;
  avatar_initial: string;
  department: 'Team A' | 'Team B';
  role: UserRole;
  employment_status: MachineEmploymentStatus;
}

export interface MachineRecord extends Omit<Machine, 'last_sync_at' | 'status'> {
  assigned_user_id: string | null;
  last_sync_at: string;
  status: 'online' | 'offline';
  connection_code: string;
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const MACHINE_ASSIGNEES: MachineAssignee[] = [
  ...MOCK_USERS.map((user) => ({
    ...user,
    employment_status: 'active' as const,
  })),
  {
    id: 'usr-9',
    full_name: 'Thao Vo',
    avatar_initial: 'T',
    department: 'Team B',
    role: 'employee',
    employment_status: 'inactive',
  },
];

export const MOCK_MACHINES: MachineRecord[] = [
  {
    id: 'mch-001',
    name: 'MAY-HUONG-01',
    assigned_user_id: 'usr-1',
    last_sync_at: minutesAgo(2),
    status: 'online',
    connection_code: 'VL-X7K9-M3P2-Q8N1-B5D4',
  },
  {
    id: 'mch-002',
    name: 'MAY-HUONG-02',
    assigned_user_id: 'usr-1',
    last_sync_at: minutesAgo(15),
    status: 'online',
    connection_code: 'VL-A9H7-K2Q8-M4R6-P7W3',
  },
  {
    id: 'mch-003',
    name: 'MAY-BINH-01',
    assigned_user_id: 'usr-2',
    last_sync_at: minutesAgo(8 * 60),
    status: 'offline',
    connection_code: 'VL-D6R8-T9M4-H2Q7-K5X3',
  },
  {
    id: 'mch-004',
    name: 'MAY-MAI-01',
    assigned_user_id: 'usr-3',
    last_sync_at: minutesAgo(3 * 24 * 60),
    status: 'offline',
    connection_code: 'VL-C7N5-W8H2-R6P9-T4K3',
  },
  {
    id: 'mch-005',
    name: 'MAY-DUC-01',
    assigned_user_id: 'usr-4',
    last_sync_at: minutesAgo(5),
    status: 'online',
    connection_code: 'VL-M8T6-Q3R7-H9K4-X2W5',
  },
  {
    id: 'mch-006',
    name: 'MAY-LAN-01',
    assigned_user_id: 'usr-5',
    last_sync_at: minutesAgo(12),
    status: 'online',
    connection_code: 'VL-P4R7-C8M2-W9T6-H3Q5',
  },
  {
    id: 'mch-007',
    name: 'MAY-NAM-01',
    assigned_user_id: 'usr-6',
    last_sync_at: minutesAgo(7),
    status: 'online',
    connection_code: 'VL-R9H4-K7T3-M2Q8-C6W5',
  },
  {
    id: 'mch-008',
    name: 'MAY-HUE-01',
    assigned_user_id: 'usr-7',
    last_sync_at: minutesAgo(3),
    status: 'online',
    connection_code: 'VL-W6P2-X9K7-H4R8-T3M5',
  },
  {
    id: 'mch-009',
    name: 'MAY-SON-01',
    assigned_user_id: 'usr-8',
    last_sync_at: minutesAgo(18),
    status: 'online',
    connection_code: 'VL-Q5M8-R2W7-C9H4-K6T3',
  },
  {
    id: 'mch-010',
    name: 'MAY-THAO-OLD-01',
    assigned_user_id: 'usr-9',
    last_sync_at: minutesAgo(11),
    status: 'online',
    connection_code: 'VL-T8C4-P7M2-W6Q9-H3R5',
  },
  {
    id: 'mch-011',
    name: 'MAY-CHUA-GAN-01',
    assigned_user_id: null,
    last_sync_at: minutesAgo(14),
    status: 'online',
    connection_code: 'VL-H7W3-Q4T9-M8R2-C5K6',
  },
  {
    id: 'mch-012',
    name: 'MAY-HUONG-03',
    assigned_user_id: 'usr-1',
    last_sync_at: minutesAgo(9),
    status: 'online',
    connection_code: 'VL-K4Q8-H6P2-R7W5-M9T3',
  },
  {
    id: 'mch-013',
    name: 'MAY-BINH-02',
    assigned_user_id: 'usr-2',
    last_sync_at: minutesAgo(26),
    status: 'online',
    connection_code: 'VL-N3T7-C5H8-Q4M2-W6R9',
  },
  {
    id: 'mch-014',
    name: 'MAY-MAI-02',
    assigned_user_id: 'usr-3',
    last_sync_at: minutesAgo(22),
    status: 'online',
    connection_code: 'VL-X5R9-M4K7-P2T8-H6Q3',
  },
  {
    id: 'mch-015',
    name: 'MAY-DUC-02',
    assigned_user_id: 'usr-4',
    last_sync_at: minutesAgo(30 * 60),
    status: 'offline',
    connection_code: 'VL-B7M4-W8Q2-T5H9-R3K6',
  },
];
