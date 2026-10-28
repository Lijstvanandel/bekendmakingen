import React from 'react';
import { RefreshCw, Download, SlidersHorizontal, MapPin, Clock, BarChart3, Code2, ExternalLink } from 'lucide-react';
import { ScrapeCycleStatus } from '../types/bekendmakingen';

interface TopNavbarProps {
  showFilterPanel: boolean;
  onToggleFilterPanel: () => void;
  onOpenCycleModal: () => void;
  onOpenAuditModal: () => void;
  onOpenEmbedModal: () => void;
  onExportCSV: () => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  cycleStatus: ScrapeCycleStatus;
  physicalCount: number;
  totalCount: number;
  isEmbed?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  showFilterPanel,
  onToggleFilterPanel,
  onOpenCycleModal,
  onOpenAuditModal,
  onOpenEmbedModal,
  onExportCSV,
  onTriggerScan,
  isScanning,
  cycleStatus,
  physicalCount,
  totalCount,
  isEmbed = false,
}) => {
  return (
    <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8 z-30 shrink-0 select-none">
      {/* Zone 1: Wordmark & municipality identity */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="font-display text-base md:text-lg font-bold tracking-tight text-[var(--text-main)] whitespace-nowrap flex items-center gap-2"
        >
          <span>Bestuurlijke Bekendmakingenkaart</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Steenwijkerland
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[var(--text-muted)]">
        <button
          type="button"
          onClick={onToggleFilterPanel}
          className={`hover:text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 flex items-center gap-1.5 ${
            showFilterPanel
              ? 'text-[var(--text-main)] border-[var(--accent-gold)] font-semibold'
              : 'border-transparent'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filterpaneel</span>
        </button>

        <button
          type="button"
          onClick={onOpenCycleModal}
          className="hover:text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 border-transparent hover:border-[var(--border-focus)] flex items-center gap-1.5"
          title="Bekijk de 24-uurs automatische scan- en classificatiecyclus"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>24-Uurs Cyclus</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        </button>

        <button
          type="button"
          onClick={onOpenAuditModal}
          className="hover:text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 border-transparent hover:border-[var(--border-focus)] flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Overzicht & Audit</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-[var(--text-muted)]">
            {physicalCount}/{totalCount}
          </span>
        </button>

        {!isEmbed && (
          <button
            type="button"
            onClick={onOpenEmbedModal}
            className="hover:text-[var(--text-main)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 border-transparent hover:border-[var(--border-focus)] flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Insluiten</span>
          </button>
        )}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isEmbed ? (
          <button
            type="button"
            onClick={onOpenEmbedModal}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-[5px] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Genereer HTML iframe code om de kaart in te sluiten"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Insluiten</span>
          </button>
        ) : (
          <a
            href={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-[5px] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Open de volledige kaart in een nieuw venster"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Volledige kaart</span>
          </a>
        )}

        <button
          type="button"
          onClick={onTriggerScan}
          disabled={isScanning}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[5px] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer border ${
            isScanning
              ? 'bg-[var(--bg-elevated)] text-[var(--text-dim)] border-[var(--border-subtle)] cursor-not-allowed'
              : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-emerald-300 border-emerald-500/30'
          }`}
          title="Herstart de 24-uurs scan en fysieke classificatie van Overheid.nl bekendmakingen"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">
            {isScanning ? 'Bezig met scannen...' : 'Scan 24u'}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#060e0a] bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-bright)] rounded-[5px] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Exporteer gefilterde bekendmakingen als CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Download CSV</span>
        </button>
      </div>
    </header>
  );
};
