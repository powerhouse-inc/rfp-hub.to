'use client'

import { useQueryState } from 'nuqs'
import { Search, X } from 'lucide-react'
import { cn } from '@/modules/shared/lib/utils'
import { RFP_STATUS_OPTIONS, type RfpStatus } from '../types'

export interface FilterState {
  search: string
  funder: string | null
  category: string | null
  status: RfpStatus | null
  ecosystem: string | null
}

interface Props {
  availableFunders: string[]
  availableCategories: string[]
  availableEcosystems: string[]
  filter: FilterState
  onChange: (next: Partial<FilterState>) => void
  totalMatching: number
}

export function useFilterState(): [FilterState, (next: Partial<FilterState>) => void] {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' })
  const [funder, setFunder] = useQueryState('funder')
  const [category, setCategory] = useQueryState('category')
  const [status, setStatus] = useQueryState('status')
  const [ecosystem, setEcosystem] = useQueryState('ecosystem')

  const filter: FilterState = {
    search,
    funder,
    category,
    status: status as RfpStatus | null,
    ecosystem,
  }

  const update = (next: Partial<FilterState>) => {
    if (next.search !== undefined) setSearch(next.search || null)
    if (next.funder !== undefined) setFunder(next.funder ?? null)
    if (next.category !== undefined) setCategory(next.category ?? null)
    if (next.status !== undefined) setStatus(next.status ?? null)
    if (next.ecosystem !== undefined) setEcosystem(next.ecosystem ?? null)
  }

  return [filter, update]
}

export function RfpFilters({
  availableFunders,
  availableCategories,
  availableEcosystems,
  filter,
  onChange,
  totalMatching,
}: Props) {
  const hasActive =
    filter.search || filter.funder || filter.category || filter.status || filter.ecosystem

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder="Search RFPs by title, funder, category…"
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full border border-border bg-background py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-foreground/60 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Status"
          value={filter.status ?? ''}
          options={RFP_STATUS_OPTIONS}
          onChange={(v) => onChange({ status: (v || null) as RfpStatus | null })}
        />
        <FilterSelect
          label="Funder"
          value={filter.funder ?? ''}
          options={availableFunders}
          onChange={(v) => onChange({ funder: v || null })}
        />
        <FilterSelect
          label="Category"
          value={filter.category ?? ''}
          options={availableCategories}
          onChange={(v) => onChange({ category: v || null })}
        />
        <FilterSelect
          label="Ecosystem"
          value={filter.ecosystem ?? ''}
          options={availableEcosystems}
          onChange={(v) => onChange({ ecosystem: v || null })}
        />
        {hasActive ? (
          <button
            type="button"
            onClick={() =>
              onChange({ search: '', funder: null, category: null, status: null, ecosystem: null })
            }
            className="ml-auto inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" strokeWidth={2} /> Clear
          </button>
        ) : null}
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {totalMatching} RFP{totalMatching === 1 ? '' : 's'}
      </p>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className={cn('relative inline-flex items-center')}>
      <span className="pointer-events-none absolute left-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none border border-border bg-background py-2 pl-[4.5rem] pr-8 text-sm focus:border-foreground/60 focus:outline-none',
          value && 'border-foreground/30',
        )}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
