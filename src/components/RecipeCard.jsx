import RecipePhoto from './RecipePhoto'

const TEMP_LABEL = { hot: '핫', iced: '아이스', blended: '블렌디드' }
const TEMP_CLASS = {
  hot: 'bg-orange-100 text-orange-600',
  iced: 'bg-sky-100 text-sky-600',
  blended: 'bg-emerald-100 text-emerald-600',
}

export default function RecipeCard({ recipe, onPress, onToggleFavorite }) {
  const { name, category, temperature, isFavorite, photos } = recipe

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex active:scale-[0.98] transition-transform"
      onClick={onPress}
    >
      <RecipePhoto
        blob={photos?.[0]}
        alt={name}
        className="w-28 h-28 flex-shrink-0"
      />

      <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-semibold text-stone-900 text-[15px] leading-snug truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs text-stone-400">{category}</span>
            <span className="text-stone-200 text-xs">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEMP_CLASS[temperature]}`}>
              {TEMP_LABEL[temperature]}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className={`text-xl leading-none transition-colors ${
              isFavorite ? 'text-amber-400' : 'text-stone-200'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
          >
            ★
          </button>
        </div>
      </div>
    </div>
  )
}
