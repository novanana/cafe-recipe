import { useState, useRef, useEffect } from 'react'
import { exportData, parseBackupFile, importData } from '../utils/backupUtils'

export default function SettingsScreen({ recipes, refetch, onNavigate }) {
  const [exporting,   setExporting]   = useState(false)
  const [preview,     setPreview]     = useState(null)  // { count, exportedAt, recipes }
  const [importing,   setImporting]   = useState(false)
  const [toast,       setToast]       = useState(null)  // { type, text }
  const fileRef = useRef(null)

  const showToast = (type, text) => setToast({ type, text })

  /* ── 내보내기 ── */
  const handleExport = async () => {
    setExporting(true)
    try {
      const count = await exportData()
      showToast('success', `레시피 ${count}개를 파일로 저장했습니다`)
    } catch {
      showToast('error', '내보내기에 실패했습니다')
    } finally {
      setExporting(false)
    }
  }

  /* ── 파일 선택 → 파싱 → 미리보기 ── */
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseBackupFile(file)
      setPreview(parsed)
    } catch (err) {
      showToast('error', err.message ?? '올바른 백업 파일이 아닙니다')
    }
    e.target.value = ''
  }

  /* ── 복원 확정 ── */
  const handleImport = async () => {
    if (!preview) return
    setImporting(true)
    try {
      const count = await importData(preview)
      await refetch()
      setPreview(null)
      showToast('success', `레시피 ${count}개를 불러왔습니다`)
    } catch {
      showToast('error', '불러오기에 실패했습니다')
    } finally {
      setImporting(false)
    }
  }

  const exportedDate = preview?.exportedAt
    ? new Date(preview.exportedAt).toLocaleDateString('ko-KR')
    : ''

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3">
        <button
          onClick={() => onNavigate('list')}
          className="text-amber-800 font-medium text-[15px]"
        >
          ‹ 목록
        </button>
        <h1 className="text-xl font-bold text-stone-900">설정</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* ── 데이터 현황 ── */}
        <Section title="현황">
          <div className="bg-white rounded-2xl px-5 py-4 flex justify-around">
            <Stat label="저장된 레시피" value={recipes.length} unit="개" />
            <div className="w-px bg-stone-100" />
            <Stat
              label="즐겨찾기"
              value={recipes.filter((r) => r.isFavorite).length}
              unit="개"
            />
            <div className="w-px bg-stone-100" />
            <Stat
              label="사진"
              value={recipes.reduce((s, r) => s + (r.photos?.length ?? 0), 0)}
              unit="장"
            />
          </div>
        </Section>

        {/* ── 데이터 관리 ── */}
        <Section title="데이터 관리">
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-stone-50">
            <MenuButton
              icon="📤"
              label="내보내기"
              desc={`레시피 ${recipes.length}개와 사진을 JSON 파일로 저장`}
              onClick={handleExport}
              loading={exporting}
            />
            <MenuButton
              icon="📥"
              label="불러오기"
              desc="JSON 파일에서 레시피를 복원합니다 (기존 데이터 교체)"
              onClick={() => fileRef.current?.click()}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-stone-400 mt-2 px-1 leading-relaxed">
            내보내기 파일에는 사진 데이터가 포함됩니다. 핸드폰 교체 시 불러오기로 복원하세요.
          </p>
        </Section>

        {/* ── 앱 정보 ── */}
        <Section title="앱 정보">
          <div className="bg-white rounded-2xl px-5 py-4 space-y-3">
            <InfoRow label="앱 이름" value="카페 레시피" />
            <InfoRow label="버전" value="1.0.0" />
          </div>
        </Section>
      </div>

      {/* ── 불러오기 확인 바텀시트 ── */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => !importing && setPreview(null)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />
            <p className="text-center font-bold text-stone-900 text-lg mb-3">데이터 불러오기</p>

            <div className="bg-stone-50 rounded-2xl px-4 py-3 mb-5 space-y-1.5">
              <InfoRow label="백업 날짜" value={exportedDate} />
              <InfoRow label="레시피 수" value={`${preview.count}개`} />
            </div>

            <p className="text-center text-sm text-stone-500 leading-relaxed mb-6">
              불러오기를 실행하면{' '}
              <span className="text-red-500 font-semibold">기존 데이터가 모두 삭제</span>됩니다.<br />
              계속하시겠습니까?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                disabled={importing}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-xl font-semibold disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 py-3.5 bg-amber-800 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {importing ? '복원 중...' : '불러오기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

/* ── 서브 컴포넌트 ── */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">
        {title}
      </p>
      {children}
    </div>
  )
}

function Stat({ label, value, unit }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-stone-800">
        {value}
        <span className="text-sm font-normal text-stone-400 ml-0.5">{unit}</span>
      </span>
      <span className="text-xs text-stone-400">{label}</span>
    </div>
  )
}

function MenuButton({ icon, label, desc, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full px-5 py-4 flex items-center gap-4 text-left active:bg-stone-50 transition-colors disabled:opacity-50"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-stone-800 text-[15px]">
          {loading ? '처리 중...' : label}
        </p>
        <p className="text-stone-400 text-xs mt-0.5">{desc}</p>
      </div>
      <span className="text-stone-300 text-lg">›</span>
    </button>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-stone-500 text-sm">{label}</span>
      <span className="text-stone-800 text-sm font-medium">{value}</span>
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-8 left-4 right-4 z-50 pointer-events-none">
      <div
        className={`rounded-2xl px-5 py-4 text-white text-sm font-medium text-center shadow-xl ${
          toast.type === 'success' ? 'bg-stone-800' : 'bg-red-500'
        }`}
      >
        {toast.text}
      </div>
    </div>
  )
}
