import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bekendmaking,
  BekendmakingFilterState,
  INITIAL_BEKENDMAKING_FILTER,
  ScrapeCycleStatus,
  filterBekendmakingen,
  exportBekendmakingenToCSV,
} from './types/bekendmakingen';
import { TopNavbar } from './components/TopNavbar';
import { MapComponent } from './components/MapComponent';
import { BekendmakingFilterPanel } from './components/BekendmakingFilterPanel';
import { BekendmakingDetailModal } from './components/BekendmakingDetailModal';
import { BekendmakingenDashboard } from './components/BekendmakingenDashboard';
import { EmbedDataproductModal } from './components/EmbedDataproductModal';
import { YearSliderAndMonthlyChart } from './components/YearSliderAndMonthlyChart';
import { KernStatistiekenModal } from './components/KernStatistiekenModal';
import './firebase';
import { Clock, MapPin, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [bekendmakingen, setBekendmakingen] = useState<Bekendmaking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedKernStat, setSelectedKernStat] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<ScrapeCycleStatus>({
    lastScannedAt: new Date().toISOString(),
    nextScheduledScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isScanning: false,
    totalCount: 0,
    physicalCount: 0,
    nonPhysicalCount: 0,
    geolocatedCount: 0,
    lastStatus: 'Laden...',
  });

  const [filters, setFilters] = useState<BekendmakingFilterState>(INITIAL_BEKENDMAKING_FILTER);
  const [selectedItem, setSelectedItem] = useState<Bekendmaking | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    ts: number;
  } | null>(null);

  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    const embedded =
      params.get('embed') === 'true' ||
      params.get('widget') === 'true' ||
      window.self !== window.top;
    if (embedded && window.innerWidth < 900) return false;
    return window.innerWidth >= 1024;
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  const isEmbed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('embed') === 'true' ||
      params.get('widget') === 'true' ||
      window.self !== window.top
    );
  }, []);

  // Fetch Bekendmakingen from backend
  const fetchBekendmakingen = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bekendmakingen');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setBekendmakingen(data.items);
        }
        if (data.cycleStatus) {
          setCycleStatus(data.cycleStatus);
        }
      }
    } catch (e) {
      console.warn('Error fetching bekendmakingen:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBekendmakingen();
  }, [fetchBekendmakingen]);

  // Trigger on-demand 24-hour scan cycle
  const handleTriggerScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/bekendmakingen/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setBekendmakingen(data.items);
        }
        if (data.cycleStatus) {
          setCycleStatus(data.cycleStatus);
        }
      }
    } catch (e) {
      console.warn('Error triggering 24h scan:', e);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Filtered items based on filter state
  const filteredBekendmakingen = useMemo(() => {
    return filterBekendmakingen(bekendmakingen, filters);
  }, [bekendmakingen, filters]);

  // Handle fly to target with close-up building zoom (level 18)
  const handleFlyTo = useCallback((lat: number, lng: number, zoom = 18) => {
    setFlyToTarget({ lat, lng, zoom, ts: Date.now() });
  }, []);

  // Handle CSV export
  const handleExportCSV = useCallback(() => {
    const csv = exportBekendmakingenToCSV(filteredBekendmakingen);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bekendmakingen_steenwijkerland_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredBekendmakingen]);

  // Close modals on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setSelectedKernStat(null);
        setIsDashboardOpen(false);
        setIsCycleModalOpen(false);
        setIsEmbedModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const physicalCount = useMemo(
    () => bekendmakingen.filter((b) => b.isFysiek && b.lat && b.lng).length,
    [bekendmakingen]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] font-sans antialiased">
      {/* Top Navigation Bar */}
      <TopNavbar
        showFilterPanel={showFilterPanel}
        onToggleFilterPanel={() => setShowFilterPanel((prev) => !prev)}
        onOpenCycleModal={() => setIsCycleModalOpen(true)}
        onOpenAuditModal={() => setIsDashboardOpen(true)}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
        onExportCSV={handleExportCSV}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        cycleStatus={cycleStatus}
        physicalCount={physicalCount}
        totalCount={bekendmakingen.length}
        isEmbed={isEmbed}
      />

      {/* Main View Area: Sidebar + Map */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Filter Panel (Slide-in / Expandable) */}
        {showFilterPanel && (
          <BekendmakingFilterPanel
            items={bekendmakingen}
            filteredItems={filteredBekendmakingen}
            filters={filters}
            onUpdateFilters={setFilters}
            onResetFilters={() => setFilters(INITIAL_BEKENDMAKING_FILTER)}
            onSelectBekendmaking={(item) => setSelectedItem(item)}
            selectedId={selectedItem?.id || null}
            onFlyTo={handleFlyTo}
            onClose={() => setShowFilterPanel(false)}
            onSelectKernStat={(kern) => setSelectedKernStat(kern)}
          />
        )}

        {/* Map View Area */}
        <section className="flex-1 relative h-full w-full">
          <MapComponent
            items={filteredBekendmakingen}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItem(item)}
            onToggleFilterPanel={() => setShowFilterPanel((prev) => !prev)}
            showFilterPanel={showFilterPanel}
            flyToTarget={flyToTarget}
            onOpenCycleModal={() => setIsCycleModalOpen(true)}
            onSelectKern={(kern) => setSelectedKernStat(kern)}
          />

          {/* Year Slider and Monthly Bar Chart Docked on Map */}
          <div className="absolute bottom-16 sm:bottom-20 left-3 right-3 sm:right-auto sm:w-[520px] md:w-[580px] z-[510] pointer-events-auto">
            <YearSliderAndMonthlyChart
              items={bekendmakingen}
              filters={filters}
              onUpdateFilters={setFilters}
              onSelectKernStat={(kern) => setSelectedKernStat(kern)}
            />
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute top-4 right-4 z-[500] px-3 py-1.5 rounded-[5px] bg-[var(--bg-card)]/90 backdrop-blur-xs border border-[var(--border-subtle)] text-xs text-[var(--accent-gold)] flex items-center gap-2 shadow-xl">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Bekendmakingen laden...</span>
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal for Selected Publication */}
      {selectedItem && (
        <BekendmakingDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCenterMap={(lat, lng) => handleFlyTo(lat, lng, 16)}
          onSelectKern={(kern) => {
            setSelectedItem(null);
            setSelectedKernStat(kern);
          }}
        />
      )}

      {/* Plaats / Kern Statistieken Modal */}
      {selectedKernStat && (
        <KernStatistiekenModal
          kernName={selectedKernStat}
          items={bekendmakingen}
          selectedYear={filters.selectedJaargang}
          onClose={() => setSelectedKernStat(null)}
          onSelectBekendmaking={(item) => {
            setSelectedItem(item);
            setSelectedKernStat(null);
          }}
          onFilterByKern={(kern) => {
            setFilters((prev) => ({ ...prev, selectedKern: kern }));
            setSelectedKernStat(null);
          }}
          onCenterMap={(lat, lng, zoom = 14) => {
            handleFlyTo(lat, lng, zoom);
          }}
        />
      )}

      {/* 24-Uurs Cyclus & Audit Dashboard */}
      <BekendmakingenDashboard
        isOpen={isDashboardOpen || isCycleModalOpen}
        onClose={() => {
          setIsDashboardOpen(false);
          setIsCycleModalOpen(false);
        }}
        items={bekendmakingen}
        cycleStatus={cycleStatus}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        onSelectBekendmaking={(item) => {
          setSelectedItem(item);
          setIsDashboardOpen(false);
          setIsCycleModalOpen(false);
          if (item.lat && item.lng) {
            handleFlyTo(item.lat, item.lng, 16);
          }
        }}
      />

      {/* Embed Modal */}
      <EmbedDataproductModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </div>
  );
}
