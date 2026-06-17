import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import type { EmployeeReportNote } from '@/lib/employee-report-notes'
import { extractUrls, isNoteInScope } from '@/lib/employee-report-notes'

const DATA_DIR = path.join(process.cwd(), 'data')
const STORE_FILE = path.join(DATA_DIR, 'employee-report-notes.json')

const ensureStoreFile = async () => {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await readFile(STORE_FILE, 'utf8')
  } catch {
    await writeFile(STORE_FILE, '[]', 'utf8')
  }
}

export const readEmployeeReportNotes = async (): Promise<EmployeeReportNote[]> => {
  await ensureStoreFile()

  const raw = await readFile(STORE_FILE, 'utf8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeEmployeeReportNotes = async (notes: EmployeeReportNote[]) => {
  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(notes, null, 2), 'utf8')
}

export const listEmployeeReportNotes = async (filters: {
  employeeId?: string | null
  scopeType?: string | null
  scopeStart?: string | null
  scopeEnd?: string | null
}) => {
  const notes = await readEmployeeReportNotes()

  return notes
    .filter(note => {
      if (filters.employeeId && note.employeeId !== filters.employeeId) return false
      return isNoteInScope(note, filters.scopeType, filters.scopeStart, filters.scopeEnd)
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

export const createEmployeeReportNote = async (
  payload: Omit<EmployeeReportNote, 'id' | 'links' | 'createdAt' | 'updatedAt'>,
) => {
  const notes = await readEmployeeReportNotes()
  const now = new Date().toISOString()

  const nextNote: EmployeeReportNote = {
    ...payload,
    id: `emp-note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    links: extractUrls(payload.content),
    createdAt: now,
    updatedAt: now,
  }

  notes.push(nextNote)
  await writeEmployeeReportNotes(notes)
  return nextNote
}

export const updateEmployeeReportNote = async (noteId: string, content: string) => {
  const notes = await readEmployeeReportNotes()
  const noteIndex = notes.findIndex(note => note.id === noteId)

  if (noteIndex === -1) {
    return null
  }

  const updatedNote: EmployeeReportNote = {
    ...notes[noteIndex],
    content,
    links: extractUrls(content),
    updatedAt: new Date().toISOString(),
  }

  notes[noteIndex] = updatedNote
  await writeEmployeeReportNotes(notes)
  return updatedNote
}

export const deleteEmployeeReportNote = async (noteId: string) => {
  const notes = await readEmployeeReportNotes()
  const nextNotes = notes.filter(note => note.id !== noteId)

  if (nextNotes.length === notes.length) {
    return false
  }

  await writeEmployeeReportNotes(nextNotes)
  return true
}
