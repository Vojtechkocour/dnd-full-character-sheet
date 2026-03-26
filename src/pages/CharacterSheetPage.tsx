import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useCharacterStore } from '@/store/characterStore'
import { calculateStats } from '@/utils/calculations'
import SheetHeader from '@/components/sheet/SheetHeader'
import TabOverview from '@/components/sheet/TabOverview'
import TabSkills from '@/components/sheet/TabSkills'
import TabFeatures from '@/components/sheet/TabFeatures'
import TabEquipment from '@/components/sheet/TabEquipment'
import TabNotes from '@/components/sheet/TabNotes'
import TabSpells from '@/components/sheet/TabSpells'
import { useState } from 'react'

// Mobile tabs include Overview; on desktop Overview is replaced by the sticky sidebar
type TabId = 'overview' | 'skills' | 'features' | 'equipment' | 'spells' | 'notes'
type DesktopRightTab = 'equipment' | 'features' | 'spells' | 'notes'

const MOBILE_TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills' },
  { id: 'features', label: 'Features' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'spells', label: 'Spells' },
  { id: 'notes', label: 'Notes' },
]

const DESKTOP_RIGHT_TABS: { id: DesktopRightTab; label: string }[] = [
  { id: 'equipment', label: 'Equipment' },
  { id: 'features', label: 'Features' },
  { id: 'spells', label: 'Spells' },
  { id: 'notes', label: 'Notes' },
]

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCharacter } = useCharacterStore()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [desktopRightTab, setDesktopRightTab] = useState<DesktopRightTab>('equipment')
  const [isEditing, setIsEditing] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Character Sheet`,
  })

  const character = id ? getCharacter(id) : undefined

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <div className="text-center">
          <p className="font-serif text-ink-muted text-lg italic">Character not found.</p>
          <button onClick={() => navigate('/')} className="mt-4 font-sans text-sm text-accent-gold hover:underline">
            ← Back to Vault
          </button>
        </div>
      </div>
    )
  }

  const stats = calculateStats(character)


  return (
    <div className="min-h-screen bg-parchment-100">
      {/* Top nav */}
      <div className="no-print sticky top-0 z-10 bg-parchment-200/95 backdrop-blur-sm border-b border-parchment-300 px-4 py-2 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/')}
          className="text-ink-muted hover:text-ink text-sm font-sans transition-colors flex items-center gap-1"
        >
          ← Vault
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing((v) => !v)}
            className={`px-3 py-1.5 text-xs font-sans transition-colors rounded-sm ${
              isEditing
                ? 'bg-accent-gold text-parchment-50 hover:opacity-90'
                : 'paper-card text-ink-muted hover:text-ink hover:bg-parchment-200'
            }`}
          >
            {isEditing ? '✓ Done' : '✏ Edit'}
          </button>
          <button
            onClick={() => handlePrint()}
            className="px-3 py-1.5 text-xs paper-card hover:bg-parchment-200 font-sans text-ink-muted hover:text-ink transition-colors"
          >
            🖨 Print / PDF
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="mx-auto px-4 py-6 max-w-2xl lg:max-w-6xl">
        <SheetHeader character={character} stats={stats} isEditing={isEditing} />

        {/* ── DESKTOP LAYOUT: skills left + tabs right ── */}
        <div className="hidden lg:flex lg:gap-5 lg:items-start no-print">
          {/* Left — Skills (narrow) */}
          <div className="w-72 xl:w-80 shrink-0">
            <TabSkills character={character} stats={stats} />
          </div>

          {/* Right — Equipment / Features / Notes */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 mb-4 border-b border-parchment-300">
              {DESKTOP_RIGHT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDesktopRightTab(tab.id)}
                  className={`
                    px-4 py-2 font-serif text-sm whitespace-nowrap transition-colors border-b-2 -mb-px
                    ${desktopRightTab === tab.id
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div>
              {desktopRightTab === 'equipment' && <TabEquipment character={character} />}
              {desktopRightTab === 'features' && <TabFeatures character={character} />}
              {desktopRightTab === 'spells' && <TabSpells character={character} />}
              {desktopRightTab === 'notes' && <TabNotes character={character} />}
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT: tabs ── */}
        <div className="lg:hidden no-print">
          <div className="flex gap-1 mb-4 border-b border-parchment-300 overflow-x-auto">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 font-serif text-sm whitespace-nowrap transition-colors border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div>
            {activeTab === 'overview' && <TabOverview character={character} stats={stats} />}
            {activeTab === 'skills' && <TabSkills character={character} stats={stats} />}
            {activeTab === 'features' && <TabFeatures character={character} />}
            {activeTab === 'equipment' && <TabEquipment character={character} />}
            {activeTab === 'spells' && <TabSpells character={character} />}
            {activeTab === 'notes' && <TabNotes character={character} />}
          </div>
        </div>

        {/* Print layout — all content visible */}
        <div className="hidden print:block space-y-6">
          <TabOverview character={character} stats={stats} />
          <TabSkills character={character} stats={stats} />
          <TabFeatures character={character} />
          <TabEquipment character={character} />
          <TabNotes character={character} />
        </div>
      </div>
    </div>
  )
}
