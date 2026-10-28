import React, { useState } from 'react';
import { Bekendmaking, getRubriekMeta } from '../types/bekendmakingen';
import {
  X,
  Download,
  ExternalLink,
  MapPin,
  Calendar,
  Building,
  FileText,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface BekendmakingDetailModalProps {
  item: Bekendmaking | null;
  onClose: () => void;
  onCenterMap: (lat: number, lng: number) => void;
  onSelectKern?: (kern: string) => void;
}

export const BekendmakingDetailModal: React.FC<BekendmakingDetailModalProps> = ({
  item,
  onClose,
  onCenterMap,
  onSelectKern,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const meta = getRubriekMeta(item.rubriek);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.officieleUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-text overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Document Banner conforming to Overheid.nl Gemeenteblad */}
        <div className="bg-[#0b1a13] border-b border-[var(--border-subtle)] p-4 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-white rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-display font-black text-xl shadow-inner">
              ST
            </div>

            <div className="flex-1 pr-6">
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-0.5">
                Gemeenteblad van Steenwijkerland
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[var(--text-main)] leading-snug">
                {item.title}
              </h2>
              <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                {item.jaargangEnNummer} · Publicatiedatum: {item.datumDisplay}
              </div>
            </div>
          </div>

          {/* Quick metadata strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">
                Rubriek
              </span>
              <span className={`font-semibold inline-block truncate ${meta.textClass}`}>
                {meta.shortLabel}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">
                Type Bekendmaking
              </span>
              <span
                className={`font-semibold ${
                  item.isFysiek ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {item.isFysiek ? 'Fysieke bekendmaking' : 'Beleid / Verordening'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">
                Plaats / Kern
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-white truncate block">
                  {item.kern || 'Steenwijkerland'}
                </span>
                {onSelectKern && item.kern && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectKern(item.kern);
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer shrink-0"
                    title={`Bekijk statistieken van ${item.kern}`}
                  >
                    Statistieken
                  </button>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">
                Zaaknummer
              </span>
              <span className="font-mono text-[var(--text-muted)] truncate block">
                {item.zaaknummer || 'N.v.t.'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 font-sans text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
          {/* Fysieke Bekendmaking Card (24-uurs cyclus evaluatie) */}
          <div
            className={`p-3.5 rounded-[6px] border ${
              item.isFysiek
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900/40 border-slate-700/40'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {item.isFysiek ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-300">
                    24-Uurs Fysieke Classificatie
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--text-dim)]">
                    Geëvalueerd: {new Date(item.lastEvaluatedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {item.fysiekeToelichting}
                </p>

                {item.adres && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <MapPin className="w-4 h-4 text-[var(--accent-gold)]" />
                      <span>{item.adres}</span>
                    </div>

                    {item.lat && item.lng && (
                      <button
                        type="button"
                        onClick={() => onCenterMap(item.lat!, item.lng!)}
                        className="text-[11px] font-semibold text-[var(--accent-gold-bright)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Toon & centreer op kaart</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aanhef & Bevoegd gezag */}
          {item.aanhef && (
            <div className="italic text-[var(--text-muted)] border-l-2 border-[var(--border-focus)] pl-3 py-1">
              {item.aanhef}
            </div>
          )}

          {/* Overwegingen */}
          {item.overwegingen && item.overwegingen.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--accent-gold)] mb-2">
                Overwegende:
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                {item.overwegingen.map((ow, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--text-dim)]">•</span>
                    <span>{ow}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Besluit */}
          {item.besluitenLijst && item.besluitenLijst.length > 0 && (
            <div className="bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2">
                Besluit:
              </h4>
              <ul className="space-y-1.5 text-xs text-white">
                {item.besluitenLijst.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mededelingen & Bezwaar maken conform Overheid.nl */}
          <div className="p-3.5 rounded-[6px] bg-black/40 border border-[var(--border-subtle)] space-y-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Mededelingen & Rechtsbescherming</span>
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Bent u het niet eens met dit besluit? Dan kunt u binnen <strong>6 weken</strong> na de publicatiedatum een bezwaarschrift indienen bij het college van burgemeester en wethouders van Gemeente Steenwijkerland (Postbus 162, 8330 AD Steenwijk) of digitaal via <a href="https://www.steenwijkerland.nl/bezwaar" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-gold)] underline">steenwijkerland.nl/bezwaar</a> met DigiD.
            </p>
            <p className="text-[11px] text-[var(--text-dim)]">
              Bij spoed kan tevens een voorlopige voorziening worden gevraagd bij de voorzieningenrechter van de Rechtbank Overijssel.
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3 sm:p-4 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-white bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-[5px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Gekopieerd' : 'Kopieer link'}</span>
            </button>

            <a
              href={item.officieleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-white bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-[5px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Overheid.nl</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {item.pdfUrl && (
              <a
                href={item.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-[#060e0a] bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-bright)] rounded-[5px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Authentieke PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
