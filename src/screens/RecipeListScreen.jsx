import { useState, useMemo } from 'react'
import RecipeCard from '../components/RecipeCard'

const CATEGORY_ORDER = ['커피', '라떼스페셜', '음료', '티', '프라페', '스무디', '에이드', '디저트']

const TEMP_ORDER = [
  { value: 'hot',     label: '핫' },
  { value: 'iced',    label: '아이스' },
  { value: 'blended', label: '블렌디드' },
]

export default function RecipeListScreen({ recipes, loading, toggleFavorite, onNavigate }) {
  const [query, setQuery]     = useState('')
  const [activeTab, setTab]   = useState('all')
  const [activeTemp, setTemp] = useState('all')

  /* ── 탭 목록 (실제 레시피에 있는 카테고리만 표시) ── */
  const tabs = useMemo(() => {
    const hasFav = recipes.some((r) => r.isFavorite)
    const usedCats = new Set(recipes.map((r) => r.category))
    const cats = CATEGORY_ORDER.filter((c) => usedCats.has(c))
    return [
      { id: 'all',       label: '전체' },
      ...(hasFav ? [{ id: 'favorites', label: '★ 즐겨찾기' }] : []),
      ...cats.map((c) => ({ id: c, label: c })),
    ]
  }, [recipes])

  /* ── 카테고리/즐겨찾기 필터 후 온도 칩 목록 ── */
  const catFiltered = useMemo(() => {
    if (activeTab === 'favorites') return recipes.filter((r) => r.isFavorite)
    if (activeTab !== 'all')      return recipes.filter((r) => r.category === activeTab)
    return recipes
  }, [recipes, activeTab])

  const tempChips = useMemo(() => {
    const usedTemps = new Set(catFiltered.map((r) => r.temperature))
    return TEMP_ORDER.filter((t) => usedTemps.has(t.value))
  }, [catFiltered])

  /* ── 탭 / 온도 / 검색 필터 ── */
  const filtered = useMemo(() => {
    let result = catFiltered
    if (activeTemp !== 'all') result = result.filter((r) => r.temperature === activeTemp)
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((r) => r.name.toLowerCase().includes(q))
    return result
  }, [catFiltered, activeTemp, query])

  const isFiltered   = activeTab !== 'all' || activeTemp !== 'all' || query.trim() !== ''
  const favorites    = filtered.filter((r) => r.isFavorite)
  const rest         = filtered.filter((r) => !r.isFavorite)

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-28">

      {/* ── 헤더 (sticky) ── */}
      <header className="px-5 pt-14 pb-3 sticky top-0 bg-[#faf9f7] z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">어느멋진날카페AN</h1>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-stone-400 text-sm">
                {isFiltered ? `${filtered.length}개 결과` : `총 ${recipes.length}개`}
              </span>
            )}
            <button
              onClick={() => onNavigate('settings')}
              className="text-stone-400 text-xl leading-none p-1"
              aria-label="설정"
            >
              ⚙︎
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative mt-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="레시피 검색..."
            className="w-full bg-white border border-stone-200 rounded-2xl pl-9 pr-9 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-amber-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        {!loading && tabs.length > 1 && (
          <div
            className="flex gap-2 mt-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setTab(tab.id); setTemp('all') }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-800 text-white'
                    : 'bg-white text-stone-500 border border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 온도 필터 */}
        {!loading && tempChips.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setTemp('all')}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeTemp === 'all'
                  ? 'bg-stone-700 text-white border-stone-700'
                  : 'bg-white text-stone-400 border-stone-200'
              }`}
            >
              전체
            </button>
            {tempChips.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemp(t.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeTemp === t.value
                    ? t.value === 'hot'
                      ? 'bg-orange-100 text-orange-600 border-orange-300'
                      : t.value === 'iced'
                      ? 'bg-sky-100 text-sky-600 border-sky-300'
                      : 'bg-emerald-100 text-emerald-600 border-emerald-300'
                    : 'bg-white text-stone-400 border-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── 본문 ── */}
      <main className="px-4">
        {loading ? (
          <CenteredMsg>불러오는 중...</CenteredMsg>
        ) : recipes.length === 0 ? (
          <EmptyAll />
        ) : filtered.length === 0 ? (
          <EmptySearch query={query} tab={activeTab} onReset={() => { setQuery(''); setTab('all'); setTemp('all') }} />
        ) : isFiltered ? (
          /* 검색/필터 결과 → 즐겨찾기 먼저, 단순 플랫 리스트 */
          <CardList
            recipes={[...favorites, ...rest]}
            onNavigate={onNavigate}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          /* 기본 섹션 레이아웃 */
          <>
            {favorites.length > 0 && (
              <section className="mb-5">
                <SectionLabel>즐겨찾기</SectionLabel>
                <CardList
                  recipes={favorites}
                  onNavigate={onNavigate}
                  onToggleFavorite={toggleFavorite}
                />
              </section>
            )}
            {rest.length > 0 && (
              <section>
                {favorites.length > 0 && <SectionLabel>전체</SectionLabel>}
                <CardList
                  recipes={rest}
                  onNavigate={onNavigate}
                  onToggleFavorite={toggleFavorite}
                />
              </section>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => onNavigate('form', null)}
        className="fixed bottom-8 right-5 w-14 h-14 bg-amber-800 text-white rounded-full text-3xl shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        aria-label="레시피 추가"
      >
        +
      </button>
    </div>
  )
}

/* ── 서브 컴포넌트 ── */

function CardList({ recipes, onNavigate, onToggleFavorite }) {
  return (
    <div className="space-y-3">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          onPress={() => onNavigate('detail', r.id)}
          onToggleFavorite={() => onToggleFavorite(r.id, r.isFavorite)}
        />
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  )
}

function CenteredMsg({ children }) {
  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-stone-300 text-sm">{children}</p>
    </div>
  )
}

function EmptyAll() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 mt-4">
      <span className="text-7xl">☕</span>
      <p className="text-stone-400 text-center text-sm leading-relaxed">
        저장된 레시피가 없습니다<br />
        아래 <strong>+</strong> 버튼으로 추가해보세요
      </p>
    </div>
  )
}

function EmptySearch({ query, tab, onReset }) {
  const msg = query.trim()
    ? `"${query}" 검색 결과가 없습니다`
    : '해당 카테고리의 레시피가 없습니다'

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 mt-4">
      <span className="text-5xl">🔍</span>
      <p className="text-stone-400 text-center text-sm">{msg}</p>
      <button
        onClick={onReset}
        className="mt-1 text-amber-800 font-semibold text-sm"
      >
        전체 보기
      </button>
    </div>
  )
}
