import React, { useMemo } from 'react';
import {
  Bekendmaking,
  BekendmakingFilterState,
  getRubriekMeta,
} from '../types/bekendmakingen';
import { STEENWIJKERLAND_KERNEN } from '../data/steenwijkerland';
import {
  Search,
  X,
  MapPin,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Car,
  Trees,
  FileText,
  RotateCcw,
  Sparkles,
  BarChart2,
} from 'lucide-react';

interface BekendmakingFilterPanelProps {
  items: Bekendmaking[];
  filteredItems: Bekendmaking[];
  filters: BekendmakingFilterState;
  onUpdateFilters: (next: BekendmakingFilterState) => void;
  onResetFilters: () => void;
  onSelectBekendmaking: (item: Bekendmaking) => void;
  selectedId: string | null;
  onFlyTo: (lat: number, lng: number, zoom: number) => void;
  onClose: () => void;
  onSelectKernStat?: (kern: string) => void;
}

export const BekendmakingFilterPanel: React.FC<BekendmakingFilterPanelProps> = ({
  items,
  filteredItems,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSelectBekendmaking,
  selectedId,
  onFlyTo,
  onClose,
  onSelectKernStat,
}) => {
  // Aggregate unique rubrieken with counts
  const rubriekStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.rubriek] = (counts[item.rubriek] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Aggregate unique omgevingsactiviteiten
  const activiteitStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (item.omgevingsactiviteit) {
        counts[item.omgevingsactiviteit] = (counts[item.omgevingsactiviteit] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Kern counts
  const kernStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (item.kern && item.kern !== 'Steenwijkerland') {
        counts[item.kern] = (counts[item.kern] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const toggleRubriek = (rubriek: string) => {
    const exists = filters.selectedRubrieken.includes(rubriek);
    const next = exists
      ? filters.selectedRubrieken.filter((r) => r !== rubriek)
      : [...filters.selectedRubrieken, rubriek];
    onUpdateFilters({ ...filters, selectedRubrieken: next });
  };

  const toggleActiviteit = (activiteit: string) => {
    const exists = filters.selectedActiviteiten.includes(activiteit);
    const next = exists
      ? filters.selectedActiviteiten.filter((a) => a !== activiteit)
      : [...filters.selectedActiviteiten, activiteit];
    onUpdateFilters({ ...filters, selectedActiviteiten: next });
  };

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (!filters.onlyPhysical ? 1 : 0) +
    filters.selectedRubrieken.length +
    filters.selectedActiviteiten.length +
    (filters.selectedKern ? 1 : 0) +
    (filters.selectedJaargang !== 'all' ? 1 : 0) +
    (filters.period !== 'all' ? 1 : 0);

  return (
    <aside className="w-full md:w-96 lg:w-[420px] bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col h-full z-20 shrink-0 select-none overflow-hidden text-[var(--text-main)] shadow-2xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--bg-main)]/60">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--accent-gold)]" />
          <h2 className="font-display text-sm font-bold tracking-tight">
            Bekendmakingen Filteren
          </h2>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--accent-gold)] text-[#060e0a] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-[var(--text-muted)] hover:text-white px-2 py-1 rounded-[4px] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset alle filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Herstel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-white rounded-[4px] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            title="Sluit filterpaneel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Zoek adres, trefwoord, dossier..."
            className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[6px] pl-9 pr-8 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Fysieke Bekendmakingen Toggle Button */}
        <div className="mt-2.5 flex items-center gap-1.5 p-1 bg-[var(--bg-main)] rounded-[6px] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => onUpdateFilters({ ...filters, onlyPhysical: true })}
            className={`flex-1 py-1.5 px-2 rounded-[4px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              filters.onlyPhysical
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fysieke bekendmakingen (kaart)</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateFilters({ ...filters, onlyPhysical: false })}
            className={`py-1.5 px-2.5 rounded-[4px] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              !filters.onlyPhysical
                ? 'bg-[var(--accent-gold)] text-[#060e0a] font-bold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)]'
            }`}
            title="Toon alle bekendmakingen inclusief niet-fysiek beleid en verordeningen"
          >
            <span>Alle ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Sections (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
        {/* Rubriek Facets */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
            <span>Rubriek</span>
            {filters.selectedRubrieken.length > 0 && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ ...filters, selectedRubrieken: [] })}
                className="text-[10px] text-amber-400 hover:underline"
              >
                Wis
              </button>
            )}
          </div>
          <div className="space-y-1">
            {rubriekStats.map(([rubriek, count]) => {
              const meta = getRubriekMeta(rubriek);
              const isSelected = filters.selectedRubrieken.includes(rubriek);
              return (
                <button
                  key={rubriek}
                  type="button"
                  onClick={() => toggleRubriek(rubriek)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[5px] text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer border ${
                    isSelected
                      ? `${meta.bgClass} ${meta.textClass} ${meta.borderClass} font-semibold`
                      : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <span className="truncate">{meta.shortLabel}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-[var(--text-dim)] shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Omgevingsactiviteit Facets */}
        {activiteitStats.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
              <span>Omgevingsactiviteit</span>
              {filters.selectedActiviteiten.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ ...filters, selectedActiviteiten: [] })}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  Wis
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activiteitStats.map(([act, count]) => {
                const isSelected = filters.selectedActiviteiten.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActiviteit(act)}
                    className={`px-2 py-1 rounded-[4px] text-[11px] transition-colors flex items-center gap-1 cursor-pointer border ${
                      isSelected
                        ? 'bg-[var(--accent-gold)] text-[#060e0a] border-transparent font-bold'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <span className="capitalize">{act}</span>
                    <span className="text-[10px] font-mono opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Kern Facets */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
            <span>Plaats / Kern</span>
            {filters.selectedKern && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ ...filters, selectedKern: '' })}
                className="text-[10px] text-amber-400 hover:underline"
              >
                Alle kernen
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {kernStats.slice(0, 10).map(([k, count]) => {
              const isSelected = filters.selectedKern === k;
              return (
                <div
                  key={k}
                  className={`px-2 py-1.5 rounded-[4px] text-xs transition-colors flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] text-[var(--accent-gold-bright)] border-[var(--border-focus)] font-semibold'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateFilters({
                        ...filters,
                        selectedKern: isSelected ? '' : k,
                      })
                    }
                    className="truncate flex-1 text-left cursor-pointer hover:underline"
                    title={`Filter kaart op ${k}`}
                  >
                    {k}
                  </button>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">
                      {count}
                    </span>
                    {onSelectKernStat && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectKernStat(k);
                        }}
                        className="p-0.5 rounded text-[var(--text-dim)] hover:text-amber-400 hover:bg-black/30 transition-colors cursor-pointer"
                        title={`Bekijk statistieken van ${k}`}
                      >
                        <BarChart2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Publications List */}
        <div className="pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
            <span>Resultaten ({filteredItems.length})</span>
            <span className="text-[10px] text-emerald-400">
              {filteredItems.filter((f) => f.isFysiek).length} fysiek geplot
            </span>
          </div>

          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="p-4 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                Geen bekendmakingen gevonden met de geselecteerde filters.
              </div>
            ) : (
              filteredItems.map((item) => {
                const meta = getRubriekMeta(item.rubriek);
                const isSelected = selectedId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectBekendmaking(item);
                      if (item.lat && item.lng) {
                        onFlyTo(item.lat, item.lng, 18);
                      }
                    }}
                    className={`p-2.5 rounded-[6px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--bg-elevated)] border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]/40'
                        : 'bg-[var(--bg-main)]/80 hover:bg-[var(--bg-card-hover)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[3px] border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                      >
                        {meta.shortLabel}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">
                        {item.datumDisplay}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-[var(--text-main)] line-clamp-2 leading-snug mb-1">
                      {item.title}
                    </h4>

                    {item.adres && (
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] truncate mb-1">
                        <MapPin className="w-3 h-3 text-[var(--accent-gold)] shrink-0" />
                        <span className="truncate">{item.adres}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] pt-1 border-t border-white/5">
                      <span className="font-mono">{item.jaargangEnNummer}</span>
                      {item.isFysiek ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Fysiek besluit
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Beleid/Verordening</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
