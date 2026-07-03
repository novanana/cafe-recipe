import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { deduplicateRecipes, migrateYogurtCategory, migrateDessertTemperature } from '../utils/dedup'

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
    const rows = await db.recipes.orderBy('sortOrder').toArray()
    setRecipes(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    migrateDessertTemperature().then(() => migrateYogurtCategory()).then(() => deduplicateRecipes()).then(() => fetchAll())
  }, [fetchAll])

  /** 단일 레시피 조회 (상세 화면용) */
  const getRecipe = useCallback((id) => db.recipes.get(id), [])

  /** 레시피 추가 → 새 id 반환 */
  const addRecipe = useCallback(async (data) => {
    const now = new Date()
    const maxOrder = await db.recipes.orderBy('sortOrder').last().then((r) => r?.sortOrder ?? 0)
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
      sortOrder: maxOrder + 1,
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

  /** 필터된 목록 내 순서 변경: filteredItems의 sortOrder를 newIds 순서로 재배분 */
  const reorderRecipes = useCallback(async (newIds, filteredItems) => {
    const sortedOrders = filteredItems
      .map((r) => r.sortOrder)
      .sort((a, b) => a - b)
    await db.transaction('rw', db.recipes, async () => {
      await Promise.all(
        newIds.map((id, i) => db.recipes.update(id, { sortOrder: sortedOrders[i] }))
      )
    })
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
    reorderRecipes,
    refetch: fetchAll,
  }
}
