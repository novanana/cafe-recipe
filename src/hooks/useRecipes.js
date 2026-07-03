import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { deduplicateRecipes, migrateYogurtCategory } from '../utils/dedup'

/**
 * 레시피 CRUD 훅
 *
 * recipes shape:
 * {
 *   id: number (auto),
 *   name: string,
 *   category: string,       // '에스프레소' | '라떼' | '프라푸치노' | '스무디' | '티' | '에이드' | '기타'
 *   temperature: string,    // 'hot' | 'iced' | 'blended'
 *   isFavorite: boolean,
 *   photos: Blob[],
 *   ingredients: { name: string, amount: string }[],
 *   steps: string,
 *   memo: string,
 *   createdAt: Date,
 *   updatedAt: Date,
 * }
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const rows = await db.recipes.orderBy('id').toArray()
    setRecipes(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    migrateYogurtCategory().then(() => deduplicateRecipes()).then(() => fetchAll())
  }, [fetchAll])

  /** 단일 레시피 조회 (상세 화면용) */
  const getRecipe = useCallback((id) => db.recipes.get(id), [])

  /** 레시피 추가 → 새 id 반환 */
  const addRecipe = useCallback(async (data) => {
    const now = new Date()
    const id = await db.recipes.add({
      name: '',
      category: '기타',
      temperature: 'iced',
      isFavorite: false,
      photos: [],
      ingredients: [],
      steps: '',
      memo: '',
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    await fetchAll()
    return id
  }, [fetchAll])

  /** 레시피 수정 */
  const updateRecipe = useCallback(async (id, data) => {
    await db.recipes.update(id, { ...data, updatedAt: new Date() })
    await fetchAll()
  }, [fetchAll])

  /** 레시피 삭제 */
  const deleteRecipe = useCallback(async (id) => {
    await db.recipes.delete(id)
    await fetchAll()
  }, [fetchAll])

  /** 즐겨찾기 토글 */
  const toggleFavorite = useCallback(async (id, current) => {
    await db.recipes.update(id, { isFavorite: !current, updatedAt: new Date() })
    await fetchAll()
  }, [fetchAll])

  /** 여러 레시피 한꺼번에 삭제 */
  const bulkDelete = useCallback(async (ids) => {
    await db.recipes.bulkDelete(ids)
    await fetchAll()
  }, [fetchAll])

  return {
    recipes,
    loading,
    getRecipe,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    bulkDelete,
    refetch: fetchAll,
  }
}
