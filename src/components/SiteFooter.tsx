import React from 'react';
import {
  Code2,
  Download,
  Clock,
  MapPin,
  ExternalLink,
  ChevronUp,
  ShieldCheck,
  FileText,
  Building2,
  Database,
  Layers,
} from 'lucide-react';
import { STEENWIJKERLAND_KERNEN } from '../data/steenwijkerland';

interface SiteFooterProps {
  onOpenEmbedModal: () => void;
  onOpenCycleModal: () => void;
  onOpenDashboard: () => void;
  onExportCSV: () => void;
  onSelectKern: (kern: string) => void;
  physicalCount: number;
  totalCount: number;
  lastScannedAt?: string;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  onOpenEmbedModal,
  onOpenCycleModal,
  onOpenDashboard,
  onExportCSV,
  onSelectKern,
  physicalCount,
  totalCount,
  lastScannedAt,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer bg-[#07130d] border-t border-[var(--border-subtle)] text-[var(--text-main)] shrink-0 select-none">
      {/* Top Banner / Insluiten & Quick Action Strip */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-semibold text-emerald-400">24-Uurs Automatische Cyclus Actief</span>
              <span className="text-[var(--text-muted)] mx-2 hidden sm:inline">•</span>
              <span className="text-[var(--text-muted)] hidden sm:inline">
                {physicalCount} fysieke bekendmakingen geplot op BAG-coördinaten ({totalCount} totaal geregistreerd)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onOpenEmbedModal}
              className="px-3 py-1.5 rounded-[5px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Genereer een HTML <iframe> om deze kaart in te sluiten op uw eigen website"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Kaart Insluiten (Embed)</span>
            </button>

            <button
              type="button"
              onClick={onExportCSV}
              className="px-3 py-1.5 rounded-[5px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exporteer alle gefilterde bekendmakingen als CSV"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>CSV Export</span>
            </button>

            <button
              type="button"
              onClick={onOpenCycleModal}
              className="px-3 py-1.5 rounded-[5px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>24u Cyclus Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid (Style from bestandkaart.html) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-[var(--text-main)] leading-tight">
                  Bekendmakingenkaart Steenwijkerland
                </h4>
                <p className="text-[11px] font-mono text-emerald-400">
                  Officiële Gemeentelijke Publicaties
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Alle officiële bestuurlijke en fysieke bekendmakingen van Gemeente Steenwijkerland
              op één overzichtelijke kaart. Eenvoudig doorzoekbaar per kern, rubriek en publicatiejaar
              (2021–2026), inclusief geautomatiseerde 24-uurs evaluatiecyclus.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Officiële data direct gekoppeld met Overheid.nl & KOOP</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Kadaster BAG & PDOK rooftop-geocoding</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Afgebakend binnen officiële gemeentegrenzen</span>
              </div>
            </div>

            {/* Insluiten banner highlight in brand column */}
            <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Insluiten op eigen site</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] mt-1">
                    Plaats deze live kaart als interactief kader op een dorpsportaal, persbericht of nota.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenEmbedModal}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border border-amber-500/30"
                >
                  Code
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Alle kernen van Steenwijkerland (5 cols, structured like 'Alle provincies') */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-[var(--text-main)]">
                Kernen & Wijken in Steenwijkerland
              </h4>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">Klik voor kernstatistieken</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Selecteer een kern om direct in te zoomen en het aantal vergunningen, verkeersbesluiten en plannen te bekijken:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {STEENWIJKERLAND_KERNEN.map((k) => (
                <button
                  key={k.name}
                  type="button"
                  onClick={() => onSelectKern(k.name)}
                  className="px-2.5 py-1.5 rounded-[4px] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-left text-xs text-[var(--text-muted)] hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{k.name}</span>
                  <MapPin className="w-3 h-3 text-[var(--text-dim)] group-hover:text-emerald-400 shrink-0 ml-1 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Databronnen, Rubrieken & Snelkoppelingen (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className="font-display text-sm font-bold text-[var(--text-main)] mb-2.5">
                Rubrieken & Besluiten
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Omgevingsvergunningen (bouw/kap/uitrit)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Bestemmings- & Ruimtelijke plannen</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Verkeersbesluiten & Wegwerkzaamheden</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>APV & Evenementenvergunningen</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Verordeningen & Beleidsregels</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <h4 className="font-display text-xs font-bold text-[var(--text-main)] mb-2">
                Officiële Databronnen
              </h4>
              <div className="space-y-1.5 text-[11px] text-[var(--text-muted)]">
                <a
                  href="https://zoek.officielebekendmakingen.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--text-dim)]" />
                  <span>Overheid.nl — Officiële bekendmakingen</span>
                </a>
                <a
                  href="https://www.steenwijkerland.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--text-dim)]" />
                  <span>Gemeente Steenwijkerland Gemeenteblad</span>
                </a>
                <a
                  href="https://www.pdok.nl/introductie/-/article/basisregistratie-adressen-en-gebouwen-ba-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--text-dim)]" />
                  <span>Kadaster BAG & PDOK Geocoding</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip (Style conform bestandkaart.html) */}
      <div className="border-t border-[var(--border-subtle)] bg-[#040a07] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>© 2026 Gemeente Steenwijkerland • Bekendmakingenkaart</span>
            <span>•</span>
            <span className="text-[var(--text-muted)]">scientiarum.nl Dataproducten</span>
            <span>•</span>
            <span>Gegevens van Overheid.nl & Kadaster BAG</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenEmbedModal}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Insluiten (Embed)</span>
            </button>

            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Naar boven</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
