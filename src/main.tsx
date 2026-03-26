import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useSpellStore } from '@/store/spellStore'
import spellsData from '@/assets/data/spells.json'
import type { Spell } from '@/store/spellStore'
import '@/index.css'

// Load spell data into store
useSpellStore.getState().setSpells(spellsData as unknown as Spell[])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
