import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  loadBekendmakingenFromDisk,
  run24HourScrapeAndEvaluationCycle,
  getAllBekendmakingen,
  getBekendmakingById,
  scrapeCycleStatus,
} from './src/server/bekendmakingenService';
import { exportBekendmakingenToCSV, filterBekendmakingen, INITIAL_BEKENDMAKING_FILTER } from './src/types/bekendmakingen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize data from disk or seed
loadBekendmakingenFromDisk();

// Schedule automated 24-hour scrape and physical classification cycle
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  console.log('[Scheduler] Executing scheduled 24-hour Bekendmakingen evaluation cycle...');
  run24HourScrapeAndEvaluationCycle().catch((err) => {
    console.error('[Scheduler] 24h cycle error:', err);
  });
}, TWENTY_FOUR_HOURS_MS);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // 1. Get all Bekendmakingen with 24-hour cycle status and statistics
  app.get('/api/bekendmakingen', (_req, res) => {
    const all = getAllBekendmakingen();
    const physical = all.filter((b) => b.isFysiek && b.lat !== null && b.lng !== null);
    const nonPhysical = all.filter((b) => !b.isFysiek || b.lat === null);

    res.json({
      source: 'Officiële Bekendmakingen (Overheid.nl / Gemeenteblad Steenwijkerland)',
      gemeente: 'Steenwijkerland (Gemeentecode 1708)',
      cycleStatus: scrapeCycleStatus,
      totalCount: all.length,
      physicalCount: physical.length,
      nonPhysicalCount: nonPhysical.length,
      items: all,
    });
  });

  // 2. Get single Bekendmaking detail
  app.get('/api/bekendmakingen/:id', (req, res) => {
    const id = String(req.params.id || '').trim();
    const item = getBekendmakingById(id);
    if (!item) {
      res.status(404).json({ error: 'Bekendmaking niet gevonden' });
      return;
    }
    res.json({ item });
  });

  // 3. Trigger 24-hour scrape and physical classification cycle on demand
  app.post('/api/bekendmakingen/scan', async (_req, res) => {
    try {
      const result = await run24HourScrapeAndEvaluationCycle();
      const all = getAllBekendmakingen();
      res.json({
        ok: true,
        result,
        cycleStatus: scrapeCycleStatus,
        items: all,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Fout tijdens 24-uurs scan' });
    }
  });

  // 4. Export Bekendmakingen to CSV
  app.get('/api/bekendmakingen/export.csv', (req, res) => {
    const onlyPhysical = req.query.onlyPhysical === 'true';
    const kern = String(req.query.kern || '').trim();
    const all = getAllBekendmakingen();

    const filtered = filterBekendmakingen(all, {
      ...INITIAL_BEKENDMAKING_FILTER,
      onlyPhysical,
      selectedKern: kern,
    });

    const csv = exportBekendmakingenToCSV(filtered);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="bekendmakingen_steenwijkerland_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Bestuurlijke Bekendmakingenkaart running on http://localhost:${PORT}`);
    // Run initial scan cycle in background on startup
    run24HourScrapeAndEvaluationCycle().catch(() => {});
  });
}

startServer();
