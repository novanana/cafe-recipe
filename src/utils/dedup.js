import { db } from '../db'

const score = (r) =>
  (r.ingredients?.length ?? 0) * 10 +
  (r.steps?.length ?? 0) +
  (r.memo?.length ?? 0) +
  (r.photos?.length ?? 0) * 5

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
