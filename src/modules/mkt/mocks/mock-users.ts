import { User } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'usr-admin', full_name: 'Nguyen Van Anh', avatar_initial: 'A', department: 'Team A', role: 'admin' },
  { id: 'usr-1', full_name: 'Huong Nguyen', avatar_initial: 'H', department: 'Team A', role: 'employee' },
  { id: 'usr-2', full_name: 'Binh Tran', avatar_initial: 'B', department: 'Team A', role: 'employee' },
  { id: 'usr-3', full_name: 'Mai Le', avatar_initial: 'M', department: 'Team B', role: 'employee' },
  { id: 'usr-4', full_name: 'Duc Pham', avatar_initial: 'D', department: 'Team B', role: 'employee' },
  { id: 'usr-5', full_name: 'Lan Vu', avatar_initial: 'L', department: 'Team A', role: 'employee' },
  { id: 'usr-6', full_name: 'Nam Hoang', avatar_initial: 'N', department: 'Team A', role: 'teamLeader' },
  { id: 'usr-7', full_name: 'Hue Bui', avatar_initial: 'H', department: 'Team B', role: 'teamLeader' },
  { id: 'usr-8', full_name: 'Son Trinh', avatar_initial: 'S', department: 'Team A', role: 'pm' },
];
