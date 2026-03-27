import { useState, useEffect } from 'react'
import type { Character, StartingItemRef, Weapon, EquipmentItem, Currency } from '@/types'
import type { WeaponDef } from '@/types'
import { CLASSES_DATA } from '@/data/classes'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'
import { WEAPONS_DATA, getWeaponDef } from '@/data/weapons'
import { ARMOR_DATA, getArmorDef } from '@/data/armor'
import { GEAR_DATA, getGearDef } from '@/data/gear'
import { getProficiencyBonus, getTotalLevel } from '@/utils/calculations'

interface Props {
  character: Character
  onChange: (patch: Partial<Character>) => void
}

type CatalogTab = 'weapons' | 'armor' | 'gear'

// key: `pkg-${pkgIdx}-item-${itemIdx}`, value: chosen weapon name
type WeaponChoices = Record<string, string>

let _uid = 0
function uid() { return `eq-${++_uid}` }

function abilityMod(score: number) { return Math.floor((score - 10) / 2) }

function isProficient(def: WeaponDef, proficiencies: string[]): boolean {
  const isSimple = def.category === 'simple-melee' || def.category === 'simple-ranged'
  const isMartial = def.category === 'martial-melee' || def.category === 'martial-ranged'
  const hasFinesse = def.properties.some(p => p.toLowerCase().startsWith('finesse'))
  const hasLight = def.properties.some(p => p.toLowerCase() === 'light')
  for (const prof of proficiencies) {
    if (prof === 'Simple Weapons' && isSimple) return true
    if (prof === 'Martial Weapons' && isMartial) return true
    if (prof.includes('Light and Finesse') && isMartial && hasFinesse && hasLight) return true
    if (prof.includes('Finesse or Light') && isMartial && (hasFinesse || hasLight)) return true
    const named = prof.replace(/s$/, '')
    if (def.name === prof || def.name === named) return true
  }
  return false
}

function getAttackAbilityMod(def: WeaponDef, str: number, dex: number): number {
  const isRanged = def.category === 'simple-ranged' || def.category === 'martial-ranged'
  const hasFinesse = def.properties.some(p => p.toLowerCase().startsWith('finesse'))
  const strMod = abilityMod(str)
  const dexMod = abilityMod(dex)
  if (hasFinesse) return Math.max(strMod, dexMod)
  if (isRanged) return dexMod
  return strMod
}

function weaponsForChoice(choice: NonNullable<StartingItemRef['weaponChoice']>): WeaponDef[] {
  switch (choice) {
    case 'simple':        return WEAPONS_DATA.filter(w => w.category === 'simple-melee' || w.category === 'simple-ranged')
    case 'martial':       return WEAPONS_DATA.filter(w => w.category === 'martial-melee' || w.category === 'martial-ranged')
    case 'simple-melee':  return WEAPONS_DATA.filter(w => w.category === 'simple-melee')
    case 'simple-ranged': return WEAPONS_DATA.filter(w => w.category === 'simple-ranged')
    case 'martial-melee': return WEAPONS_DATA.filter(w => w.category === 'martial-melee')
    case 'martial-ranged':return WEAPONS_DATA.filter(w => w.category === 'martial-ranged')
  }
}

function buildWeapons(refs: StartingItemRef[], choices: WeaponChoices, pkgIdx: number | null, character: Character): Weapon[] {
  const profBonus = getProficiencyBonus(getTotalLevel(character))
  const { strength, dexterity } = character.abilityScores
  const proficiencies = character.weaponProficiencies
  const out: Weapon[] = []

  refs.forEach((ref, itemIdx) => {
    if (ref.type !== 'weapon') return
    // Resolve actual weapon name: use chosen name for weaponChoice items
    const resolvedName = ref.weaponChoice
      ? (choices[`pkg-${pkgIdx}-item-${itemIdx}`] ?? '')
      : ref.name
    if (!resolvedName) return  // choice not made yet — skip
    const def = getWeaponDef(resolvedName)
    if (!def) return
    const mod = getAttackAbilityMod(def, strength, dexterity)
    const proficient = isProficient(def, proficiencies)
    const attackBonus = mod + (proficient ? profBonus : 0)
    const qty = ref.quantity ?? 1
    for (let i = 0; i < qty; i++) {
      out.push({ id: uid(), name: def.name, attackBonus, damageDice: def.damage, damageBonus: mod, damageType: def.damageType, properties: def.properties, mastery: def.mastery })
    }
  })
  return out
}

function buildItems(refs: StartingItemRef[]): EquipmentItem[] {
  return refs
    .filter(r => r.type !== 'weapon')
    .map(ref => {
      const weight = ref.type === 'armor' ? getArmorDef(ref.name)?.weight : getGearDef(ref.name)?.weight
      const armorDef = ref.type === 'armor' ? getArmorDef(ref.name) : undefined
      return { id: uid(), name: ref.name, quantity: ref.quantity ?? 1, weight, notes: armorDef ? `AC: ${armorDef.ac}` : undefined }
    })
}

function addCurrency(base: Currency, extra?: Partial<Currency>): Currency {
  if (!extra) return base
  return { cp: base.cp + (extra.cp ?? 0), sp: base.sp + (extra.sp ?? 0), ep: base.ep + (extra.ep ?? 0), gp: base.gp + (extra.gp ?? 0), pp: base.pp + (extra.pp ?? 0) }
}

export default function Step6Equipment({ character, onChange }: Props) {
  const classData = CLASSES_DATA.find(c => c.id === character.classes[0]?.class)
  const bgData = BACKGROUNDS_DATA.find(b => b.name === character.background?.name)

  const [classChoiceIndex, setClassChoiceIndex] = useState<number | null>(null)
  // Weapon choices keyed by "pkg-{pkgIdx}-item-{itemIdx}"
  const [weaponChoices, setWeaponChoices] = useState<WeaponChoices>({})

  const bgItems = bgData?.startingEquipmentItems ?? []
  const [bgChecked, setBgChecked] = useState<boolean[]>(() => bgItems.map(() => true))

  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogTab, setCatalogTab] = useState<CatalogTab>('weapons')
  const [catalogAdded, setCatalogAdded] = useState<StartingItemRef[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setBgChecked(bgItems.map(() => true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgData?.name])

  // Reset weapon choices when class package selection changes
  useEffect(() => {
    setWeaponChoices({})
  }, [classChoiceIndex, classData?.id])

  // Recompute equipment from scratch on every selection change
  useEffect(() => {
    const allRefs: StartingItemRef[] = []
    let currency: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }

    if (classData) allRefs.push(...classData.startingEquipment.fixed)

    if (classChoiceIndex !== null && classData?.startingEquipment.choose) {
      const pkg = classData.startingEquipment.choose[classChoiceIndex]
      allRefs.push(...pkg.items)
      currency = addCurrency(currency, pkg.currency)
    }

    bgItems.forEach((ref, i) => { if (bgChecked[i]) allRefs.push(ref) })
    currency = addCurrency(currency, bgData?.startingCurrency)
    allRefs.push(...catalogAdded)

    // Class package refs (need choice resolution keyed by pkgIdx)
    const pkgRefs = classChoiceIndex !== null && classData?.startingEquipment.choose
      ? classData.startingEquipment.choose[classChoiceIndex].items
      : []

    // Background + catalog weapon refs (no choices needed — names are literal)
    const extraWeaponRefs: StartingItemRef[] = [
      ...bgItems.filter((ref, i) => ref.type === 'weapon' && bgChecked[i]),
      ...catalogAdded.filter(r => r.type === 'weapon'),
    ]

    onChange({
      weapons: [
        ...buildWeapons(pkgRefs, weaponChoices, classChoiceIndex, character),
        ...buildWeapons(extraWeaponRefs, {}, null, character),
      ],
      equipment: buildItems(allRefs),
      currency,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classChoiceIndex, weaponChoices, bgChecked, catalogAdded, classData?.id, bgData?.name])

  const q = search.toLowerCase()
  const filteredWeapons = WEAPONS_DATA.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q))
  const filteredArmor = ARMOR_DATA.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
  const filteredGear = GEAR_DATA.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))

  function isAdded(type: StartingItemRef['type'], name: string) {
    return catalogAdded.some(r => r.type === type && r.name === name)
  }
  function toggleCatalog(ref: StartingItemRef) {
    setCatalogAdded(prev => prev.some(r => r.type === ref.type && r.name === ref.name) ? prev.filter(r => !(r.type === ref.type && r.name === ref.name)) : [...prev, ref])
  }

  return (
    <div className="space-y-6">

      {/* ── Class Equipment ─────────────────────────────────────────────── */}
      {classData ? (
        <section>
          <h3 className="font-display text-base text-ink mb-3">{classData.name} — Starting Equipment</h3>

          {classData.startingEquipment.fixed.length > 0 && (
            <div className="mb-3 p-3 bg-parchment-200 rounded-xl border border-parchment-400">
              <p className="text-xs text-ink-muted font-sans uppercase tracking-wide mb-2">Always included</p>
              <ul className="space-y-1">
                {classData.startingEquipment.fixed.map((ref, i) => (
                  <li key={i} className="text-sm font-serif text-ink">
                    <span className="text-accent-gold mr-1.5">✓</span>
                    {ref.name}{ref.quantity && ref.quantity > 1 ? ` ×${ref.quantity}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {classData.startingEquipment.choose && classData.startingEquipment.choose.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-ink-muted font-sans uppercase tracking-wide">Choose one option</p>
              {classData.startingEquipment.choose.map((pkg, pkgIdx) => (
                <label
                  key={pkgIdx}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    classChoiceIndex === pkgIdx
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-parchment-400 bg-parchment-50 hover:border-accent-gold/50 hover:bg-parchment-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="classEquipChoice"
                    checked={classChoiceIndex === pkgIdx}
                    onChange={() => setClassChoiceIndex(pkgIdx)}
                    className="mt-0.5 accent-amber-700 shrink-0"
                  />
                  <div className="w-full">
                    <p className="font-serif text-sm text-ink font-semibold">{pkg.label}</p>
                    {pkg.currency && (
                      <p className="text-xs text-green-700 font-sans mt-0.5">
                        +{Object.entries(pkg.currency).filter(([,v]) => v && v > 0).map(([k,v]) => `${v} ${k.toUpperCase()}`).join(', ')}
                      </p>
                    )}
                    {pkg.items.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {pkg.items.map((ref, itemIdx) => {
                          if (ref.weaponChoice && classChoiceIndex === pkgIdx) {
                            const choiceKey = `pkg-${pkgIdx}-item-${itemIdx}`
                            const options = weaponsForChoice(ref.weaponChoice)
                            const chosen = weaponChoices[choiceKey] ?? ''
                            const chosenDef = chosen ? getWeaponDef(chosen) : null
                            return (
                              <li key={itemIdx} className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-ink-muted font-sans">⚔ Choose {ref.name}:</span>
                                  {ref.quantity && ref.quantity > 1 && <span className="text-xs text-ink-muted font-sans">×{ref.quantity}</span>}
                                </div>
                                <select
                                  value={chosen}
                                  onChange={e => setWeaponChoices(prev => ({ ...prev, [choiceKey]: e.target.value }))}
                                  onClick={e => e.stopPropagation()}
                                  className="w-full text-sm font-sans bg-white border border-ink/25 rounded-sm px-2 py-1.5 focus:outline-none focus:border-accent-gold"
                                >
                                  <option value="">— pick a weapon —</option>
                                  {options.map(w => (
                                    <option key={w.name} value={w.name}>
                                      {w.name} ({w.damage} {w.damageType}{w.properties.length ? `, ${w.properties.join(', ')}` : ''})
                                    </option>
                                  ))}
                                </select>
                                {chosenDef && (
                                  <p className="text-xs text-ink-muted font-sans italic line-clamp-2">{chosenDef.description}</p>
                                )}
                              </li>
                            )
                          }
                          return (
                            <li key={itemIdx} className="text-xs text-ink-muted font-sans">
                              • {ref.name}{ref.quantity && ref.quantity > 1 ? ` ×${ref.quantity}` : ''}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="text-sm text-ink-muted font-sans italic">Select a class in Step 2 to see equipment options.</p>
      )}

      {/* ── Background Equipment ────────────────────────────────────────── */}
      {bgData && bgItems.length > 0 && (
        <section>
          <h3 className="font-display text-base text-ink mb-1">{bgData.name} — Background Equipment</h3>
          <p className="text-xs text-ink-muted font-sans mb-3">Uncheck items you don't want.</p>
          <div className="space-y-2">
            {bgItems.map((ref, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bgChecked[i] ?? true}
                  onChange={e => { const next = [...bgChecked]; next[i] = e.target.checked; setBgChecked(next) }}
                  className="accent-amber-700"
                />
                <span className={`font-serif text-sm transition-colors ${bgChecked[i] !== false ? 'text-ink' : 'text-ink-muted line-through'}`}>
                  {ref.name}{ref.quantity && ref.quantity > 1 ? ` ×${ref.quantity}` : ''}
                </span>
              </label>
            ))}
            {bgData.startingCurrency && (
              <p className="text-xs text-green-700 font-sans pt-1">
                +{Object.entries(bgData.startingCurrency).filter(([,v]) => v && v > 0).map(([k,v]) => `${v} ${k.toUpperCase()}`).join(', ')} starting gold
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Catalog ─────────────────────────────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={() => setCatalogOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-serif text-ink-muted hover:text-ink transition-colors"
        >
          <span>{catalogOpen ? '▾' : '▸'}</span>
          Add extra items from catalog
          {catalogAdded.length > 0 && (
            <span className="ml-1 text-xs bg-accent-gold/20 text-ink px-1.5 py-0.5 rounded-sm font-sans">{catalogAdded.length}</span>
          )}
        </button>

        {catalogOpen && (
          <div className="mt-3 border border-parchment-400 rounded-xl overflow-hidden shadow-md">
            <div className="p-3 bg-parchment-200 border-b border-ink/10">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full text-sm font-sans bg-white border border-ink/20 rounded-sm px-3 py-1.5 focus:outline-none focus:border-accent-gold"
              />
            </div>
            <div className="flex border-b border-ink/10 bg-parchment-200">
              {(['weapons', 'armor', 'gear'] as CatalogTab[]).map(tab => (
                <button key={tab} type="button" onClick={() => setCatalogTab(tab)}
                  className={`flex-1 py-2 text-xs font-sans uppercase tracking-wide transition-colors ${catalogTab === tab ? 'text-ink border-b-2 border-accent-gold font-semibold' : 'text-ink-muted hover:text-ink'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-ink/5">
              {catalogTab === 'weapons' && filteredWeapons.map(item => {
                const added = isAdded('weapon', item.name)
                return (
                  <button key={item.name} type="button" onClick={() => toggleCatalog({ type: 'weapon', name: item.name })}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${added ? 'bg-accent-gold/15 hover:bg-accent-gold/20' : 'hover:bg-parchment-200'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-serif text-sm text-ink">{added && <span className="text-accent-gold mr-1">✓</span>}{item.name}</p>
                        <p className="text-xs text-ink-muted font-sans mt-0.5">{item.damage} {item.damageType}{item.properties.length > 0 ? ` · ${item.properties.join(', ')}` : ''}</p>
                        <p className="text-xs text-ink-muted font-sans mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <span className="text-xs text-ink-muted font-sans shrink-0">{item.cost}</span>
                    </div>
                  </button>
                )
              })}
              {catalogTab === 'armor' && filteredArmor.map(item => {
                const added = isAdded('armor', item.name)
                return (
                  <button key={item.name} type="button" onClick={() => toggleCatalog({ type: 'armor', name: item.name })}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${added ? 'bg-accent-gold/15 hover:bg-accent-gold/20' : 'hover:bg-parchment-200'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-serif text-sm text-ink">{added && <span className="text-accent-gold mr-1">✓</span>}{item.name}</p>
                        <p className="text-xs text-ink-muted font-sans mt-0.5">AC {item.ac} · {item.type}{item.stealthDisadvantage ? ' · Stealth disadv.' : ''}{item.strengthReq ? ` · STR ${item.strengthReq}+` : ''}</p>
                        <p className="text-xs text-ink-muted font-sans mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <span className="text-xs text-ink-muted font-sans shrink-0">{item.cost}</span>
                    </div>
                  </button>
                )
              })}
              {catalogTab === 'gear' && filteredGear.map(item => {
                const added = isAdded('gear', item.name)
                return (
                  <button key={item.name} type="button" onClick={() => toggleCatalog({ type: 'gear', name: item.name })}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${added ? 'bg-accent-gold/15 hover:bg-accent-gold/20' : 'hover:bg-parchment-200'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-serif text-sm text-ink">{added && <span className="text-accent-gold mr-1">✓</span>}{item.name}</p>
                        <p className="text-xs text-ink-muted font-sans mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <span className="text-xs text-ink-muted font-sans shrink-0">{item.cost ?? ''}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── Preview ─────────────────────────────────────────────────────── */}
      {(character.weapons.length > 0 || character.equipment.length > 0 || character.currency.gp > 0) && (
        <section className="pt-4 border-t border-ink/10">
          <p className="text-xs text-ink-muted font-sans uppercase tracking-wide mb-2">Your starting equipment</p>
          <div className="flex flex-wrap gap-1.5">
            {character.weapons.map((w, i) => (
              <span key={i} className="inline-flex items-center text-xs font-sans bg-parchment-200 border border-ink/15 px-2 py-0.5 rounded-sm text-ink">⚔ {w.name}</span>
            ))}
            {character.equipment.map((e, i) => (
              <span key={i} className="inline-flex items-center text-xs font-sans bg-parchment-200 border border-ink/15 px-2 py-0.5 rounded-sm text-ink">
                {e.name}{e.quantity > 1 ? ` ×${e.quantity}` : ''}
              </span>
            ))}
          </div>
          {character.currency.gp > 0 && (
            <p className="text-xs text-ink-muted font-sans mt-2">+ {character.currency.gp} GP</p>
          )}
        </section>
      )}
    </div>
  )
}
