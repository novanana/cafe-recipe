import RecipePhoto from './RecipePhoto'

const TEMP_LABEL = { hot: '핫', iced: '아이스', blended: '블렌디드' }
const TEMP_CLASS = {
  hot: 'bg-orange-100 text-orange-600',
  iced: 'bg-sky-100 text-sky-600',
  blended: 'bg-emerald-100 text-emerald-600',
}

export default function RecipeCard({
  recipe,
  onPress,
  onToggleFavorite,
  selectionMode = false,
  selected = false,
  dragHandleProps = {},
}) {
  const { name, category, temperature, isFavorite, photos, price } = recipe

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all flex ${
        selectionMode
          ? selected
            ? 'border-amber-400 shadow-amber-100'
            : 'border-stone-100'
          : 'border-stone-100 active:scale-[0.98]'
      }`}
      onClick={onPress}
    >
      {/* 선택 모드 체크 오버레이 */}
      <div className="relative flex-shrink-0">
        <RecipePhoto blob={photos?.[0]} alt={name} className="w-28 h-28" />
        {selectionMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected
                  ? 'bg-amber-500 border-amber-500'
                  : 'bg-white/80 border-white'
              }`}
            >
              {selected && (
                <svg viewBox="0 0 12 10" className="w-3 h-3 fill-white">
                  <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold text-stone-900 text-[15px] leading-snug truncate">{name}</p>
            {price != null && (
              <span className="text-sm font-bold text-amber-800 flex-shrink-0">
                {price.toLocaleString()}원
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs text-stone-400">{category}</span>
            {temperature && TEMP_LABEL[temperature] && (
              <>
                <span className="text-stone-200 text-xs">·</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEMP_CLASS[temperature]}`}>
                  {TEMP_LABEL[temperature]}
                </span>
              </>
            )}
          </div>
        </div>

        {!selectionMode && (
          <div className="flex items-center justify-end gap-3">
            <button
              className={`text-xl leading-none transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-stone-200'
              }`}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            >
              ★
            </button>
            {/* 드래그 핸들 */}
            <span
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="text-stone-300 text-lg leading-none cursor-grab active:cursor-grabbing select-none touch-none px-1"
            >
              ⠿
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
