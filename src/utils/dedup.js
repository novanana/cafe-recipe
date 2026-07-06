import { db } from '../db'
import { getSeedPriceMap } from '../data/seedRecipes'

const score = (r) =>
  (r.ingredients?.length ?? 0) * 10 +
  (r.steps?.length ?? 0) +
  (r.memo?.length ?? 0) +
  (r.photos?.length ?? 0) * 5

/** 시드 데이터 기반 가격 자동 설정 (가격 없는 항목만) */
export async function migratePrices() {
  const priceMap = getSeedPriceMap()
  const all = await db.recipes.toArray()
  const toUpdate = all.filter(
    (r) => r.price == null && priceMap.has(`${r.name}__${String(r.temperature)}`)
  )
  if (toUpdate.length === 0) return
  await Promise.all(
    toUpdate.map((r) =>
      db.recipes.update(r.id, { price: priceMap.get(`${r.name}__${String(r.temperature)}`) })
    )
  )
}

/** 디저트 카테고리 온도 값 제거 */
export async function migrateDessertTemperature() {
  const targets = await db.recipes.where('category').equals('디저트').toArray()
  const toFix = targets.filter((r) => r.temperature != null && r.temperature !== '')
  if (toFix.length === 0) return
  await Promise.all(toFix.map((r) => db.recipes.update(r.id, { temperature: null })))
}

/** 스무디 카테고리 중 요거트 항목을 요거트 카테고리로 이동 */
export async function migrateYogurtCategory() {
  const targets = await db.recipes
    .where('category').equals('스무디')
    .filter((r) => r.name.includes('요거트'))
    .toArray()
  if (targets.length === 0) return
  await Promise.all(
    targets.map((r) => db.recipes.update(r.id, { category: '요거트' }))
  )
}

/** 디저트 카테고리 중 생과일주스 항목을 생과일주스 카테고리로 이동 */
export async function migrateFreshJuiceCategory() {
  const targets = await db.recipes
    .where('category').equals('디저트')
    .filter((r) => r.name.includes('생과일주스'))
    .toArray()
  if (targets.length === 0) return
  await Promise.all(
    targets.map((r) => db.recipes.update(r.id, { category: '생과일주스', temperature: 'iced' }))
  )
}

export async function deduplicateRecipes() {
  const all = await db.recipes.orderBy('id').toArray()
  const seen = new Map()
  const toDelete = []

  for (const r of all) {
    const key = `${r.name.trim().toLowerCase()}__${r.temperature}`
    if (!seen.has(key)) {
      seen.set(key, r)
    } else {
      const prev = seen.get(key)
      if (score(r) > score(prev)) {
        toDelete.push(prev.id)
        seen.set(key, r)
      } else {
        toDelete.push(r.id)
      }
    }
  }

  if (toDelete.length > 0) await db.recipes.bulkDelete(toDelete)
  return toDelete.length
}
