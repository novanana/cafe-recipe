import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="bg-stone-800 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl max-w-md mx-auto">
        <div>
          <p className="text-sm font-semibold">새 버전이 있습니다</p>
          <p className="text-xs text-stone-400 mt-0.5">업데이트 후 최신 기능을 사용할 수 있어요</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="ml-4 bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          업데이트
        </button>
      </div>
    </div>
  )
}
