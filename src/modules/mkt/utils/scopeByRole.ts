import { User } from '../types';

export function scopeByRole<T extends { user_id?: string; department?: string }>(
  data: T[],
  currentUser: User,
  allUsers: User[]
): T[] {
  if (currentUser.role === 'employee') {
    return data.filter(d => d.user_id === currentUser.id);
  }
  if (currentUser.role === 'teamLeader') {
    const teamIds = allUsers.filter(u => u.department === currentUser.department).map(u => u.id);
    return data.filter(d => !d.user_id || teamIds.includes(d.user_id));
  }
  return data; // pm, admin: full
}
