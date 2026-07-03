import Dexie from 'dexie'

export const db = new Dexie('CafeRecipeDB')

db.version(1).stores({
  recipes: '++id, name, category, temperature, isFavorite, createdAt, updatedAt',
})

db.version(2).stores({
  recipes: '++id, name, category, temperature, isFavorite, createdAt, updatedAt, sortOrder',
}).upgrade(async (tx) => {
  const all = await tx.table('recipes').toArray()
  await Promise.all(
    all.map((r) => tx.table('recipes').update(r.id, { sortOrder: r.id }))
  )
})
