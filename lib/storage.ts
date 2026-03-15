// lib/storage.ts

export interface SavedResult {
  id: string
  timestamp: number
  studentInfo: {
    name: string
    matricNumber: string
    level: string
    faculty: string
    department: string
    academicSession: string
    semester: string
  }
  courses: Array<{
    id: string
    code: string
    title?: string   // from DB
    unit: number
    score: number
    gradePoint: number
    remark?: string  // from DB
  }>
  calculations: {
    totalUnits: number
    totalUnitsPassed: number
    totalWGP: number
    cgpa: string
  }
}

export interface SemesterGroup {
  name: string
  students: SavedResult[]
}

export interface SessionGroup {
  id: number
  name: string
  semesters: SemesterGroup[]
}

export interface DepartmentGroup {
  id: number
  name: string
  faculty: string
  sessions: SessionGroup[]
}

// ── Session transcript types ──────────────────────────────────────────────────

export interface TranscriptCourse {
  id: string
  code: string
  title: string    // from DB
  unit: number
  score: number
  gradePoint: number
  remark: string   // from DB
}

export interface TranscriptSemester {
  name: string                  // "First Semester" | "Second Semester" | "Third Semester"
  courses: TranscriptCourse[]
  totalUnits: number
  totalUnitsPassed: number
  totalWGP: number
  semesterGPA: string           // GPA for this semester only
  cumulativeCGPA: string        // Running CGPA up to and including this semester (all time)
}

export interface StudentSessionTranscript {
  studentInfo: {
    name: string
    matricNumber: string
    level: string
    faculty: string
    department: string
    academicSession: string
    semester: string
  }
  departmentId: number
  semesters: TranscriptSemester[]
  sessionTotalUnits: number
  sessionTotalUnitsPassed: number
  sessionTotalWGP: number
  sessionGPA: string            // GPA for this session only
  overallCGPA: string           // Running CGPA after last semester of this session
}

// ─── Semester results (existing) ─────────────────────────────────────────────

export async function saveResult(
  result: Omit<SavedResult, 'id' | 'timestamp'>
): Promise<SavedResult> {
  const res = await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Failed to save: ${res.statusText}`)
  }
  return { ...result, id: result.studentInfo.matricNumber, timestamp: Date.now() }
}

export async function getSavedResults(): Promise<DepartmentGroup[]> {
  const res = await fetch('/api/results')
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.statusText}`)
  return res.json()
}

export async function deleteResult(id: string): Promise<void> {
  const res = await fetch(`/api/results/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete: ${res.statusText}`)
}

export async function deleteMultipleResults(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteResult(id)))
}

export async function deleteDepartmentResults(departmentId: number): Promise<void> {
  const res = await fetch(`/api/results/department/${departmentId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete department results: ${res.statusText}`)
}

export async function deleteMultipleDepartmentResults(departmentIds: number[]): Promise<void> {
  await Promise.all(departmentIds.map((id) => deleteDepartmentResults(id)))
}

export async function clearAllResults(): Promise<void> {
  const res = await fetch('/api/results', { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to clear: ${res.statusText}`)
}

// ─── Session transcript (new) ─────────────────────────────────────────────────

export async function getSessionResults(sessionId: number): Promise<StudentSessionTranscript[]> {
  const res = await fetch(`/api/results/session/${sessionId}`)
  if (!res.ok) throw new Error(`Failed to fetch session results: ${res.statusText}`)
  return res.json()
}