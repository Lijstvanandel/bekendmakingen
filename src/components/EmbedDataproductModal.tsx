import React, { useState } from 'react';
import { X, Copy, Check, Code2, ExternalLink, Eye, Smartphone, Monitor } from 'lucide-react';

interface EmbedDataproductModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKern?: string | null;
}

export const EmbedDataproductModal: React.FC<EmbedDataproductModalProps> = ({
  isOpen,
  onClose,
  selectedKern = null,
}) => {
  const [copied, setCopied] = useState(false);
  const [heightPx, setHeightPx] = useState<number>(680);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [includeKern, setIncludeKern] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://bekendmakingen.scientiarum.nl';

  const kernParam = includeKern && selectedKern ? `&kern=${encodeURIComponent(selectedKern)}` : '';
  const embedUrl = `${baseUrl}/?embed=true${kernParam}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${heightPx}"
  style="border: 1px solid #1b3829; border-radius: 8px; background: #060e0a; overflow: hidden;"
  title="Bestuurlijke Bekendmakingenkaart Gemeente Steenwijkerland"
  loading="lazy"
  allowfullscreen
></iframe>`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-[950] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] max-w-2xl w-full shadow-2xl overflow-hidden text-[var(--text-main)] my-auto animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card-hover)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-main)]">
                Kaart Insluiten (Embed HTML)
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Integreer de bekendmakingenkaart direct in een webpagina of nieuwsbericht
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-[5px] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-[var(--text-muted)] leading-relaxed text-xs">
            Kopieer onderstaande HTML <code className="text-amber-300 font-mono text-[11px]">&lt;iframe&gt;</code>-code om de interactieve{' '}
            <strong className="text-[var(--text-main)] font-semibold">
              Bestuurlijke Bekendmakingenkaart Gemeente Steenwijkerland
            </strong>{' '}
            (inclusief officiële gemeentegrens, 24-uurs fysieke publicaties en jaar- en maandgrafieken) op te nemen op uw eigen website of portaal.
          </p>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--bg-main)] p-3.5 rounded-[6px] border border-[var(--border-subtle)]">
            <div>
              <label className="text-[var(--text-muted)] font-medium block mb-1.5">
                Hoogte van de kaart:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[520, 680, 840].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHeightPx(h)}
                    className={`px-2.5 py-1 rounded-[4px] font-mono text-xs transition-colors cursor-pointer ${
                      heightPx === h
                        ? 'bg-[var(--accent-gold)] text-[#060e0a] font-bold shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {h}px
                  </button>
                ))}
              </div>
            </div>

            {selectedKern && (
              <div>
                <label className="text-[var(--text-muted)] font-medium block mb-1.5">
                  Voorfilteren op kern:
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeKern((prev) => !prev)}
                  className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    includeKern
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${includeKern ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                  <span>Kern: {selectedKern}</span>
                </button>
              </div>
            )}
          </div>

          {/* Iframe Code Box */}
          <div className="relative">
            <pre className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[6px] p-3.5 pr-28 font-mono text-[11px] text-[var(--text-main)] overflow-x-auto leading-relaxed select-all">
              {iframeCode}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-[5px] bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-bright)] text-[#060e0a] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-900" />
                  <span>Gekopieerd!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopieer Code</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview Toggle & Tab link */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showPreview ? 'Verberg interactief voorbeeld' : 'Toon interactief voorbeeld'}</span>
            </button>

            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1.5 font-medium text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open embed-link in nieuw tabblad</span>
            </a>
          </div>

          {/* Interactive Preview Container */}
          {showPreview && (
            <div className="border border-[var(--border-subtle)] rounded-[6px] overflow-hidden bg-[var(--bg-main)] mt-3">
              <div className="bg-[var(--bg-card)] px-3 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Iframe Preview ({heightPx}px)</span>
                </div>
                <span className="text-[10px] text-[var(--text-dim)]">Geschaald voor weergave</span>
              </div>
              <div className="p-2 bg-[#060e0a]">
                <iframe
                  src={embedUrl}
                  title="Voorbeeld Ingesloten Kaart"
                  className="w-full rounded border border-[var(--border-subtle)]"
                  style={{ height: '360px' }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-dim)]">
              Ondersteunt responsieve weergave (100% breedte) en iframe sandbox
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[5px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] font-semibold text-xs transition-colors cursor-pointer border border-[var(--border-subtle)]"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
