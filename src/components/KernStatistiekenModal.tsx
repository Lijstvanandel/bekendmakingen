import React, { useMemo } from 'react';
import { Bekendmaking, getRubriekMeta } from '../types/bekendmakingen';
import { STEENWIJKERLAND_KERNEN, SteenwijkerlandKern } from '../data/steenwijkerland';
import {
  MapPin,
  X,
  Building,
  Car,
  Trees,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Navigation,
  Filter,
  BarChart2,
  FileText,
} from 'lucide-react';

interface KernStatistiekenModalProps {
  kernName: string;
  items: Bekendmaking[];
  selectedYear: number | 'all';
  onClose: () => void;
  onSelectBekendmaking: (item: Bekendmaking) => void;
  onFilterByKern: (kern: string) => void;
  onCenterMap: (lat: number, lng: number, zoom?: number) => void;
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

export const KernStatistiekenModal: React.FC<KernStatistiekenModalProps> = ({
  kernName,
  items,
  selectedYear,
  onClose,
  onSelectBekendmaking,
  onFilterByKern,
  onCenterMap,
}) => {
  // Find kern metadata
  const kernMeta: SteenwijkerlandKern = useMemo(() => {
    return (
      STEENWIJKERLAND_KERNEN.find(
        (k) => k.name.toLowerCase() === kernName.toLowerCase()
      ) || {
        name: kernName,
        lat: 52.7876,
        lng: 6.1205,
        zoom: 14,
      }
    );
  }, [kernName]);

  // Filter items in this kern
  const kernItemsAllYears = useMemo(() => {
    return items.filter(
      (item) => item.kern.toLowerCase() === kernName.toLowerCase()
    );
  }, [items, kernName]);

  const kernItemsSelectedYear = useMemo(() => {
    if (selectedYear === 'all') return kernItemsAllYears;
    return kernItemsAllYears.filter((item) => item.jaargang === selectedYear);
  }, [kernItemsAllYears, selectedYear]);

  // Statistics calculation
  const totalCount = kernItemsSelectedYear.length;
  const physicalCount = kernItemsSelectedYear.filter((i) => i.isFysiek).length;
  const physicalPct = totalCount > 0 ? Math.round((physicalCount / totalCount) * 100) : 0;

  // Rubrieken breakdown
  const rubriekBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    kernItemsSelectedYear.forEach((i) => {
      counts[i.rubriek] = (counts[i.rubriek] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([rubriek, count]) => ({
        rubriek,
        count,
        pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        meta: getRubriekMeta(rubriek),
      }))
      .sort((a, b) => b.count - a.count);
  }, [kernItemsSelectedYear, totalCount]);

  // Omgevingsactiviteiten breakdown
  const activiteitBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    kernItemsSelectedYear.forEach((i) => {
      if (i.omgevingsactiviteit) {
        counts[i.omgevingsactiviteit] = (counts[i.omgevingsactiviteit] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([act, count]) => ({ act, count }))
      .sort((a, b) => b.count - a.count);
  }, [kernItemsSelectedYear]);

  // Monthly breakdown for this kern
  const monthlyCounts = useMemo(() => {
    const months = Array(12).fill(0);
    kernItemsSelectedYear.forEach((item) => {
      const d = new Date(item.publicatiedatum);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          months[m] += 1;
        }
      }
    });
    return months;
  }, [kernItemsSelectedYear]);

  const maxMonthVal = Math.max(...monthlyCounts, 1);

  // Verkeersbesluiten & gehandicaptenparkeerplaatsen count
  const parkingCount = kernItemsSelectedYear.filter(
    (i) => i.verkeersbordcode === 'E6' || i.title.toLowerCase().includes('gehandicaptenparkeerplaats')
  ).length;

  return (
    <div className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                  {kernName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-[4px] bg-slate-800 text-slate-300 font-mono">
                  Kern in Steenwijkerland
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                <span>Coördinaten: {kernMeta.lat.toFixed(4)}°N, {kernMeta.lng.toFixed(4)}°E</span>
                <span>•</span>
                <span>Jaar: {selectedYear === 'all' ? 'Alle jaargangen' : selectedYear}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onCenterMap(kernMeta.lat, kernMeta.lng, kernMeta.zoom);
                onClose();
              }}
              className="px-3 py-1.5 rounded-[5px] bg-[var(--accent-gold)] text-[#060e0a] font-bold text-xs flex items-center gap-1.5 hover:bg-[var(--accent-gold-bright)] transition-colors cursor-pointer shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Centreer op kaart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onFilterByKern(kernName);
                onClose();
              }}
              className="px-3 py-1.5 rounded-[5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filter kaart op {kernName}</span>
            </button>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Totaal Bekendmakingen
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalCount}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                ({kernItemsAllYears.length} in alle jaren)
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Fysiek op adres
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {physicalPct}%
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                {physicalCount} fysieke ingrepen
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Verkeer & Parkeren
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {parkingCount}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                Gehandicaptenparkeerpl.
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Vergunningen
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {rubriekBreakdown.find((r) => r.rubriek.includes('omgevingsvergunning'))?.count || 0}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                Bouw, kap, inrit
              </div>
            </div>
          </div>

          {/* Monthly Distribution Bar Chart for this Kern */}
          <div className="p-3.5 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Maandelijkse publicaties in {kernName} ({selectedYear === 'all' ? 'Totaal' : selectedYear})</span>
              </span>
              <span className="text-[10px] text-[var(--text-dim)]">Januari – December</span>
            </div>

            <div className="grid grid-cols-12 gap-1 h-16 items-end pt-2 pb-1 bg-black/30 rounded-[4px] px-2">
              {monthlyCounts.map((val, idx) => {
                const heightPct = Math.max(Math.round((val / maxMonthVal) * 100), val > 0 ? 10 : 3);
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-mono text-[var(--text-dim)] mb-0.5 leading-none">
                      {val > 0 ? val : ''}
                    </span>
                    <div className="w-full rounded-t-[2px] bg-slate-800 h-full flex flex-col justify-end overflow-hidden">
                      <div
                        className={`w-full transition-all ${
                          val > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300'
                            : 'bg-slate-700/20'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)] mt-1 font-mono">
                      {MONTH_NAMES[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rubrieken Breakdown with Progress Bars */}
          <div className="p-3.5 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
            <div className="text-xs font-bold text-[var(--text-main)] mb-3 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verdeling per Bestuurlijke Rubriek</span>
            </div>

            <div className="space-y-2.5">
              {rubriekBreakdown.map((item) => (
                <div key={item.rubriek} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium truncate flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: item.meta.colorHex }}
                      />
                      <span>{item.meta.label}</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[11px] shrink-0">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.meta.colorHex,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Omgevingsactiviteiten Tags */}
          {activiteitBreakdown.length > 0 && (
            <div className="p-3.5 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <div className="text-xs font-bold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-cyan-400" />
                <span>Omgevingsactiviteiten in {kernName}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activiteitBreakdown.map(({ act, count }) => (
                  <span
                    key={act}
                    className="px-2 py-1 rounded-[4px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    <span className="capitalize">{act}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-black/40 text-amber-400">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Publications in this Kern */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[var(--text-main)] flex items-center justify-between">
              <span>Recente bekendmakingen in {kernName} ({kernItemsSelectedYear.length})</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {kernItemsSelectedYear.slice(0, 10).map((pub) => {
                const meta = getRubriekMeta(pub.rubriek);
                return (
                  <div
                    key={pub.id}
                    onClick={() => onSelectBekendmaking(pub)}
                    className="p-2.5 rounded-[5px] bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-emerald-500/40 hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-[3px] border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                        >
                          {meta.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">
                          {pub.datumDisplay}
                        </span>
                        {pub.isFysiek && (
                          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Fysiek</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs text-white font-medium truncate group-hover:text-amber-300 transition-colors">
                        {pub.title}
                      </h4>
                      {pub.adres && (
                        <p className="text-[11px] text-[var(--text-dim)] truncate mt-0.5">
                          {pub.adres}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-amber-300 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between text-xs text-[var(--text-dim)] shrink-0">
          <span>Bron: Officiële Bekendmakingen Gemeente Steenwijkerland</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-[4px] bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
