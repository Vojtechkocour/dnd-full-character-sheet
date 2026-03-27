import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import type { Character, Weapon, EquipmentItem, WeaponMastery } from '@/types'
import { formatModifier } from '@/utils/calculations'
import { TOOL_DESCRIPTIONS } from '@/data/tools'

const MASTERY_OPTIONS: WeaponMastery[] = ['cleave', 'graze', 'nick', 'push', 'sap', 'slow', 'topple', 'vex']

const DAMAGE_TYPE_SHORT: Record<string, string> = {
  slashing: 'Slsh', piercing: 'Prc', bludgeoning: 'Bldg',
  fire: 'Fire', cold: 'Cold', lightning: 'Ltng', thunder: 'Thdr',
  poison: 'Psn', acid: 'Acid', necrotic: 'Necr', radiant: 'Rad',
  psychic: 'Psy', force: 'Frc', healing: 'Heal',
}

// Shared column widths — header and rows use the same classes
const COL = {
  name:   'flex-1 min-w-0 text-left',
  attack: 'w-12 sm:w-20 text-left shrink-0',
  damage: 'w-24 sm:w-36 text-left shrink-0',
  mastery:'w-16 sm:w-24 shrink-0 text-right',
}

const ITEM_COL = {
  name:     'flex-1 min-w-0 text-left',
  notes:    'w-28 sm:w-48 shrink-0 text-center',
  quantity: 'w-12 sm:w-20 text-right shrink-0',
}

interface Props {
  character: Character
}

export default function TabEquipment({ character }: Props) {
  const { updateCharacter } = useCharacterStore()

  const [showWeaponForm, setShowWeaponForm] = useState(false)
  const [newWeapon, setNewWeapon] = useState<Partial<Weapon>>({ name: '', damageDice: '1d6', damageBonus: 0, attackBonus: 0, damageType: '', properties: [] })

  const [showItemForm, setShowItemForm] = useState(false)
  const [newItem, setNewItem] = useState<Partial<EquipmentItem>>({ name: '', quantity: 1 })

  const [editingWeaponId, setEditingWeaponId] = useState<string | null>(null)
  const [editWeapon, setEditWeapon] = useState<Partial<Weapon>>({})

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Partial<EquipmentItem>>({})

  const [newToolName, setNewToolName] = useState('')
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null)
  const [editToolName, setEditToolName] = useState('')
  const [editToolNote, setEditToolNote] = useState('')

  function addWeapon() {
    if (!newWeapon.name) return
    const weapon: Weapon = {
      id: uuidv4(),
      name: newWeapon.name,
      attackBonus: newWeapon.attackBonus ?? 0,
      damageDice: newWeapon.damageDice ?? '1d6',
      damageBonus: newWeapon.damageBonus ?? 0,
      damageType: newWeapon.damageType ?? '',
      properties: newWeapon.properties ?? [],
      mastery: newWeapon.mastery,
      notes: newWeapon.notes,
    }
    updateCharacter(character.id, { weapons: [...character.weapons, weapon] })
    setNewWeapon({ name: '', damageDice: '1d6', damageBonus: 0, attackBonus: 0, damageType: '', properties: [] })
    setShowWeaponForm(false)
  }

  function saveWeapon(id: string) {
    updateCharacter(character.id, { weapons: character.weapons.map(w => w.id === id ? { ...w, ...editWeapon } : w) })
    setEditingWeaponId(null)
  }

  function startEditWeapon(w: Weapon) {
    setEditingWeaponId(w.id)
    setEditWeapon({ ...w })
    setShowWeaponForm(false)
  }

  function removeWeapon(id: string) {
    updateCharacter(character.id, { weapons: character.weapons.filter(w => w.id !== id) })
    setEditingWeaponId(null)
  }

  function addItem() {
    if (!newItem.name) return
    const item: EquipmentItem = {
      id: uuidv4(),
      name: newItem.name,
      quantity: newItem.quantity ?? 1,
      weight: newItem.weight,
      notes: newItem.notes,
    }
    updateCharacter(character.id, { equipment: [...character.equipment, item] })
    setNewItem({ name: '', quantity: 1 })
    setShowItemForm(false)
  }

  function saveItem(id: string) {
    updateCharacter(character.id, { equipment: character.equipment.map(i => i.id === id ? { ...i, ...editItem } : i) })
    setEditingItemId(null)
  }

  function startEditItem(item: EquipmentItem) {
    setEditingItemId(item.id)
    setEditItem({ ...item })
    setShowItemForm(false)
  }

  function removeItem(id: string) {
    updateCharacter(character.id, { equipment: character.equipment.filter(i => i.id !== id) })
    setEditingItemId(null)
  }

  function updateCurrency(field: keyof typeof character.currency, value: number) {
    updateCharacter(character.id, { currency: { ...character.currency, [field]: value } })
  }

  function addTool() {
    const name = newToolName.trim()
    if (!name) return
    updateCharacter(character.id, { toolProficiencies: [...character.toolProficiencies, name] })
    setNewToolName('')
  }

  function removeTool(index: number) {
    const name = character.toolProficiencies[index]
    const notes = { ...(character.toolNotes ?? {}) }
    delete notes[name]
    updateCharacter(character.id, {
      toolProficiencies: character.toolProficiencies.filter((_, i) => i !== index),
      toolNotes: notes,
    })
    setEditingToolIndex(null)
  }

  function startEditTool(index: number) {
    const name = character.toolProficiencies[index]
    setEditingToolIndex(index)
    setEditToolName(name)
    setEditToolNote(character.toolNotes?.[name] ?? '')
  }

  function saveEditTool(index: number) {
    const oldName = character.toolProficiencies[index]
    const newName = editToolName.trim()
    if (!newName) return
    const updated = [...character.toolProficiencies]
    updated[index] = newName

    // Migrate note to new name key if name changed
    const notes = { ...(character.toolNotes ?? {}) }
    if (oldName !== newName) delete notes[oldName]
    const note = editToolNote.trim()
    if (note) notes[newName] = note
    else delete notes[newName]

    updateCharacter(character.id, { toolProficiencies: updated, toolNotes: notes })
    setEditingToolIndex(null)
  }

  return (
    <div className="space-y-4">

      {/* ── Weapons & Attacks ── */}
      <div className="paper-card p-4">
        <div className="section-header">Weapons & Attacks</div>

        {character.weapons.length > 0 && (
          <div className="mb-3">
            {/* Header row */}
            <div className="flex items-center gap-1 sm:gap-4 px-3 py-1.5 bg-parchment-200/60 rounded-sm mb-1">
              <span className={`${COL.name} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Name</span>
              <span className={`${COL.attack} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Atk</span>
              <span className={`${COL.damage} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Damage</span>
              <span className={`${COL.mastery} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Mastery</span>
              <span className="hidden sm:block w-14 shrink-0" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-parchment-200">
              {character.weapons.map((w) =>
                editingWeaponId === w.id ? (
                  <div key={w.id} className="py-3 space-y-3">
                    <input
                      placeholder="Weapon name *"
                      value={editWeapon.name ?? ''}
                      onChange={(e) => setEditWeapon(v => ({ ...v, name: e.target.value }))}
                      className="field-box w-full font-serif font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Attack Bonus</label>
                        <input type="number" value={editWeapon.attackBonus ?? 0} onChange={(e) => setEditWeapon(v => ({ ...v, attackBonus: Number(e.target.value) }))} className="field-box w-full text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Damage Dice</label>
                        <input placeholder="1d8" value={editWeapon.damageDice ?? ''} onChange={(e) => setEditWeapon(v => ({ ...v, damageDice: e.target.value }))} className="field-box w-full text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Damage Bonus</label>
                        <input type="number" value={editWeapon.damageBonus ?? 0} onChange={(e) => setEditWeapon(v => ({ ...v, damageBonus: Number(e.target.value) }))} className="field-box w-full text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Damage Type</label>
                        <input placeholder="slashing..." value={editWeapon.damageType ?? ''} onChange={(e) => setEditWeapon(v => ({ ...v, damageType: e.target.value }))} className="field-box w-full" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-ink-muted font-sans block mb-1">Weapon Mastery</label>
                        <select value={editWeapon.mastery ?? ''} onChange={(e) => setEditWeapon(v => ({ ...v, mastery: e.target.value as WeaponMastery || undefined }))} className="field-box w-full">
                          <option value="">—</option>
                          {MASTERY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-ink-muted font-sans block mb-1">Notes</label>
                        <input placeholder="..." value={editWeapon.notes ?? ''} onChange={(e) => setEditWeapon(v => ({ ...v, notes: e.target.value }))} className="field-box w-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveWeapon(w.id)} className="px-4 py-1.5 bg-ink text-parchment-50 font-sans text-sm rounded-sm">Save</button>
                      <button onClick={() => setEditingWeaponId(null)} className="px-4 py-1.5 paper-card font-sans text-sm hover:bg-parchment-200">Cancel</button>
                      <button onClick={() => removeWeapon(w.id)} className="ml-auto px-3 py-1.5 font-sans text-sm text-accent-red hover:underline">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={w.id}
                    className="flex items-center gap-1 sm:gap-4 px-3 py-2.5 hover:bg-parchment-100 cursor-pointer group transition-colors"
                    onClick={() => startEditWeapon(w)}
                  >
                    <span className={`${COL.name} font-serif font-semibold text-ink truncate text-sm sm:text-base`}>{w.name}</span>
                    <span className={`${COL.attack} font-display text-sm sm:text-base text-ink`}>{formatModifier(w.attackBonus)}</span>
                    <span className={`${COL.damage} font-display text-sm sm:text-base text-ink`}>
                      {w.damageDice}{w.damageBonus !== 0 && formatModifier(w.damageBonus)}
                      {w.damageType && <span className="font-sans text-[10px] sm:text-xs text-ink-muted ml-1">{DAMAGE_TYPE_SHORT[w.damageType.toLowerCase()] ?? w.damageType}</span>}
                    </span>
                    <span className={`${COL.mastery} font-sans text-xs sm:text-sm text-ink capitalize`}>{w.mastery ?? '—'}</span>
                    <span className="hidden sm:block w-14 shrink-0 text-xs text-ink-muted text-right opacity-0 group-hover:opacity-50 transition-opacity">✏ edit</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {showWeaponForm ? (
          <div className="space-y-3 border border-parchment-400 rounded-xl p-4 bg-parchment-100/40">
            <input placeholder="Weapon name *" value={newWeapon.name ?? ''} onChange={(e) => setNewWeapon(w => ({ ...w, name: e.target.value }))} className="field-box w-full font-serif font-semibold" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs text-ink-muted font-sans block mb-1">Attack Bonus</label>
                <input type="number" value={newWeapon.attackBonus ?? 0} onChange={(e) => setNewWeapon(w => ({ ...w, attackBonus: Number(e.target.value) }))} className="field-box w-full text-center" />
              </div>
              <div>
                <label className="text-xs text-ink-muted font-sans block mb-1">Damage Dice</label>
                <input placeholder="1d8" value={newWeapon.damageDice ?? ''} onChange={(e) => setNewWeapon(w => ({ ...w, damageDice: e.target.value }))} className="field-box w-full text-center" />
              </div>
              <div>
                <label className="text-xs text-ink-muted font-sans block mb-1">Damage Bonus</label>
                <input type="number" value={newWeapon.damageBonus ?? 0} onChange={(e) => setNewWeapon(w => ({ ...w, damageBonus: Number(e.target.value) }))} className="field-box w-full text-center" />
              </div>
              <div>
                <label className="text-xs text-ink-muted font-sans block mb-1">Damage Type</label>
                <input placeholder="slashing..." value={newWeapon.damageType ?? ''} onChange={(e) => setNewWeapon(w => ({ ...w, damageType: e.target.value }))} className="field-box w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-ink-muted font-sans block mb-1">Weapon Mastery</label>
                <select value={newWeapon.mastery ?? ''} onChange={(e) => setNewWeapon(w => ({ ...w, mastery: e.target.value as WeaponMastery || undefined }))} className="field-box w-full">
                  <option value="">—</option>
                  {MASTERY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addWeapon} disabled={!newWeapon.name} className="px-4 py-2 bg-ink text-parchment-50 font-sans text-sm rounded-sm disabled:opacity-40">Add Weapon</button>
              <button onClick={() => setShowWeaponForm(false)} className="px-4 py-2 paper-card font-sans text-sm hover:bg-parchment-200">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setShowWeaponForm(true); setEditingWeaponId(null) }} className="w-full border border-dashed border-parchment-400 rounded-sm p-2.5 text-center font-sans text-ink-muted hover:text-ink hover:border-ink/30 transition-colors text-sm">
            + Add Weapon
          </button>
        )}
      </div>

      {/* ── Equipment ── */}
      <div className="paper-card p-4">
        <div className="section-header">Equipment</div>

        {character.equipment.length > 0 && (
          <div className="mb-3">
            {/* Header row */}
            <div className="flex items-center gap-1 sm:gap-4 px-3 py-1.5 bg-parchment-200/60 rounded-sm mb-1">
              <span className={`${ITEM_COL.name} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Name</span>
              <span className={`${ITEM_COL.notes} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Notes</span>
              <span className={`${ITEM_COL.quantity} text-[9px] sm:text-xs font-sans font-semibold text-ink-muted uppercase tracking-wide sm:tracking-widest`}>Qty</span>
              <span className="hidden sm:block w-14 shrink-0" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-parchment-200">
              {character.equipment.map((item) =>
                editingItemId === item.id ? (
                  <div key={item.id} className="py-3 space-y-3">
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Name</label>
                        <input placeholder="Item name *" value={editItem.name ?? ''} onChange={(e) => setEditItem(v => ({ ...v, name: e.target.value }))} className="field-box w-full font-serif font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs text-ink-muted font-sans block mb-1">Quantity</label>
                        <input type="number" min={1} value={editItem.quantity ?? 1} onChange={(e) => setEditItem(v => ({ ...v, quantity: Number(e.target.value) }))} className="field-box w-20 text-center" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted font-sans block mb-1">Notes</label>
                      <input placeholder="..." value={editItem.notes ?? ''} onChange={(e) => setEditItem(v => ({ ...v, notes: e.target.value }))} className="field-box w-full" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveItem(item.id)} className="px-4 py-1.5 bg-ink text-parchment-50 font-sans text-sm rounded-sm">Save</button>
                      <button onClick={() => setEditingItemId(null)} className="px-4 py-1.5 paper-card font-sans text-sm hover:bg-parchment-200">Cancel</button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto px-3 py-1.5 font-sans text-sm text-accent-red hover:underline">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="flex items-center gap-1 sm:gap-4 px-3 py-2.5 hover:bg-parchment-100 cursor-pointer group transition-colors"
                    onClick={() => startEditItem(item)}
                  >
                    <span className={`${ITEM_COL.name} font-serif text-ink truncate text-sm sm:text-base`}>{item.name}</span>
                    <span className={`${ITEM_COL.notes} text-xs sm:text-sm text-ink-muted font-sans`}>{item.notes ?? '—'}</span>
                    <span className={`${ITEM_COL.quantity} font-display text-sm sm:text-base text-ink`}>×{item.quantity}</span>
                    <span className="hidden sm:block w-14 shrink-0 text-xs text-ink-muted text-right opacity-0 group-hover:opacity-50 transition-opacity">✏ edit</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {showItemForm ? (
          <div className="border border-parchment-400 rounded-xl p-3 bg-parchment-100/40 space-y-2">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input placeholder="Item name *" value={newItem.name ?? ''} onChange={(e) => setNewItem(i => ({ ...i, name: e.target.value }))} className="field-box font-serif" />
              <input type="number" min={1} value={newItem.quantity ?? 1} onChange={(e) => setNewItem(i => ({ ...i, quantity: Number(e.target.value) }))} className="field-box w-20 text-center" />
            </div>
            <div className="flex gap-2">
              <button onClick={addItem} disabled={!newItem.name} className="px-4 py-1.5 bg-ink text-parchment-50 font-sans text-sm rounded-sm disabled:opacity-40">Add</button>
              <button onClick={() => setShowItemForm(false)} className="px-4 py-1.5 paper-card font-sans text-sm hover:bg-parchment-200">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setShowItemForm(true); setEditingItemId(null) }} className="w-full border border-dashed border-parchment-400 rounded-sm p-2.5 text-center font-sans text-ink-muted hover:text-ink hover:border-ink/30 transition-colors text-sm">
            + Add Item
          </button>
        )}
      </div>

      {/* ── Currency ── */}
      <div className="paper-card p-4">
        <div className="section-header">Currency</div>
        <div className="grid grid-cols-5 gap-3">
          {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((coin) => (
            <div key={coin} className="text-center">
              <div className="text-xs text-ink-muted font-sans mb-1 uppercase tracking-widest">{coin}</div>
              <input
                type="number"
                min={0}
                value={character.currency[coin]}
                onChange={(e) => updateCurrency(coin, Number(e.target.value))}
                className="field-box w-full text-center font-display text-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Tool Proficiencies ── */}
      <div className="paper-card p-4">
        <div className="section-header">Tool Proficiencies</div>

        {character.toolProficiencies.length === 0 ? (
          <p className="text-sm text-ink-muted font-serif italic mb-3">No tool proficiencies yet.</p>
        ) : (
          <div className="divide-y divide-parchment-200 mb-3">
            {character.toolProficiencies.map((tool, index) => {
              const desc = TOOL_DESCRIPTIONS[editingToolIndex === index ? editToolName.trim() : tool]
              const customNote = character.toolNotes?.[tool] ?? ''
              if (editingToolIndex === index) {
                return (
                  <div key={index} className="py-3 space-y-2">
                    <div>
                      <label className="text-xs text-ink-muted font-sans block mb-1">Tool name</label>
                      <input
                        autoFocus
                        value={editToolName}
                        onChange={(e) => setEditToolName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingToolIndex(null) }}
                        className="field-box w-full font-serif font-semibold text-sm"
                      />
                    </div>
                    {desc && (
                      <p className="text-xs text-ink-muted font-sans leading-relaxed italic">{desc}</p>
                    )}
                    <div>
                      <label className="text-xs text-ink-muted font-sans block mb-1">Custom note</label>
                      <textarea
                        value={editToolNote}
                        onChange={(e) => setEditToolNote(e.target.value)}
                        placeholder="Your own notes about how you use this tool..."
                        rows={2}
                        className="field-box w-full text-sm font-sans resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEditTool(index)} className="px-4 py-1 bg-ink text-parchment-50 font-sans text-sm rounded-sm">Save</button>
                      <button onClick={() => setEditingToolIndex(null)} className="px-4 py-1 paper-card font-sans text-sm hover:bg-parchment-200">Cancel</button>
                      <button onClick={() => removeTool(index)} className="ml-auto px-3 py-1 font-sans text-sm text-accent-red hover:underline">Delete</button>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={index}
                  className="py-3 flex items-start gap-3 cursor-pointer hover:bg-parchment-100 rounded-sm px-1 -mx-1 group transition-colors"
                  onClick={() => startEditTool(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-serif font-semibold text-sm text-ink">{tool}</div>
                    {desc && (
                      <p className="text-xs text-ink-muted font-sans mt-0.5 leading-relaxed">{desc}</p>
                    )}
                    {customNote && (
                      <p className="text-xs text-ink font-sans mt-1 leading-relaxed border-l-2 border-accent-gold pl-2">{customNote}</p>
                    )}
                  </div>
                  <span className="text-xs text-ink-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-50 transition-opacity">✏ edit</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newToolName}
            onChange={(e) => setNewToolName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTool() }}
            placeholder="Add custom tool..."
            className="field-box flex-1 text-sm"
          />
          <button
            onClick={addTool}
            disabled={!newToolName.trim()}
            className="px-4 py-1.5 bg-ink text-parchment-50 font-sans text-sm rounded-sm disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
