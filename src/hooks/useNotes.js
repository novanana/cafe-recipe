import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'

/**
 * 카페 관리 메모 CRUD 훅
 *
 * notes shape:
 * {
 *   id: number (auto),
 *   title: string,
 *   content: string,
 *   createdAt: Date,
 *   updatedAt: Date,
 *   sortOrder: number,
 * }
 */
export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const rows = await db.notes.orderBy('sortOrder').toArray()
    setNotes(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const getNote = useCallback((id) => db.notes.get(id), [])

  const addNote = useCallback(async (data) => {
    const now = new Date()
    const maxOrder = await db.notes.orderBy('sortOrder').last().then((n) => n?.sortOrder ?? 0)
    const id = await db.notes.add({
      title: '',
      content: '',
      ...data,
      createdAt: now,
      updatedAt: now,
      sortOrder: maxOrder + 1,
    })
    await fetchAll()
    return id
  }, [fetchAll])

  const updateNote = useCallback(async (id, data) => {
    await db.notes.update(id, { ...data, updatedAt: new Date() })
    await fetchAll()
  }, [fetchAll])

  const deleteNote = useCallback(async (id) => {
    await db.notes.delete(id)
    await fetchAll()
  }, [fetchAll])

  return {
    notes,
    loading,
    getNote,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchAll,
  }
}
