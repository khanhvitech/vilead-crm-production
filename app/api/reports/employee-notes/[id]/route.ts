import { NextRequest, NextResponse } from 'next/server'

import {
  deleteEmployeeReportNote,
  readEmployeeReportNotes,
  updateEmployeeReportNote,
} from '@/lib/employee-report-notes-store'
import type { ReportCurrentUser } from '@/lib/employee-report-notes'
import { isManagerRole } from '@/lib/employee-report-notes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const canManageNote = (currentUser: ReportCurrentUser | undefined, createdById: string) => {
  if (!currentUser?.id) return false
  return currentUser.id === createdById || isManagerRole(currentUser.role)
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const noteId = context.params.id
  const body = await request.json()
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const currentUser = body.currentUser as ReportCurrentUser | undefined

  if (!content) {
    return NextResponse.json({ message: 'Nội dung ghi chú không được để trống.' }, { status: 400 })
  }

  const notes = await readEmployeeReportNotes()
  const note = notes.find(item => item.id === noteId)

  if (!note) {
    return NextResponse.json({ message: 'Không tìm thấy ghi chú.' }, { status: 404 })
  }

  if (!canManageNote(currentUser, note.createdById)) {
    return NextResponse.json({ message: 'Bạn không có quyền chỉnh sửa ghi chú này.' }, { status: 403 })
  }

  const updatedNote = await updateEmployeeReportNote(noteId, content)

  return NextResponse.json({ note: updatedNote })
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const noteId = context.params.id
  const body = await request.json().catch(() => ({}))
  const currentUser = body.currentUser as ReportCurrentUser | undefined

  const notes = await readEmployeeReportNotes()
  const note = notes.find(item => item.id === noteId)

  if (!note) {
    return NextResponse.json({ message: 'Không tìm thấy ghi chú.' }, { status: 404 })
  }

  if (!canManageNote(currentUser, note.createdById)) {
    return NextResponse.json({ message: 'Bạn không có quyền xóa ghi chú này.' }, { status: 403 })
  }

  await deleteEmployeeReportNote(noteId)
  return NextResponse.json({ success: true })
}
