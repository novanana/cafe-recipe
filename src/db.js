import Dexie from 'dexie'

export const db = new Dexie('CafeRecipeDB')

// photos, ingredients, steps, memo 는 인덱스 불필요 — 자동 저장됨
db.version(1).stores({
  recipes: '++id, name, category, temperature, isFavorite, createdAt, updatedAt',
})
