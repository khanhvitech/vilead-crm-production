export type EmployeeReportNoteScopeType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'custom'

export type EmployeeReportUserRole = 'admin' | 'manager' | 'leader' | 'ceo' | 'user' | 'accountant'

export interface EmployeeReportNote {
  id: string
  employeeId: string
  content: string
  links: string[]
  scopeType: EmployeeReportNoteScopeType
  scopeStart?: string
  scopeEnd?: string
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ReportCurrentUser {
  id: string
  name: string
  role: EmployeeReportUserRole
}

export interface EmployeeReportScopeBounds {
  scopeStart?: string
  scopeEnd?: string
}

const URL_REGEX = /https?:\/\/[^\s]+/gi
const MANAGER_ROLES: EmployeeReportUserRole[] = ['admin', 'manager', 'leader', 'ceo']

const USER_PRESETS: Record<EmployeeReportUserRole, Omit<ReportCurrentUser, 'role'>> = {
  admin: { id: 'admin_001', name: 'Nguyễn Văn Anh' },
  manager: { id: 'manager_001', name: 'Trần Thị Bình' },
  leader: { id: 'leader_a', name: 'Nguyễn Văn Anh' },
  ceo: { id: 'ceo_001', name: 'Ban Giám đốc' },
  user: { id: 'user_001', name: 'Nhân viên Sales' },
  accountant: { id: 'accountant_001', name: 'Kế toán nội bộ' },
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export const extractUrls = (content: string) => {
  return Array.from(new Set((content.match(URL_REGEX) || []).map(item => item.trim())))
}

export const isManagerRole = (role: string) => MANAGER_ROLES.includes(role as EmployeeReportUserRole)

export const getDefaultReportCurrentUser = (): ReportCurrentUser => {
  if (typeof window === 'undefined') {
    return { ...USER_PRESETS.admin, role: 'admin' }
  }

  const rawRole = (window.localStorage.getItem('userRole') || 'admin') as EmployeeReportUserRole
  const role = USER_PRESETS[rawRole] ? rawRole : 'admin'
  const preset = USER_PRESETS[role]
  const customName = window.localStorage.getItem('userName')?.trim()
  const customId = window.localStorage.getItem('userId')?.trim()

  return {
    id: customId || preset.id,
    name: customName || preset.name,
    role,
  }
}

export const getScopeBounds = (
  scopeType: EmployeeReportNoteScopeType,
  referenceDate: Date = new Date(),
): EmployeeReportScopeBounds => {
  const current = new Date(referenceDate)

  if (scopeType === 'custom') {
    return {}
  }

  if (scopeType === 'today') {
    return {
      scopeStart: toIsoDate(startOfDay(current)),
      scopeEnd: toIsoDate(endOfDay(current)),
    }
  }

  if (scopeType === 'yesterday') {
    current.setDate(current.getDate() - 1)
    return {
      scopeStart: toIsoDate(startOfDay(current)),
      scopeEnd: toIsoDate(endOfDay(current)),
    }
  }

  if (scopeType === 'this_week') {
    const day = current.getDay()
    const distanceToMonday = day === 0 ? 6 : day - 1
    const weekStart = startOfDay(current)
    weekStart.setDate(weekStart.getDate() - distanceToMonday)
    const weekEnd = endOfDay(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return {
      scopeStart: toIsoDate(weekStart),
      scopeEnd: toIsoDate(weekEnd),
    }
  }

  if (scopeType === 'this_month') {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
    return {
      scopeStart: toIsoDate(startOfDay(monthStart)),
      scopeEnd: toIsoDate(endOfDay(monthEnd)),
    }
  }

  const quarter = Math.floor(current.getMonth() / 3)
  const quarterStart = new Date(current.getFullYear(), quarter * 3, 1)
  const quarterEnd = new Date(current.getFullYear(), quarter * 3 + 3, 0)
  return {
    scopeStart: toIsoDate(startOfDay(quarterStart)),
    scopeEnd: toIsoDate(endOfDay(quarterEnd)),
  }
}

export const isNoteInScope = (
  note: EmployeeReportNote,
  scopeType?: string | null,
  scopeStart?: string | null,
  scopeEnd?: string | null,
) => {
  if (scopeType && note.scopeType !== scopeType) return false
  if (scopeStart && note.scopeStart !== scopeStart) return false
  if (scopeEnd && note.scopeEnd !== scopeEnd) return false
  return true
}
