import { useState, useMemo } from 'react'
import RecipeCard from '../components/RecipeCard'
import {
  DndContext, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const CATEGORY_ORDER = ['커피', '라떼스페셜', '음료', '티', '프라페', '스무디', '요거트', '에이드', '생과일주스', '디저트']

const TEMP_ORDER = [
  { value: 'hot',     label: '핫' },
  { value: 'iced',    label: '아이스' },
  { value: 'blended', label: '블렌디드' },
]

export default function RecipeListScreen({ recipes, loading, toggleFavorite, bulkDelete, reorderRecipes, onNavigate, initialFilter, onFilterChange }) {
  const [filter, setFilter] = useState({
    query:     initialFilter?.query     ?? '',
    activeTab: initialFilter?.activeTab ?? 'all',
    activeTemp:initialFilter?.activeTemp ?? 'all',
  })
  const { query, activeTab, activeTemp } = filter

  const updateFilter = (patch) =>
    setFilter((prev) => {
      const next = { ...prev, ...patch }
      onFilterChange?.(next)
      return next
    })

  const setQuery = (v) => updateFilter({ query: v })
  const setTab   = (v) => updateFilter({ activeTab: v, activeTemp: 'all' })
  const setTemp  = (v) => updateFilter({ activeTemp: v })
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds]     = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const exitSelection = () => { setSelectionMode(false); setSelectedIds(new Set()) }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = filtered.findIndex((r) => r.id === active.id)
    const newIndex = filtered.findIndex((r) => r.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(filtered, oldIndex, newIndex)
    reorderRecipes(newOrder.map((r) => r.id), filtered)
  }

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectAll = () => setSelectedIds(new Set(filtered.map((r) => r.id)))

  const handleBulkDelete = async () => {
    setDeleting(true)
    await bulkDelete([...selectedIds])
    setDeleting(false)
    setShowDeleteConfirm(false)
    exitSelection()
  }

  /* ── 탭 목록 (실제 레시피에 있는 카테고리만 표시, 전체 없음) ── */
  const tabs = useMemo(() => {
    const hasFav = recipes.some((r) => r.isFavorite)
    const usedCats = new Set(recipes.map((r) => r.category))
    const cats = CATEGORY_ORDER.filter((c) => usedCats.has(c))
    return [
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
          {selectionMode ? (
            <>
              <button
                onClick={exitSelection}
                className="text-stone-500 font-medium text-[15px]"
              >
                취소
              </button>
              <span className="font-bold text-stone-900 text-[15px]">
                {selectedIds.size > 0 ? `${selectedIds.size}개 선택` : '항목 선택'}
              </span>
              <button
                onClick={selectAll}
                className="text-amber-800 font-medium text-[15px]"
              >
                전체선택
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-stone-900">어느멋진날카페AN</h1>
              <div className="flex items-center gap-3">
                {!loading && (
                  <span className="text-stone-400 text-sm">
                    {isFiltered ? `${filtered.length}개 결과` : `총 ${recipes.length}개`}
                  </span>
                )}
                {!loading && recipes.length > 0 && (
                  <button
                    onClick={() => setSelectionMode(true)}
                    className="text-stone-400 text-sm font-medium p-1"
                  >
                    선택
                  </button>
                )}
                <button
                  onClick={() => onNavigate('notes')}
                  className="text-stone-400 text-xl leading-none p-1"
                  aria-label="매장 메모"
                >
                  🗒️
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="text-stone-400 text-xl leading-none p-1"
                  aria-label="설정"
                >
                  ⚙︎
                </button>
              </div>
            </>
          )}
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

        {/* 카테고리 탭 — 다시 누르면 해제 */}
        {!loading && tabs.length > 0 && (
          <div
            className="flex gap-2 mt-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id) { setTab('all'); setTemp('all') }
                  else { setTab(tab.id); setTemp('all') }
                }}
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

        {/* 온도 필터 — 전체 없음, 다시 누르면 해제, 디저트 제외 */}
        {!loading && tempChips.length > 1 && activeTab !== '디저트' && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {tempChips.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemp(activeTemp === t.value ? 'all' : t.value)}
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {loading ? (
              <CenteredMsg>불러오는 중...</CenteredMsg>
            ) : recipes.length === 0 ? (
              <EmptyAll />
            ) : filtered.length === 0 ? (
              <EmptySearch query={query} tab={activeTab} onReset={() => updateFilter({ query: '', activeTab: 'all', activeTemp: 'all' })} />
            ) : isFiltered ? (
              <CardList
                recipes={[...favorites, ...rest]}
                onNavigate={onNavigate}
                onToggleFavorite={toggleFavorite}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ) : (
              <>
                {favorites.length > 0 && (
                  <section className="mb-5">
                    <SectionLabel>즐겨찾기</SectionLabel>
                    <CardList
                      recipes={favorites}
                      onNavigate={onNavigate}
                      onToggleFavorite={toggleFavorite}
                      selectionMode={selectionMode}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
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
                      selectionMode={selectionMode}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                    />
                  </section>
                )}
              </>
            )}
          </SortableContext>
        </DndContext>
      </main>

      {/* FAB */}
      {!selectionMode && (
        <button
          onClick={() => onNavigate('form', null)}
          className="fixed bottom-8 right-5 w-14 h-14 bg-amber-800 text-white rounded-full text-3xl shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="레시피 추가"
        >
          +
        </button>
      )}

      {/* 선택 모드 하단 삭제 바 */}
      {selectionMode && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 pt-4 shadow-lg"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => selectedIds.size > 0 && setShowDeleteConfirm(true)}
            disabled={selectedIds.size === 0}
            className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-bold text-[15px] disabled:opacity-30 active:scale-[0.98] transition-all"
          >
            {selectedIds.size > 0 ? `${selectedIds.size}개 삭제` : '항목을 선택하세요'}
          </button>
        </div>
      )}

      {/* 삭제 확인 바텀시트 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-6 pt-6"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
            <p className="text-center font-bold text-stone-900 text-lg mb-2">레시피 삭제</p>
            <p className="text-center text-sm text-stone-500 mb-6">
              선택한 <span className="font-semibold text-red-500">{selectedIds.size}개</span>의 레시피를 삭제합니다.<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-xl font-semibold disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleBulkDelete}
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

/* ── 서브 컴포넌트 ── */

function CardList({ recipes, onNavigate, onToggleFavorite, selectionMode, selectedIds, onToggleSelect }) {
  return (
    <div className="space-y-3">
      {recipes.map((r) => (
        <SortableCard
          key={r.id}
          recipe={r}
          onPress={() => selectionMode ? onToggleSelect(r.id) : onNavigate('detail', r.id)}
          onToggleFavorite={() => onToggleFavorite(r.id, r.isFavorite)}
          selectionMode={selectionMode}
          selected={selectedIds?.has(r.id) ?? false}
        />
      ))}
    </div>
  )
}

function SortableCard({ recipe, onPress, onToggleFavorite, selectionMode, selected }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: recipe.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <RecipeCard
        recipe={recipe}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
        selectionMode={selectionMode}
        selected={selected}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
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
