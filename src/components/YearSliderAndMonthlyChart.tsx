import React, { useMemo, useState } from 'react';
import { Bekendmaking, BekendmakingFilterState } from '../types/bekendmakingen';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  Layers,
} from 'lucide-react';

interface YearSliderAndMonthlyChartProps {
  items: Bekendmaking[];
  filters: BekendmakingFilterState;
  onUpdateFilters: (filters: BekendmakingFilterState) => void;
  onSelectKernStat?: (kern: string) => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mrt',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dec',
];

const FULL_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maart',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Augustus',
  'September',
  'Oktober',
  'November',
  'December',
];

const AVAILABLE_YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

export const YearSliderAndMonthlyChart: React.FC<YearSliderAndMonthlyChartProps> = ({
  items,
  filters,
  onUpdateFilters,
  onSelectKernStat,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const selectedYear = filters.selectedJaargang;
  const selectedMonth = filters.selectedMonth;

  // Filter items matching the current kern if any is selected
  const kernFilteredItems = useMemo(() => {
    if (!filters.selectedKern) return items;
    return items.filter((item) => item.kern === filters.selectedKern);
  }, [items, filters.selectedKern]);

  // Aggregate publication counts per year
  const yearCounts = useMemo(() => {
    const counts: Record<number, { total: number; physical: number }> = {};
    AVAILABLE_YEARS.forEach((y) => {
      counts[y] = { total: 0, physical: 0 };
    });

    kernFilteredItems.forEach((item) => {
      if (counts[item.jaargang]) {
        counts[item.jaargang].total += 1;
        if (item.isFysiek) {
          counts[item.jaargang].physical += 1;
        }
      }
    });

    return counts;
  }, [kernFilteredItems]);

  // Aggregate monthly counts for the selected year (or all years)
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: MONTH_NAMES[i],
      fullName: FULL_MONTH_NAMES[i],
      total: 0,
      physical: 0,
    }));

    kernFilteredItems.forEach((item) => {
      // If a specific year is selected, only tally that year
      if (selectedYear !== 'all' && item.jaargang !== selectedYear) {
        return;
      }
      const d = new Date(item.publicatiedatum);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth(); // 0-11
        if (m >= 0 && m < 12) {
          months[m].total += 1;
          if (item.isFysiek) {
            months[m].physical += 1;
          }
        }
      }
    });

    return months;
  }, [kernFilteredItems, selectedYear]);

  // Find max monthly count to compute relative bar heights
  const maxMonthlyCount = useMemo(() => {
    const max = Math.max(...monthlyData.map((m) => m.total), 1);
    return Math.max(max, 10);
  }, [monthlyData]);

  // Total in current year selection
  const currentSelectionTotal = useMemo(() => {
    if (selectedYear === 'all') {
      return kernFilteredItems.length;
    }
    return yearCounts[selectedYear]?.total || 0;
  }, [kernFilteredItems, selectedYear, yearCounts]);

  const handlePrevYear = () => {
    if (selectedYear === 'all') {
      onUpdateFilters({ ...filters, selectedJaargang: AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1], selectedMonth: 'all' });
      return;
    }
    const idx = AVAILABLE_YEARS.indexOf(selectedYear);
    if (idx > 0) {
      onUpdateFilters({ ...filters, selectedJaargang: AVAILABLE_YEARS[idx - 1], selectedMonth: 'all' });
    }
  };

  const handleNextYear = () => {
    if (selectedYear === 'all') {
      onUpdateFilters({ ...filters, selectedJaargang: AVAILABLE_YEARS[0], selectedMonth: 'all' });
      return;
    }
    const idx = AVAILABLE_YEARS.indexOf(selectedYear);
    if (idx < AVAILABLE_YEARS.length - 1) {
      onUpdateFilters({ ...filters, selectedJaargang: AVAILABLE_YEARS[idx + 1], selectedMonth: 'all' });
    }
  };

  const handleBarClick = (monthNum: number) => {
    if (selectedMonth === monthNum) {
      // Toggle off
      onUpdateFilters({ ...filters, selectedMonth: 'all' });
    } else {
      // Filter by this month
      onUpdateFilters({ ...filters, selectedMonth: monthNum });
    }
  };

  return (
    <div className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-subtle)] rounded-[8px] shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Header / Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <span>Tijdlijn & Maandverdeling</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {currentSelectionTotal} publicaties
            </span>
          </span>

          {/* Active Kern Badge if selected */}
          {filters.selectedKern && (
            <div className="flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 px-2 py-0.5 rounded-[4px] text-[11px]">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span className="font-semibold">{filters.selectedKern}</span>
              {onSelectKernStat && (
                <button
                  type="button"
                  onClick={() => onSelectKernStat(filters.selectedKern)}
                  className="ml-1 text-[10px] text-cyan-200 underline hover:text-white cursor-pointer"
                >
                  Statistieken
                </button>
              )}
              <button
                type="button"
                onClick={() => onUpdateFilters({ ...filters, selectedKern: '' })}
                className="ml-1 text-cyan-400 hover:text-white cursor-pointer"
                title="Wis kernfilter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Active Month filter indicator */}
          {selectedMonth !== 'all' && (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-[4px] text-[11px]">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Gefilterd: {FULL_MONTH_NAMES[selectedMonth - 1]}</span>
              <button
                type="button"
                onClick={() => onUpdateFilters({ ...filters, selectedMonth: 'all' })}
                className="ml-1 text-amber-400 hover:text-white cursor-pointer"
                title="Toon alle maanden"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right side: collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer flex items-center gap-1"
          title={isCollapsed ? 'Uitklappen' : 'Minimaliseren'}
        >
          <span className="text-[11px] hidden sm:inline">
            {isCollapsed ? 'Toon grafiek' : 'Minimaliseer'}
          </span>
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3">
          {/* Year Slider & Selector Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevYear}
                disabled={selectedYear === AVAILABLE_YEARS[0]}
                className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Vorig jaar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-[var(--bg-main)] p-0.5 rounded-[6px] border border-[var(--border-subtle)]">
                {AVAILABLE_YEARS.map((year) => {
                  const isSelected = selectedYear === year;
                  const count = yearCounts[year]?.total || 0;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() =>
                        onUpdateFilters({
                          ...filters,
                          selectedJaargang: year,
                          selectedMonth: 'all',
                        })
                      }
                      className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-all cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? 'bg-[var(--accent-gold)] text-[#060e0a] font-bold shadow-md scale-102'
                          : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)]'
                      }`}
                      title={`${year}: ${count} publicaties`}
                    >
                      <span>{year}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    onUpdateFilters({
                      ...filters,
                      selectedJaargang: 'all',
                      selectedMonth: 'all',
                    })
                  }
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-sans transition-all cursor-pointer ${
                    selectedYear === 'all'
                      ? 'bg-emerald-500 text-[#060e0a] font-bold shadow-md'
                      : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)]'
                  }`}
                  title="Toon alle publicaties van alle jaren"
                >
                  Alle
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextYear}
                disabled={selectedYear === AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}
                className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Volgend jaar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slider track for fluid scrubbing */}
            <div className="flex-1 min-w-[140px] px-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--text-dim)]">2021</span>
              <input
                type="range"
                min={2021}
                max={2026}
                step={1}
                value={selectedYear === 'all' ? 2026 : selectedYear}
                onChange={(e) =>
                  onUpdateFilters({
                    ...filters,
                    selectedJaargang: parseInt(e.target.value, 10),
                    selectedMonth: 'all',
                  })
                }
                className="w-full accent-amber-400 h-1.5 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[var(--text-dim)]">2026</span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-[var(--text-main)]">
                {selectedYear === 'all' ? 'Alle jaargangen' : `Jaar ${selectedYear}`}
              </span>
            </div>
          </div>

          {/* Monthly Bar Chart (Staafdiagram) */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Maandverdeling {selectedYear === 'all' ? '(Totaal alle jaren)' : `(${selectedYear})`}
              </span>
              <span className="text-[10px] text-[var(--text-dim)]">
                Klik op een staaf om op die maand te filteren
              </span>
            </div>

            {/* 12 Bars Container */}
            <div className="grid grid-cols-12 gap-1 sm:gap-1.5 h-20 items-end px-1 pt-2 pb-1 bg-[var(--bg-main)]/70 rounded-[6px] border border-[var(--border-subtle)] relative">
              {monthlyData.map((m) => {
                const heightPct = Math.max(Math.round((m.total / maxMonthlyCount) * 100), m.total > 0 ? 8 : 2);
                const isSelected = selectedMonth === m.month;
                const isHovered = hoveredMonth === m.month;

                return (
                  <div
                    key={m.month}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onClick={() => handleBarClick(m.month)}
                    onMouseEnter={() => setHoveredMonth(m.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-14 z-50 bg-[#060e0a] border border-amber-500/50 rounded-[4px] px-2 py-1 shadow-2xl text-[10px] whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2">
                        <div className="font-bold text-amber-300">
                          {m.fullName} {selectedYear === 'all' ? '' : selectedYear}
                        </div>
                        <div className="text-slate-200">
                          {m.total} bekendmakingen ({m.physical} fysiek)
                        </div>
                      </div>
                    )}

                    {/* Numeric Count badge above bar */}
                    <span
                      className={`text-[9px] font-mono leading-none mb-1 transition-colors ${
                        isSelected
                          ? 'text-amber-300 font-bold'
                          : m.total > 0
                          ? 'text-[var(--text-dim)] group-hover:text-white'
                          : 'text-transparent'
                      }`}
                    >
                      {m.total}
                    </span>

                    {/* The Bar itself */}
                    <div className="w-full relative flex flex-col justify-end rounded-t-[3px] overflow-hidden bg-slate-800/40" style={{ height: `${heightPct}%` }}>
                      {/* Physical portion (Emerald) */}
                      <div
                        className={`w-full transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-t from-amber-500 to-amber-400 ring-2 ring-amber-300 ring-inset shadow-lg shadow-amber-500/30'
                            : m.total > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300'
                            : 'bg-slate-700/30'
                        }`}
                        style={{ height: '100%' }}
                      />
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-[10px] mt-1 font-mono transition-colors ${
                        isSelected
                          ? 'text-amber-400 font-bold underline'
                          : isHovered
                          ? 'text-white'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
