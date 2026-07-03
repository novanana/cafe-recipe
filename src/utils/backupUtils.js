import { db } from '../db'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** IndexedDB 전체 → JSON 파일 다운로드 */
export async function exportData() {
  const recipes = await db.recipes.toArray()

  const serialized = await Promise.all(
    recipes.map(async (r) => {
      const { id, ...rest } = r
      return {
        ...rest,
        photos: await Promise.all((r.photos ?? []).map(blobToBase64)),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
      }
    }),
  )

  const payload = JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), count: recipes.length, recipes: serialized },
    null,
    2,
  )

  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `카페레시피_백업_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return recipes.length
}

/** JSON 파일 파싱 → 미리보기 정보 반환 (DB 변경 없음) */
export async function parseBackupFile(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (!data.version || !Array.isArray(data.recipes)) {
    throw new Error('올바른 백업 파일이 아닙니다')
  }
  return { count: data.recipes.length, exportedAt: data.exportedAt, recipes: data.recipes }
}

/** 기존 DB 전체 삭제 후 백업 데이터로 복원 */
export async function importData(parsedData) {
  const recipes = parsedData.recipes.map((r) => ({
    ...r,
    photos: (r.photos ?? []).map((p) => (typeof p === 'string' ? base64ToBlob(p) : p)),
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }))

  await db.recipes.clear()
  await db.recipes.bulkAdd(recipes)
  return recipes.length
}
