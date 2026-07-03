import './index.css'
import { useState } from 'react'
import { useRecipes } from './hooks/useRecipes'
import RecipeListScreen from './screens/RecipeListScreen'
import RecipeDetailScreen from './screens/RecipeDetailScreen'
import RecipeFormScreen from './screens/RecipeFormScreen'
import SettingsScreen from './screens/SettingsScreen'
import UpdateBanner from './components/UpdateBanner'

export default function App() {
  const recipesHook = useRecipes()
  const [nav, setNav] = useState({ screen: 'list', recipeId: null })

  const navigate = (screen, recipeId = null) => setNav({ screen, recipeId })

  let screen
  if (nav.screen === 'detail') {
    screen = <RecipeDetailScreen {...recipesHook} recipeId={nav.recipeId} onNavigate={navigate} />
  } else if (nav.screen === 'form') {
    screen = <RecipeFormScreen {...recipesHook} recipeId={nav.recipeId} onNavigate={navigate} />
  } else if (nav.screen === 'settings') {
    screen = <SettingsScreen {...recipesHook} onNavigate={navigate} />
  } else {
    screen = <RecipeListScreen {...recipesHook} onNavigate={navigate} />
  }

  return (
    <>
      {screen}
      <UpdateBanner />
    </>
  )
}
