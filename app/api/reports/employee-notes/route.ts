import { NextRequest, NextResponse } from 'next/server'

import { createEmployeeReportNote, listEmployeeReportNotes } from '@/lib/employee-report-notes-store'
import type { EmployeeReportNoteScopeType, ReportCurrentUser } from '@/lib/employee-report-notes'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_SCOPE_TYPES: EmployeeReportNoteScopeType[] = [
  'today',
  'yesterday',
  'this_week',
  'this_month',
  'this_quarter',
  'custom',
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const employeeId = searchParams.get('employeeId')
  const scopeType = searchParams.get('scopeType')
  const scopeStart = searchParams.get('scopeStart')
  const scopeEnd = searchParams.get('scopeEnd')

  const notes = await listEmployeeReportNotes({
    employeeId,
    scopeType,
    scopeStart,
    scopeEnd,
  })

  return NextResponse.json({ notes })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const currentUser = body.currentUser as ReportCurrentUser | undefined
  const employeeId = typeof body.employeeId === 'string' ? body.employeeId.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const scopeType = body.scopeType as EmployeeReportNoteScopeType | undefined
  const scopeStart = typeof body.scopeStart === 'string' ? body.scopeStart : undefined
  const scopeEnd = typeof body.scopeEnd === 'string' ? body.scopeEnd : undefined

  if (!currentUser?.id || !currentUser?.name) {
    return NextResponse.json({ message: 'Thiếu thông tin người dùng hiện tại.' }, { status: 400 })
  }

  if (!employeeId) {
    return NextResponse.json({ message: 'Thiếu nhân viên cần gắn ghi chú.' }, { status: 400 })
  }

  if (!content) {
    return NextResponse.json({ message: 'Nội dung ghi chú không được để trống.' }, { status: 400 })
  }

  if (!scopeType || !ALLOWED_SCOPE_TYPES.includes(scopeType)) {
    return NextResponse.json({ message: 'Phạm vi thời gian không hợp lệ.' }, { status: 400 })
  }

  if (scopeType === 'custom' && (!scopeStart || !scopeEnd)) {
    return NextResponse.json({ message: 'Phạm vi custom cần đủ ngày bắt đầu và kết thúc.' }, { status: 400 })
  }

  const note = await createEmployeeReportNote({
    employeeId,
    content,
    scopeType,
    scopeStart,
    scopeEnd,
    createdById: currentUser.id,
    createdByName: currentUser.name,
  })

  return NextResponse.json({ note }, { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({})
}
