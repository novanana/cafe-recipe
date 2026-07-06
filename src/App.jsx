import './index.css'
import { useState } from 'react'
import { useRecipes } from './hooks/useRecipes'
import { useNotes } from './hooks/useNotes'
import RecipeListScreen from './screens/RecipeListScreen'
import RecipeDetailScreen from './screens/RecipeDetailScreen'
import RecipeFormScreen from './screens/RecipeFormScreen'
import SettingsScreen from './screens/SettingsScreen'
import NotesListScreen from './screens/NotesListScreen'
import NoteFormScreen from './screens/NoteFormScreen'
import UpdateBanner from './components/UpdateBanner'

export default function App() {
  const recipesHook = useRecipes()
  const notesHook = useNotes()
  const [nav, setNav] = useState({ screen: 'list', id: null, extra: null })
  const [listFilter, setListFilter] = useState({ query: '', activeTab: 'all', activeTemp: 'all' })

  const navigate = (screen, id = null, extra = null) => setNav({ screen, id, extra })

  let screen
  if (nav.screen === 'detail') {
    screen = <RecipeDetailScreen {...recipesHook} recipeId={nav.id} onNavigate={navigate} />
  } else if (nav.screen === 'form') {
    screen = (
      <RecipeFormScreen
        {...recipesHook}
        recipeId={nav.id}
        copyFromId={nav.extra}
        onNavigate={navigate}
      />
    )
  } else if (nav.screen === 'settings') {
    screen = <SettingsScreen {...recipesHook} onNavigate={navigate} />
  } else if (nav.screen === 'notes') {
    screen = <NotesListScreen {...notesHook} onNavigate={navigate} />
  } else if (nav.screen === 'noteForm') {
    screen = <NoteFormScreen {...notesHook} noteId={nav.id} onNavigate={navigate} />
  } else {
    screen = (
      <RecipeListScreen
        {...recipesHook}
        onNavigate={navigate}
        initialFilter={listFilter}
        onFilterChange={setListFilter}
      />
    )
  }

  return (
    <>
      {screen}
      <UpdateBanner />
    </>
  )
}
