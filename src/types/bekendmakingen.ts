export type RubriekKey =
  | 'verkeersbesluit of -mededeling'
  | 'omgevingsvergunning'
  | 'omgevingsmelding'
  | 'ruimtelijk plan of omgevingsdocument'
  | 'evenementenvergunning'
  | 'algemeen verbindend voorschrift (verordening)'
  | 'beleidsregel'
  | 'delegatie- of mandaatbesluit'
  | 'andere vergunning'
  | 'andere melding'
  | 'ander besluit van algemene strekking'
  | 'overige';

export interface Bekendmaking {
  id: string; // e.g. 'gmb-2026-487684'
  identifier: string; // 'gmb-2026-487684'
  title: string; // 'Gemeente Steenwijkerland – Verplaatsen algemene gehandicaptenparkeerplaats Weemstraat – Steenwijk'
  subtitle: string;
  rubriek: string; // 'verkeersbesluit of -mededeling', 'omgevingsvergunning', etc.
  categorie?: string; // 'Verkeer | Organisatie en beleid'
  organisatie: string; // 'Steenwijkerland'
  publicatiedatum: string; // ISO string '2026-10-27'
  datumDisplay: string; // '27-10-2026'
  jaargang: number; // 2026
  publicatienummer: string; // '487684'
  jaargangEnNummer: string; // 'Gemeenteblad 2026, 487684'
  
  // Physical announcement classification (24-uurs evaluatie)
  isFysiek: boolean;
  fysiekeToelichting: string;
  omgevingsactiviteit?: string;
  verkeersbordcode?: string;
  wegcategorie?: string;
  weggebruiker?: string;

  // Geographic location in Gemeente Steenwijkerland
  adres?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  kern: string; // e.g. 'Steenwijk', 'Giethoorn', 'Oldemarkt'
  lat: number | null;
  lng: number | null;
  geolocated: boolean;

  // Official dossier and body details
  zaaknummer?: string;
  bevoegdGezag: string;
  aanhef?: string;
  overwegingen?: string[];
  besluitenLijst?: string[];
  situatieschetsAfbeelding?: string; // optional image attachment reference
  bezwaarInformatie?: {
    termijnWeken: number;
    postadres: string;
    digitaalUrl: string;
    voorlopigeVoorziening: boolean;
  };

  // Links to official source
  officieleUrl: string; // e.g. https://zoek.officielebekendmakingen.nl/gmb-2026-487684.html
  pdfUrl?: string; // e.g. https://zoek.officielebekendmakingen.nl/gmb-2026-487684.pdf

  // Metadata timestamps
  scrapedAt: string;
  lastEvaluatedAt: string;
}

export interface BekendmakingFilterState {
  searchQuery: string;
  onlyPhysical: boolean; // true = alleen fysieke bekendmakingen (kaartpins), false = inclusief niet-fysiek
  selectedRubrieken: string[];
  selectedActiviteiten: string[];
  selectedKern: string; // '' = alle kernen
  selectedJaargang: number | 'all'; // e.g. 2026
  selectedMonth: number | 'all'; // 1..12 or 'all'
  period: 'all' | 'today' | 'week' | 'month' | 'year';
}

export const INITIAL_BEKENDMAKING_FILTER: BekendmakingFilterState = {
  searchQuery: '',
  onlyPhysical: true,
  selectedRubrieken: [],
  selectedActiviteiten: [],
  selectedKern: '',
  selectedJaargang: 2026,
  selectedMonth: 'all',
  period: 'all',
};

export interface ScrapeCycleStatus {
  lastScannedAt: string;
  nextScheduledScanAt: string;
  isScanning: boolean;
  totalCount: number;
  physicalCount: number;
  nonPhysicalCount: number;
  geolocatedCount: number;
  lastStatus: string;
}

export interface RubriekMeta {
  label: string;
  shortLabel: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  iconType: 'traffic' | 'building' | 'leaf' | 'map' | 'calendar' | 'document' | 'gavel';
  defaultPhysical: boolean;
}

export function getRubriekMeta(rubriek: string): RubriekMeta {
  const r = (rubriek || '').toLowerCase();

  if (r.includes('verkeersbesluit') || r.includes('verkeer')) {
    return {
      label: 'Verkeersbesluit of -mededeling',
      shortLabel: 'Verkeersbesluit',
      colorHex: '#f59e0b', // Amber / Goud
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      iconType: 'traffic',
      defaultPhysical: true,
    };
  }

  if (r.includes('omgevingsvergunning')) {
    return {
      label: 'Omgevingsvergunning',
      shortLabel: 'Omgevingsvergunning',
      colorHex: '#10b981', // Emerald
      bgClass: 'bg-emerald-500/15',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      iconType: 'building',
      defaultPhysical: true,
    };
  }

  if (r.includes('omgevingsmelding')) {
    return {
      label: 'Omgevingsmelding (Bal)',
      shortLabel: 'Omgevingsmelding',
      colorHex: '#06b6d4', // Cyan
      bgClass: 'bg-cyan-500/15',
      textClass: 'text-cyan-400',
      borderClass: 'border-cyan-500/30',
      iconType: 'leaf',
      defaultPhysical: true,
    };
  }

  if (r.includes('ruimtelijk plan') || r.includes('omgevingsdocument') || r.includes('bestemmingsplan')) {
    return {
      label: 'Ruimtelijk plan / Omgevingsplan',
      shortLabel: 'Ruimtelijk plan',
      colorHex: '#a855f7', // Paars
      bgClass: 'bg-purple-500/15',
      textClass: 'text-purple-400',
      borderClass: 'border-purple-500/30',
      iconType: 'map',
      defaultPhysical: true,
    };
  }

  if (r.includes('evenement')) {
    return {
      label: 'Evenementenvergunning',
      shortLabel: 'Evenementenvergunning',
      colorHex: '#ec4899', // Pink
      bgClass: 'bg-pink-500/15',
      textClass: 'text-pink-400',
      borderClass: 'border-pink-500/30',
      iconType: 'calendar',
      defaultPhysical: true,
    };
  }

  if (r.includes('algemeen verbindend') || r.includes('verordening')) {
    return {
      label: 'Algemeen verbindend voorschrift',
      shortLabel: 'Verordening',
      colorHex: '#94a3b8', // Grijs
      bgClass: 'bg-slate-500/15',
      textClass: 'text-slate-300',
      borderClass: 'border-slate-500/30',
      iconType: 'gavel',
      defaultPhysical: false,
    };
  }

  if (r.includes('beleidsregel') || r.includes('mandaat') || r.includes('delegatie')) {
    return {
      label: 'Beleid & Mandaat',
      shortLabel: 'Beleidsregel',
      colorHex: '#64748b',
      bgClass: 'bg-slate-600/15',
      textClass: 'text-slate-400',
      borderClass: 'border-slate-600/30',
      iconType: 'document',
      defaultPhysical: false,
    };
  }

  return {
    label: rubriek || 'Overige bekendmaking',
    shortLabel: rubriek || 'Overige',
    colorHex: '#38bdf8',
    bgClass: 'bg-sky-500/15',
    textClass: 'text-sky-300',
    borderClass: 'border-sky-500/30',
    iconType: 'document',
    defaultPhysical: false,
  };
}

export function filterBekendmakingen(
  items: Bekendmaking[],
  filters: BekendmakingFilterState
): Bekendmaking[] {
  return items.filter((item) => {
    // 1. Only physical filter (only items plotted on the map)
    if (filters.onlyPhysical && (!item.isFysiek || !item.geolocated || item.lat === null || item.lng === null)) {
      return false;
    }

    // 2. Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.adres && item.adres.toLowerCase().includes(q)) ||
        (item.zaaknummer && item.zaaknummer.toLowerCase().includes(q)) ||
        item.identifier.toLowerCase().includes(q) ||
        item.publicatienummer.toLowerCase().includes(q) ||
        item.kern.toLowerCase().includes(q) ||
        (item.omgevingsactiviteit && item.omgevingsactiviteit.toLowerCase().includes(q)) ||
        (item.verkeersbordcode && item.verkeersbordcode.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 3. Rubriek filter
    if (filters.selectedRubrieken.length > 0) {
      if (!filters.selectedRubrieken.includes(item.rubriek)) {
        return false;
      }
    }

    // 4. Activiteit filter
    if (filters.selectedActiviteiten.length > 0) {
      if (!item.omgevingsactiviteit || !filters.selectedActiviteiten.includes(item.omgevingsactiviteit)) {
        return false;
      }
    }

    // 5. Kern filter
    if (filters.selectedKern && item.kern !== filters.selectedKern) {
      return false;
    }

    // 6. Jaargang filter
    if (filters.selectedJaargang !== 'all') {
      if (item.jaargang !== filters.selectedJaargang) {
        return false;
      }
    }

    // 6b. Month filter (1-12)
    if (filters.selectedMonth !== 'all') {
      const d = new Date(item.publicatiedatum);
      if (!isNaN(d.getTime())) {
        const itemMonth = d.getMonth() + 1;
        if (itemMonth !== filters.selectedMonth) {
          return false;
        }
      }
    }

    // 7. Time period filter
    if (filters.period !== 'all') {
      const itemDate = new Date(item.publicatiedatum).getTime();
      const now = new Date('2026-10-27T17:00:00Z').getTime(); // Reference current time
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);

      if (filters.period === 'today' && diffDays > 1.5) return false;
      if (filters.period === 'week' && diffDays > 7) return false;
      if (filters.period === 'month' && diffDays > 31) return false;
      if (filters.period === 'year' && diffDays > 365) return false;
    }

    return true;
  });
}

export function exportBekendmakingenToCSV(items: Bekendmaking[]): string {
  const headers = [
    'Identificatie',
    'JaargangEnNummer',
    'DatumPublicatie',
    'Rubriek',
    'Titel',
    'Ondertitel',
    'IsFysiekeBekendmaking',
    'FysiekeToelichting',
    'Omgevingsactiviteit',
    'Verkeersbordcode',
    'Adres',
    'Kern',
    'Breedtegraad (Lat)',
    'Lengtegraad (Lng)',
    'Zaaknummer',
    'BevoegdGezag',
    'OfficieleUrl',
    'PdfUrl',
  ];

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = items.map((b) => [
    escapeCSV(b.identifier),
    escapeCSV(b.jaargangEnNummer),
    escapeCSV(b.datumDisplay),
    escapeCSV(b.rubriek),
    escapeCSV(b.title),
    escapeCSV(b.subtitle),
    escapeCSV(b.isFysiek ? 'Ja' : 'Nee'),
    escapeCSV(b.fysiekeToelichting),
    escapeCSV(b.omgevingsactiviteit || ''),
    escapeCSV(b.verkeersbordcode || ''),
    escapeCSV(b.adres || ''),
    escapeCSV(b.kern),
    escapeCSV(b.lat ?? ''),
    escapeCSV(b.lng ?? ''),
    escapeCSV(b.zaaknummer || ''),
    escapeCSV(b.bevoegdGezag),
    escapeCSV(b.officieleUrl),
    escapeCSV(b.pdfUrl || ''),
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}
