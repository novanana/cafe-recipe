export default function NotesListScreen({ notes, loading, onNavigate }) {
  return (
    <div className="min-h-screen bg-[#faf9f7] pb-28">
      {/* 헤더 */}
      <header className="px-5 pt-14 pb-3 sticky top-0 bg-[#faf9f7] z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('list')}
            className="text-amber-800 font-medium text-[15px]"
          >
            ‹ 레시피
          </button>
          <h1 className="text-xl font-bold text-stone-900">매장 메모</h1>
          <span className="w-12" />
        </div>
        <p className="text-stone-400 text-xs text-center mt-1">
          포스기 사용법·재료 관리 등 인수인계 메모
        </p>
      </header>

      {/* 본문 */}
      <main className="px-4 mt-2">
        {loading ? (
          <CenteredMsg>불러오는 중...</CenteredMsg>
        ) : notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onPress={() => onNavigate('noteForm', note.id)} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => onNavigate('noteForm', null)}
        className="fixed bottom-8 right-5 w-14 h-14 bg-amber-800 text-white rounded-full text-3xl shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        aria-label="메모 추가"
      >
        +
      </button>
    </div>
  )
}

function NoteCard({ note, onPress }) {
  const { title, content, updatedAt } = note
  return (
    <button
      onClick={onPress}
      className="w-full bg-white rounded-2xl px-5 py-4 text-left shadow-sm border border-stone-100 active:scale-[0.98] transition-all"
    >
      <p className="font-semibold text-stone-900 text-[15px] truncate">
        {title || '제목 없음'}
      </p>
      {content && (
        <p className="text-stone-400 text-sm mt-1.5 line-clamp-2 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}
      <p className="text-stone-300 text-xs mt-2">
        {new Date(updatedAt).toLocaleDateString('ko-KR')} 수정
      </p>
    </button>
  )
}

function CenteredMsg({ children }) {
  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-stone-300 text-sm">{children}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 mt-4">
      <span className="text-7xl">🗒️</span>
      <p className="text-stone-400 text-center text-sm leading-relaxed">
        저장된 메모가 없습니다<br />
        아래 <strong>+</strong> 버튼으로 추가해보세요
      </p>
    </div>
  )
}
