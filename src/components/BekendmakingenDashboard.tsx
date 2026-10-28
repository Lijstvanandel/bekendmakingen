import React from 'react';
import { Bekendmaking, ScrapeCycleStatus, getRubriekMeta } from '../types/bekendmakingen';
import {
  X,
  Clock,
  RefreshCw,
  MapPin,
  CheckCircle2,
  FileText,
  Building2,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BekendmakingenDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  items: Bekendmaking[];
  cycleStatus: ScrapeCycleStatus;
  onTriggerScan: () => void;
  isScanning: boolean;
  onSelectBekendmaking: (item: Bekendmaking) => void;
}

export const BekendmakingenDashboard: React.FC<BekendmakingenDashboardProps> = ({
  isOpen,
  onClose,
  items,
  cycleStatus,
  onTriggerScan,
  isScanning,
  onSelectBekendmaking,
}) => {
  if (!isOpen) return null;

  const physicalItems = items.filter((b) => b.isFysiek);
  const geolocatedItems = physicalItems.filter((b) => b.geolocated && b.lat && b.lng);
  const nonPhysicalItems = items.filter((b) => !b.isFysiek);

  // Group by rubriek
  const rubriekMap: Record<string, number> = {};
  for (const b of items) {
    rubriekMap[b.rubriek] = (rubriekMap[b.rubriek] || 0) + 1;
  }
  const rubrieken = Object.entries(rubriekMap).sort((a, b) => b[1] - a[1]);

  // Group by kern
  const kernMap: Record<string, number> = {};
  for (const b of items) {
    if (b.kern && b.kern !== 'Steenwijkerland') {
      kernMap[b.kern] = (kernMap[b.kern] || 0) + 1;
    }
  }
  const kernen = Object.entries(kernMap).sort((a, b) => b[1] - a[1]);

  // Format next scan relative time
  const nextScanDate = new Date(cycleStatus.nextScheduledScanAt);
  const now = new Date();
  const diffHours = Math.max(0, Math.round((nextScanDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-text overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b1a13] border-b border-[var(--border-subtle)] p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-main)]">
                24-Uurs Cyclus & Bekendmakingen Audit
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Actieve scraping, geocodering en fysieke classificatie van Gemeenteblad Steenwijkerland
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 font-sans text-xs sm:text-sm text-[var(--text-main)]">
          {/* 24-uurs Scheduler Status Banner */}
          <div className="p-4 rounded-[8px] bg-[var(--bg-main)] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="font-display font-bold text-sm text-emerald-300">
                  24-Uurs Automatische Evaluatiecyclus Actief
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Elke 24 uur scant het systeem nieuwe bekendmakingen van Overheid.nl, beoordeelt of het een fysieke ingreep betreft, en plot deze binnen de gemeentegrenzen.
              </p>
              <div className="text-[11px] font-mono text-[var(--text-dim)] pt-1">
                Laatste scan: {new Date(cycleStatus.lastScannedAt).toLocaleString('nl-NL')} · Volgende scan: over ~{diffHours} uur
              </div>
            </div>

            <button
              type="button"
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`px-4 py-2 text-xs font-semibold rounded-[5px] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isScanning
                  ? 'bg-emerald-950 text-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-[#060e0a]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scan loopt...' : 'Direct Nu Scannen'}</span>
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
                Fysiek Geplot op Kaart
              </div>
              <div className="text-2xl font-display font-bold text-emerald-400 tabular-nums">
                {geolocatedItems.length}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                Binnen gemeentegrenzen
              </div>
            </div>

            <div className="bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
                Totaal Bekendmakingen
              </div>
              <div className="text-2xl font-display font-bold text-white tabular-nums">
                {items.length}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                Gemeenteblad Steenwijkerland
              </div>
            </div>

            <div className="bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
                Niet-Fysiek Beleid
              </div>
              <div className="text-2xl font-display font-bold text-slate-400 tabular-nums">
                {nonPhysicalItems.length}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                Verordeningen & Mandaat
              </div>
            </div>

            <div className="bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
                Locatie Detectie Ratio
              </div>
              <div className="text-2xl font-display font-bold text-[var(--accent-gold)] tabular-nums">
                {physicalItems.length > 0
                  ? `${Math.round((geolocatedItems.length / physicalItems.length) * 100)}%`
                  : '100%'}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                BAG / PDOK Geolocatie
              </div>
            </div>
          </div>

          {/* Explanation of Physical Announcement Rules */}
          <div className="p-4 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--accent-gold)]">
              Wat is een 'Fysieke Bekendmaking'?
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              In het gemeentelijk domein betreft een <strong>fysieke bekendmaking</strong> een concreet besluit of melding met een directe materiële ingreep in de fysieke leefomgeving. Dit omvat onder meer:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-main)] pt-1">
              <li className="flex items-start gap-2 bg-[var(--bg-main)] p-2 rounded-[4px] border border-white/5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Omgevingsvergunningen:</strong> Bouwen, verbouwen, kappen, slopen, uitweg/inrit.</span>
              </li>
              <li className="flex items-start gap-2 bg-[var(--bg-main)] p-2 rounded-[4px] border border-white/5">
                <span className="text-amber-400 font-bold">✓</span>
                <span><strong>Verkeersbesluiten:</strong> Gehandicaptenparkeerplaatsen, laadpalen, borden E6/E8c, snelheden.</span>
              </li>
              <li className="flex items-start gap-2 bg-[var(--bg-main)] p-2 rounded-[4px] border border-white/5">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>Omgevingsmeldingen:</strong> Bodemsanering minerale olie, gesloten bodemenergiesystemen.</span>
              </li>
              <li className="flex items-start gap-2 bg-[var(--bg-main)] p-2 rounded-[4px] border border-white/5">
                <span className="text-slate-400 font-bold">✗</span>
                <span><strong>Niet-fysiek beleid:</strong> Algemene verordeningen, legestarieven, mandaten (niet op kaart).</span>
              </li>
            </ul>
          </div>

          {/* Distribution per Rubriek & Kern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Verdeling naar Rubriek
              </h4>
              <div className="space-y-2">
                {rubrieken.map(([rubriek, count]) => {
                  const meta = getRubriekMeta(rubriek);
                  const pct = Math.round((count / items.length) * 100);
                  return (
                    <div key={rubriek} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate text-white">{meta.shortLabel}</span>
                        <span className="font-mono text-[var(--text-muted)]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: meta.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Verdeling naar Kern
              </h4>
              <div className="space-y-2">
                {kernen.slice(0, 7).map(([kern, count]) => {
                  const pct = Math.round((count / items.length) * 100);
                  return (
                    <div key={kern} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white">{kern}</span>
                        <span className="font-mono text-[var(--text-muted)]">{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.max(5, pct * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
