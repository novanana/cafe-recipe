import { useState } from 'react'
import RecipePhoto from './RecipePhoto'

export default function PhotoSlider({ photos = [] }) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-square bg-stone-100 flex items-center justify-center">
        <span className="text-7xl opacity-20">☕</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        onScroll={(e) => {
          const idx = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth)
          setActive(idx)
        }}
      >
        {photos.map((blob, i) => (
          <RecipePhoto
            key={i}
            blob={blob}
            alt=""
            className="w-full aspect-square flex-shrink-0 snap-start"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full bg-white transition-all duration-200 ${
                i === active ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
