import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CharacterCreatorPage from '@/pages/CharacterCreatorPage'
import CharacterSheetPage from '@/pages/CharacterSheetPage'
import SpellLibrary from '@/pages/SpellLibrary'
import SpellDetail from '@/pages/SpellDetail'
import OriginSpellLibrary from '@/pages/OriginSpellLibrary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/new',
    element: <CharacterCreatorPage />,
  },
  {
    path: '/character/:id',
    element: <CharacterSheetPage />,
  },
  {
    path: '/library/:characterId',
    element: <SpellLibrary />,
  },
  {
    path: '/origin-spells/:characterId',
    element: <OriginSpellLibrary />,
  },
  {
    path: '/spells/:id',
    element: <SpellDetail />,
  },
])
