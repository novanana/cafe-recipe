import { useState } from 'react'
import PhotoSlider from '../components/PhotoSlider'

const TEMP_LABEL = { hot: '핫', iced: '아이스', blended: '블렌디드' }
const TEMP_CLASS = {
  hot: 'bg-orange-100 text-orange-600',
  iced: 'bg-sky-100 text-sky-600',
  blended: 'bg-emerald-100 text-emerald-600',
}

export default function RecipeDetailScreen({
  recipes,
  deleteRecipe,
  toggleFavorite,
  recipeId,
  onNavigate,
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const recipe = recipes.find((r) => r.id === recipeId)

  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf9f7]">
        <p className="text-stone-400">레시피를 찾을 수 없습니다</p>
      </div>
    )
  }

  const { name, category, temperature, isFavorite, photos, ingredients, steps, memo } = recipe

  const handleDelete = async () => {
    setDeleting(true)
    await deleteRecipe(recipeId)
    onNavigate('list')
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-12">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-sm px-4 pt-12 pb-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('list')}
          className="flex items-center gap-1 text-amber-800 font-medium text-[15px]"
        >
          ‹ 목록
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('form', null, recipeId)}
            className="text-stone-500 text-sm font-medium"
          >
            복사
          </button>
          <button
            onClick={() => onNavigate('form', recipeId)}
            className="text-stone-500 text-sm font-medium"
          >
            수정
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="text-red-400 text-sm font-medium"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 사진 슬라이더 */}
      <PhotoSlider photos={photos} />

      {/* 본문 */}
      <div className="px-5 pt-5 space-y-6">
        {/* 제목 + 즐겨찾기 + 배지 */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-stone-900 leading-snug flex-1">{name}</h1>
            <button
              onClick={() => toggleFavorite(recipeId, isFavorite)}
              className={`text-2xl mt-0.5 transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-stone-200'
              }`}
              aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              ★
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
              {category}
            </span>
            {temperature && TEMP_LABEL[temperature] && (
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${TEMP_CLASS[temperature]}`}>
                {TEMP_LABEL[temperature]}
              </span>
            )}
          </div>
        </div>

        {/* 재료 */}
        {ingredients.length > 0 && (
          <>
            <Divider />
            <section>
              <SectionTitle>재료</SectionTitle>
              <ul className="mt-3 space-y-3">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-stone-800">{ing.name}</span>
                    <span className="text-stone-400 text-sm">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* 제조 순서 */}
        {steps && (
          <>
            <Divider />
            <section>
              <SectionTitle>제조 순서</SectionTitle>
              <p className="mt-3 text-stone-700 text-sm leading-7 whitespace-pre-wrap">{steps}</p>
            </section>
          </>
        )}

        {/* 메모 */}
        {memo && (
          <>
            <Divider />
            <section>
              <SectionTitle>메모</SectionTitle>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed whitespace-pre-wrap">{memo}</p>
            </section>
          </>
        )}
      </div>

      {/* 삭제 확인 바텀시트 */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />
            <p className="text-center font-bold text-stone-900 text-lg mb-1">레시피 삭제</p>
            <p className="text-center text-stone-500 text-sm mb-7 leading-relaxed">
              <span className="font-medium text-stone-700">"{name}"</span>을 삭제할까요?<br />
              삭제한 레시피는 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-xl font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">{children}</h2>
  )
}

function Divider() {
  return <hr className="border-stone-100" />
}
