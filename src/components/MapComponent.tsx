import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bekendmaking, getRubriekMeta } from '../types/bekendmakingen';
import {
  STEENWIJKERLAND_BOUNDS,
  STEENWIJKERLAND_POLYGON,
  STEENWIJKERLAND_KERNEN,
  isPointInSteenwijkerland,
} from '../data/steenwijkerland';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface MapComponentProps {
  items: Bekendmaking[];
  selectedItem: Bekendmaking | null;
  onSelectItem: (item: Bekendmaking | null) => void;
  onToggleFilterPanel: () => void;
  showFilterPanel: boolean;
  flyToTarget: { lat: number; lng: number; zoom: number; ts: number } | null;
  onOpenCycleModal: () => void;
  onSelectKern?: (kern: string) => void;
}

type TileLayerKey = 'osm' | 'opentopo' | 'satellite';

const TILE_LAYERS: Record<
  TileLayerKey,
  { name: string; url: string; attribution: string; maxZoom: number }
> = {
  osm: {
    name: 'OpenStreetMap (Standaard)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Gemeente Steenwijkerland',
    maxZoom: 19,
  },
  opentopo: {
    name: 'OpenTopoMap (Topografie)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satellite: {
    name: 'Luchtfoto / Satelliet (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics',
    maxZoom: 18,
  },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onToggleFilterPanel,
  showFilterPanel,
  flyToTarget,
  onOpenCycleModal,
  onSelectKern,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedHighlightLayerRef = useRef<L.LayerGroup | null>(null);
  const kernenLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const municipalityOutlineRef = useRef<L.Polygon | null>(null);

  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerKey>('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const onSelectItemRef = useRef(onSelectItem);
  useEffect(() => {
    onSelectItemRef.current = onSelectItem;
  }, [onSelectItem]);

  const onSelectKernRef = useRef(onSelectKern);
  useEffect(() => {
    onSelectKernRef.current = onSelectKern;
  }, [onSelectKern]);

  // Initialize Map with exterior black mask
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [STEENWIJKERLAND_BOUNDS.center.lat, STEENWIJKERLAND_BOUNDS.center.lng],
      zoom: STEENWIJKERLAND_BOUNDS.defaultZoom,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: false,
      preferCanvas: true,
    });

    mapInstanceRef.current = map;

    // Custom Panes
    const kernenPane = map.createPane('kernenPane');
    kernenPane.style.zIndex = '415';

    const markersPane = map.createPane('bekendmakingenPane');
    markersPane.style.zIndex = '420';

    const highlightPane = map.createPane('selectedHighlightPane');
    highlightPane.style.zIndex = '430';
    highlightPane.style.pointerEvents = 'none';

    // Outer mask pane: pitch black exterior outside Gemeente Steenwijkerland
    const maskPane = map.createPane('exteriorBlackMaskPane');
    maskPane.style.zIndex = '450';
    maskPane.style.pointerEvents = 'none';

    const maskSvgRenderer = L.svg({ pane: 'exteriorBlackMaskPane' });

    // Base Tile Layer
    const tileConfig = TILE_LAYERS[activeTileLayer];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Inverted world polygon with hole = STEENWIJKERLAND_POLYGON
    const outerWorldRing: [number, number][] = [
      [-90, -180],
      [-90, 180],
      [90, 180],
      [90, -180],
    ];

    L.polygon([outerWorldRing, STEENWIJKERLAND_POLYGON], {
      renderer: maskSvgRenderer,
      pane: 'exteriorBlackMaskPane',
      stroke: true,
      color: '#437257',
      weight: 2.2,
      opacity: 1,
      fillColor: '#060e0a',
      fillOpacity: 1,
      interactive: false,
    }).addTo(map);

    // Reference polygon of Steenwijkerland boundary
    const municipalityOutline = L.polygon(STEENWIJKERLAND_POLYGON, {
      stroke: false,
      fill: false,
      interactive: false,
    }).addTo(map);
    municipalityOutlineRef.current = municipalityOutline;

    kernenLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    selectedHighlightLayerRef.current = L.layerGroup().addTo(map);

    try {
      const bounds = municipalityOutline.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch {
      // ignore
    }

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    if (mapContainerRef.current) {
      ro.observe(mapContainerRef.current);
    }

    return () => {
      ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileConfig = TILE_LAYERS[activeTileLayer];
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  }, [activeTileLayer]);

  // Render Kern Badges on the Map
  useEffect(() => {
    const layer = kernenLayerGroupRef.current;
    if (!layer) return;

    layer.clearLayers();

    STEENWIJKERLAND_KERNEN.forEach((kern) => {
      const count = items.filter(
        (i) => i.kern.toLowerCase() === kern.name.toLowerCase()
      ).length;

      const html = `
        <div class="px-2 py-0.5 rounded-full bg-[#060e0a]/90 hover:bg-emerald-950/95 border border-emerald-500/50 hover:border-amber-400 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 select-none group">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-amber-400"></span>
          <span>${kern.name}</span>
          <span class="text-[9px] font-mono px-1 rounded-full bg-emerald-500/25 text-emerald-300 font-bold">${count}</span>
        </div>
      `;

      const kernIcon = L.divIcon({
        className: 'kern-map-pill-icon',
        html,
        iconSize: [0, 0],
      });

      const marker = L.marker([kern.lat, kern.lng], {
        icon: kernIcon,
        pane: 'kernenPane',
        interactive: true,
      });

      marker.bindTooltip(
        `<div class="text-xs text-white">
          <div class="font-bold text-amber-300">${kern.name}</div>
          <div class="text-[11px] text-slate-300">${count} bekendmakingen</div>
          <div class="text-[10px] text-emerald-400 mt-0.5">Klik voor uitgebreide plaats-statistieken</div>
        </div>`,
        { direction: 'top', offset: [0, -14] }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectKernRef.current?.(kern.name);
      });

      layer.addLayer(marker);
    });
  }, [items]);

  // Render Fysieke Bekendmakingen Markers
  useEffect(() => {
    const layer = markersLayerGroupRef.current;
    if (!layer) return;

    layer.clearLayers();

    // Only plot physical announcements with valid coordinates inside Steenwijkerland
    const physical = items.filter(
      (b) =>
        b.isFysiek &&
        b.lat !== null &&
        b.lng !== null &&
        isPointInSteenwijkerland(b.lat, b.lng)
    );

    for (const b of physical) {
      const isSelected = selectedItem?.id === b.id;
      const meta = getRubriekMeta(b.rubriek);

      // SVG Icon Pin
      let iconSvg = '';
      if (meta.iconType === 'traffic') {
        // Car / Traffic icon
        iconSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.2V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
      } else if (meta.iconType === 'building') {
        // Building / House icon
        iconSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`;
      } else if (meta.iconType === 'leaf') {
        // Environment / Leaf icon
        iconSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-.3 4.8-.8 7.3-3.2 11.8A7 7 0 0 1 11 20z"/><path d="m2 21 9-9"/></svg>`;
      } else {
        // Map / Spatial icon
        iconSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>`;
      }

      const html = `
        <div class="relative flex flex-col items-center cursor-pointer pointer-events-auto transition-transform hover:scale-115 ${
          isSelected ? 'scale-110' : ''
        }">
          <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
            isSelected
              ? 'ring-4 ring-amber-400'
              : 'ring-2 ring-black/50'
          }" style="background-color: ${meta.colorHex}; color: #060e0a;">
            ${iconSvg}
          </div>
          <div class="w-0 h-0 border-x-[4px] border-x-transparent border-t-[6px] -mt-[1px]" style="border-top-color: ${meta.colorHex};"></div>
          <div class="w-1 h-1 rounded-full bg-white ring-1 ring-black -mt-[1px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'bekendmaking-map-pin',
        html,
        iconSize: [28, 36],
        iconAnchor: [14, 35],
        tooltipAnchor: [0, -32],
      });

      const marker = L.marker([b.lat!, b.lng!], {
        icon: customIcon,
        pane: 'bekendmakingenPane',
        interactive: true,
      });

      // Hover Tooltip with exact BAG verification badge
      marker.bindTooltip(
        `<div class="text-xs text-[#f5f6f4] tabular-nums max-w-[270px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-[10px] uppercase tracking-wider" style="color: ${meta.colorHex}">
              ${meta.shortLabel}
            </span>
            <span class="text-[10px] text-[#9bb0a4] font-mono">${b.datumDisplay}</span>
          </div>
          <div class="font-bold text-white line-clamp-2 leading-snug mb-1">
            ${b.title}
          </div>
          ${b.adres ? `<div class="text-[11px] text-[#fbbf24] font-semibold flex items-center gap-1">📍 ${b.adres}</div>` : ''}
          <div class="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            ✓ Exacte BAG-locatie (Kadaster)
          </div>
        </div>`,
        { direction: 'top', offset: [0, -22] }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectItemRef.current(b);
      });

      layer.addLayer(marker);
    }
  }, [items, selectedItem]);

  // Selected Item Pulse Highlight Ring
  useEffect(() => {
    const selLayer = selectedHighlightLayerRef.current;
    if (!selLayer) return;

    selLayer.clearLayers();
    if (!selectedItem || selectedItem.lat === null || selectedItem.lng === null) return;

    const meta = getRubriekMeta(selectedItem.rubriek);

    const outerRing = L.circleMarker([selectedItem.lat, selectedItem.lng], {
      pane: 'selectedHighlightPane',
      radius: 20,
      color: meta.colorHex,
      weight: 2.5,
      opacity: 0.9,
      fillColor: meta.colorHex,
      fillOpacity: 0.2,
      interactive: false,
    });

    selLayer.addLayer(outerRing);
  }, [selectedItem]);

  // Respond to flyToTarget
  useEffect(() => {
    if (!flyToTarget || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom, {
      duration: 1.0,
    });
  }, [flyToTarget]);

  const resetToMunicipality = () => {
    if (!mapInstanceRef.current) return;
    if (municipalityOutlineRef.current) {
      const bounds = municipalityOutlineRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.flyToBounds(bounds, {
          padding: [20, 20],
          duration: 1.0,
        });
        return;
      }
    }
    mapInstanceRef.current.flyTo(
      [STEENWIJKERLAND_BOUNDS.center.lat, STEENWIJKERLAND_BOUNDS.center.lng],
      STEENWIJKERLAND_BOUNDS.defaultZoom,
      { duration: 1.0 }
    );
  };

  const physicalCount = items.filter((b) => b.isFysiek && b.lat && b.lng).length;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#060e0a] tabular-nums">
      <div
        ref={mapContainerRef}
        className="w-full h-full bg-[#060e0a]"
        id="map"
      />

      {/* Top-Left Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-[500] flex flex-col gap-2 max-w-full">
        <div className="flex items-center gap-1 bg-[var(--bg-card)]/95 backdrop-blur-xs p-1 rounded-[6px] border border-[var(--border-subtle)] shadow-2xl text-[var(--text-main)] overflow-x-auto no-scrollbar">
          {/* Toggle Filter Panel */}
          <button
            type="button"
            onClick={onToggleFilterPanel}
            className={`px-2.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              showFilterPanel
                ? 'bg-[var(--bg-elevated)] text-[var(--accent-gold-bright)] border border-[var(--border-focus)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Filters</span>
          </button>

          <div className="w-[1px] h-4 bg-[var(--border-subtle)] shrink-0" />

          {/* Fysieke Bekendmakingen Pin Count Indicator */}
          <div className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 rounded-[4px] border border-emerald-500/30 whitespace-nowrap shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fysieke Bekendmakingen ({physicalCount})</span>
          </div>

          <div className="w-[1px] h-4 bg-[var(--border-subtle)] shrink-0" />

          {/* 24-uurs cyclus shortcut */}
          <button
            type="button"
            onClick={onOpenCycleModal}
            className="px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            title="Informatie over de actieve 24-uurs evaluatiecyclus"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>24u Cyclus</span>
          </button>

          <div className="w-[1px] h-4 bg-[var(--border-subtle)] shrink-0" />

          {/* Basemap Switcher */}
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] rounded-[4px] transition-colors cursor-pointer shrink-0"
            title="Basiskaart wijzigen"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {showLayerMenu && (
          <div className="w-60 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[6px] shadow-2xl p-1.5 z-50 text-xs">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
              Basiskaart (Buiten grens zwart)
            </div>
            {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTileLayer(key);
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-[4px] transition-colors flex items-center justify-between cursor-pointer ${
                  activeTileLayer === key
                    ? 'bg-[var(--accent-gold)] text-[#060e0a] font-bold'
                    : 'text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <span>{TILE_LAYERS[key].name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom-Left Legend & Quick Kern Jump Bar */}
      <div className="absolute bottom-3 left-3 z-[500] flex flex-col gap-2 max-w-[calc(100%-90px)]">
        {/* Legend */}
        <div className="bg-[var(--bg-card)]/95 backdrop-blur-xs border border-[var(--border-subtle)] rounded-[6px] px-3 py-2 shadow-xl flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-main)]">
          <span className="font-display font-bold text-[var(--text-muted)]">
            Legenda:
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-black/50 inline-block" />
            <span>Verkeersbesluit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#10b981] border border-black/50 inline-block" />
            <span>Omgevingsvergunning</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#06b6d4] border border-black/50 inline-block" />
            <span>Omgevingsmelding</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#a855f7] border border-black/50 inline-block" />
            <span>Ruimtelijk plan</span>
          </span>

          <span className="hidden md:flex items-center gap-1 pl-2 border-l border-[var(--border-subtle)] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>24u Cyclus Actief</span>
          </span>
        </div>

        {/* Quick Kern Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-[var(--bg-card)]/95 backdrop-blur-xs p-1 rounded-[6px] border border-[var(--border-subtle)] shadow-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={resetToMunicipality}
            className="px-2 py-1 rounded-[4px] text-[11px] font-semibold bg-[var(--bg-elevated)] text-[var(--accent-gold-bright)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer whitespace-nowrap"
          >
            Hele Gemeente
          </button>
          {STEENWIJKERLAND_KERNEN.slice(0, 8).map((kern) => {
            const kernCount = items.filter(
              (i) => i.kern.toLowerCase() === kern.name.toLowerCase()
            ).length;
            return (
              <button
                key={kern.name}
                type="button"
                onClick={() => {
                  mapInstanceRef.current?.flyTo([kern.lat, kern.lng], kern.zoom, {
                    duration: 1.0,
                  });
                  onSelectKernRef.current?.(kern.name);
                }}
                className="px-2 py-1 rounded-[4px] text-[11px] font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                title={`Toon statistieken & focus op ${kern.name}`}
              >
                <span>{kern.name}</span>
                <span className="text-[9px] font-mono opacity-70">({kernCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom-Right Zoom Controls */}
      <div className="absolute bottom-6 right-3 z-[500] flex flex-col gap-1 bg-[var(--bg-card)]/95 backdrop-blur-xs p-1 rounded-[6px] border border-[var(--border-subtle)] shadow-2xl">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] rounded-[4px] transition-colors cursor-pointer"
          title="Inzoomen"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-[1px] bg-[var(--border-subtle)]" />
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] rounded-[4px] transition-colors cursor-pointer"
          title="Uitzoomen"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-[1px] bg-[var(--border-subtle)]" />
        <button
          type="button"
          onClick={resetToMunicipality}
          className="p-2 text-[var(--accent-gold-bright)] hover:bg-[var(--bg-card-hover)] rounded-[4px] transition-colors cursor-pointer"
          title="Toon hele Gemeente Steenwijkerland"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
