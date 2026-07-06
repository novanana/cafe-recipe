import { useState } from 'react'

export default function NoteFormScreen({ notes, addNote, updateNote, deleteNote, noteId, onNavigate }) {
  const isEdit = noteId != null
  const existing = isEdit ? notes.find((n) => n.id === noteId) : null

  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [titleError, setTitleError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요')
      return
    }
    setSaving(true)
    const data = { title: title.trim(), content }
    if (isEdit) {
      await updateNote(noteId, data)
    } else {
      await addNote(data)
    }
    onNavigate('notes')
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteNote(noteId)
    onNavigate('notes')
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-16">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-sm px-5 pt-12 pb-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('notes')}
          className="text-stone-500 font-medium text-[15px] w-12"
        >
          취소
        </button>
        <span className="font-bold text-stone-900 text-[15px]">
          {isEdit ? '메모 수정' : '메모 추가'}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-amber-800 font-bold text-[15px] w-12 text-right disabled:opacity-40"
        >
          {saving ? '...' : '저장'}
        </button>
      </div>

      <div className="px-4 mt-2 space-y-7">
        {/* ── 제목 ── */}
        <Field label="제목 *" error={titleError}>
          <input
            value={title}
            onChange={(e) => { setTitleError(''); setTitle(e.target.value) }}
            placeholder="예: 포스기 사용법"
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-300 text-[15px] outline-none focus:border-amber-400 transition-colors"
          />
        </Field>

        {/* ── 내용 ── */}
        <Field label="내용">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'예:\n1. 포스기 전원은 카운터 아래 스위치\n2. 재료 발주는 매주 화요일\n3. 마감 시 시재 확인 후 금고 보관'}
            rows={14}
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-300 text-sm leading-relaxed outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </Field>

        {/* ── 삭제 ── */}
        {isEdit && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3.5 text-red-400 font-medium text-sm"
          >
            메모 삭제
          </button>
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
            <p className="text-center font-bold text-stone-900 text-lg mb-1">메모 삭제</p>
            <p className="text-center text-stone-500 text-sm mb-7 leading-relaxed">
              <span className="font-medium text-stone-700">"{title}"</span>을 삭제할까요?<br />
              삭제한 메모는 되돌릴 수 없습니다.
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

function Field({ label, error, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {error && <p className="text-red-400 text-xs mb-1.5">{error}</p>}
      {children}
    </div>
  )
}
