import { useState, useEffect } from 'react'

/** Blob → ObjectURL 변환 + 언마운트 시 자동 해제 */
export default function RecipePhoto({ blob, className = '', alt = '' }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) { setUrl(null); return }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  if (!url) {
    return (
      <div className={`${className} bg-stone-100 flex items-center justify-center`}>
        <span className="text-4xl opacity-25">☕</span>
      </div>
    )
  }
  return <img src={url} alt={alt} className={`${className} object-cover`} />
}
