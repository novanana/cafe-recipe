import { useState, useRef } from 'react'
import { resizeImage } from '../utils/imageUtils'
import RecipePhoto from '../components/RecipePhoto'

const CATEGORIES = ['커피', '라떼스페셜', '음료', '티', '프라페', '스무디', '에이드', '디저트']

const TEMPERATURES = [
  { value: 'hot',      label: '핫',      active: 'bg-orange-100 text-orange-600 border-orange-300' },
  { value: 'iced',     label: '아이스',  active: 'bg-sky-100 text-sky-600 border-sky-300' },
  { value: 'blended',  label: '블렌디드', active: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
]

export default function RecipeFormScreen({
  recipes,
  addRecipe,
  updateRecipe,
  recipeId,
  copyFromId,
  onNavigate,
}) {
  const isEdit = recipeId != null
  const isCopy = !isEdit && copyFromId != null
  const existing = isEdit
    ? recipes.find((r) => r.id === recipeId)
    : isCopy
    ? recipes.find((r) => r.id === copyFromId)
    : null

  const [form, setForm] = useState({
    name:        isCopy ? (existing?.name ?? '') : (existing?.name ?? ''),
    category:    existing?.category    ?? '커피',
    temperature: existing?.temperature ?? 'iced',
    photos:      existing?.photos      ?? [],
    ingredients: existing?.ingredients?.length > 0
      ? existing.ingredients
      : [{ name: '', amount: '' }],
    steps: existing?.steps ?? '',
    memo:  existing?.memo  ?? '',
  })
  const [nameError, setNameError] = useState('')
  const [saving,    setSaving]    = useState(false)
  const fileRef = useRef(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  /* ── 사진 ── */
  const handlePhotoAdd = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const slots = 3 - form.photos.length
    const blobs = await Promise.all(files.slice(0, slots).map(resizeImage))
    set('photos', [...form.photos, ...blobs])
    e.target.value = ''
  }
  const removePhoto = (i) =>
    set('photos', form.photos.filter((_, idx) => idx !== i))

  /* ── 재료 ── */
  const setIngredient = (i, field, value) =>
    set(
      'ingredients',
      form.ingredients.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)),
    )
  const addIngredient = () =>
    set('ingredients', [...form.ingredients, { name: '', amount: '' }])
  const removeIngredient = (i) => {
    if (form.ingredients.length <= 1) return
    set('ingredients', form.ingredients.filter((_, idx) => idx !== i))
  }

  /* ── 저장 ── */
  const handleSave = async () => {
    if (!form.name.trim()) {
      setNameError('음료명을 입력해주세요')
      return
    }
    const duplicate = recipes.find(
      (r) =>
        r.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        r.temperature === form.temperature &&
        r.id !== recipeId,
    )
    if (duplicate) {
      setNameError(`같은 이름·온도의 레시피가 이미 있습니다`)
      return
    }
    setSaving(true)
    const data = {
      ...form,
      name:        form.name.trim(),
      ingredients: form.ingredients.filter((i) => i.name.trim()),
    }
    if (isEdit) {
      await updateRecipe(recipeId, data)
      onNavigate('detail', recipeId)
    } else {
      const id = await addRecipe(data)
      onNavigate('detail', id)
    }
  }

  const handleCancel = () => {
    if (isEdit) onNavigate('detail', recipeId)
    else if (isCopy) onNavigate('detail', copyFromId)
    else onNavigate('list')
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-16">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-sm px-5 pt-12 pb-3 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="text-stone-500 font-medium text-[15px] w-12"
        >
          취소
        </button>
        <span className="font-bold text-stone-900 text-[15px]">
          {isEdit ? '레시피 수정' : isCopy ? '레시피 복사' : '레시피 추가'}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-amber-800 font-bold text-[15px] w-12 text-right disabled:opacity-40"
        >
          {saving ? '...' : '저장'}
        </button>
      </div>

      <div className="px-4 mt-2 space-y-7">
        {/* ── 사진 ── */}
        <Field label="사진 (최대 3장)">
          <div
            className="flex gap-3 overflow-x-auto pb-1 pt-0.5"
            style={{ scrollbarWidth: 'none' }}
          >
            {form.photos.map((blob, i) => (
              <div key={i} className="relative flex-shrink-0">
                <RecipePhoto
                  blob={blob}
                  className="w-24 h-24 rounded-2xl"
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-stone-700 text-white rounded-full text-xs flex items-center justify-center shadow"
                >
                  ×
                </button>
              </div>
            ))}
            {form.photos.length < 3 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 flex-shrink-0 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 text-stone-300 bg-white active:bg-stone-50 transition-colors"
              >
                <span className="text-3xl leading-none">+</span>
                <span className="text-xs">사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoAdd}
          />
        </Field>

        {/* ── 음료명 ── */}
        <Field label="음료명 *" error={nameError}>
          <input
            value={form.name}
            onChange={(e) => { setNameError(''); set('name', e.target.value) }}
            placeholder="예: 카라멜 마끼아또"
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-300 text-[15px] outline-none focus:border-amber-400 transition-colors"
          />
        </Field>

        {/* ── 카테고리 ── */}
        <Field label="카테고리">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  form.category === cat
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Field>

        {/* ── 온도 ── */}
        <Field label="온도">
          <div className="flex gap-2">
            {TEMPERATURES.map((t) => (
              <button
                key={t.value}
                onClick={() => set('temperature', t.value)}
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition-colors ${
                  form.temperature === t.value
                    ? t.active
                    : 'bg-white text-stone-400 border-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* ── 재료 ── */}
        <Field label="재료">
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={ing.name}
                  onChange={(e) => setIngredient(i, 'name', e.target.value)}
                  placeholder="재료명"
                  className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-amber-400 transition-colors"
                />
                <input
                  value={ing.amount}
                  onChange={(e) => setIngredient(i, 'amount', e.target.value)}
                  placeholder="용량"
                  className="w-24 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  onClick={() => removeIngredient(i)}
                  className="w-7 text-stone-300 text-xl leading-none flex items-center justify-center flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="w-full py-3 border border-dashed border-stone-200 rounded-xl text-stone-400 text-sm bg-white active:bg-stone-50 transition-colors"
            >
              + 재료 추가
            </button>
          </div>
        </Field>

        {/* ── 제조 순서 ── */}
        <Field label="제조 순서">
          <textarea
            value={form.steps}
            onChange={(e) => set('steps', e.target.value)}
            placeholder={"1. 우유를 스팀한다\n2. 에스프레소를 추출한다\n3. 카라멜 소스를 올린다"}
            rows={5}
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-300 text-sm leading-relaxed outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </Field>

        {/* ── 메모 ── */}
        <Field label="메모">
          <textarea
            value={form.memo}
            onChange={(e) => set('memo', e.target.value)}
            placeholder="추가 팁이나 주의사항"
            rows={3}
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-300 text-sm leading-relaxed outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </Field>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {error && <p className="text-red-400 text-xs mb-1.5">{error}</p>}
      {children}
    </div>
  )
}
