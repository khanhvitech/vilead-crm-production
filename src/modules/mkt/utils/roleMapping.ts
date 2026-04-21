import { UserRole } from '../types';

export const mapAppRoleToMktRole = (appRole: string): UserRole | null => {
  switch (appRole) {
    case 'admin':
      return 'admin';
    case 'ceo':
      return 'pm';
    case 'leader':
      return 'teamLeader';
    case 'sale':
      return 'employee';
    case 'accountant':
      return null; // no access for accountant
    default:
      return null;
  }
};
