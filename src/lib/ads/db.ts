import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve(process.cwd(), 'data', 'ads.json');

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch (e) {
    const initial = {
      ads: [],
      short_links: [],
      events: [],
      health_checks: []
    };
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function saveDb(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function now() {
  return new Date().toISOString();
}

export async function createShortLink({ target_url, ad_id = null, redirect_type = 302 }: { target_url: string; ad_id?: string | null; redirect_type?: number }) {
  const db = await ensureDb();
  const shortId = crypto.randomBytes(4).toString('hex');
  const entry = { short_id: shortId, target_url, ad_id, redirect_type, created_at: now() };
  db.short_links.push(entry);
  await saveDb(db);
  return entry;
}

export async function getShortLink(shortId: string) {
  const db = await ensureDb();
  return db.short_links.find((s: any) => s.short_id === shortId) || null;
}

export async function recordClick({ short_id, ad_id, meta = {} }: { short_id: string; ad_id: string | null; meta?: any }) {
  const db = await ensureDb();
  const ev = { id: crypto.randomUUID(), type: 'click', short_id, ad_id, meta, timestamp: now() };
  db.events.push(ev);
  await saveDb(db);
  return ev;
}

export async function recordImpression({ short_id, ad_id, meta = {} }: { short_id: string | null; ad_id: string | null; meta?: any }) {
  const db = await ensureDb();
  const ev = { id: crypto.randomUUID(), type: 'impression', short_id, ad_id, meta, timestamp: now() };
  db.events.push(ev);
  await saveDb(db);
  return ev;
}

export async function listAdsWithAggregates() {
  const db = await ensureDb();
  const ads = db.ads || [];
  const events = db.events || [];

  const aggregates = ads.map((ad: any) => {
    const adEvents = events.filter((e: any) => e.ad_id === ad.id || e.short_id === ad.short_id);
    const impressions = adEvents.filter((e: any) => e.type === 'impression').length;
    const clicks = adEvents.filter((e: any) => e.type === 'click').length;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    return {
      ...ad,
      impressions,
      clicks,
      ctr,
    };
  });

  // Include short links not tied to an ad
  const unattached = (db.short_links || []).filter((s: any) => !s.ad_id).map((s: any) => {
    const shortEvents = events.filter((e: any) => e.short_id === s.short_id);
    return {
      id: null,
      name: `(short:${s.short_id})`,
      short_id: s.short_id,
      target_url: s.target_url,
      impressions: shortEvents.filter((e: any) => e.type === 'impression').length,
      clicks: shortEvents.filter((e: any) => e.type === 'click').length,
      ctr: shortEvents.filter((e: any) => e.type === 'impression').length > 0 ?
        shortEvents.filter((e: any) => e.type === 'click').length / shortEvents.filter((e: any) => e.type === 'impression').length : 0
    };
  });

  return { ads: aggregates, unattached };
}

export async function ensureSampleData() {
  const db = await ensureDb();
  if ((db.ads || []).length > 0 || (db.short_links || []).length > 0) return;

  const sampleAd = {
    id: 'ad_001',
    name: 'Hero Banner - Acme Tee',
    group: 'homepage',
    creative_type: 'image',
    creative_url: 'https://via.placeholder.com/728x90.png?text=Acme+Tee',
    target_url: 'https://example.com/products/prod_001',
    short_id: 'acl1',
    active: true,
    weight: 10,
    start_at: null,
    end_at: null,
    created_at: now(),
  };

  db.ads.push(sampleAd);
  db.short_links.push({ short_id: 'acl1', target_url: sampleAd.target_url, ad_id: sampleAd.id, redirect_type: 302, created_at: now() });
  await saveDb(db);
}

export async function setHealthCheck(url: string, status: number, ok: boolean) {
  const db = await ensureDb();
  const existing = db.health_checks.find((h: any) => h.url === url);
  const entry = { url, last_status: status, broken: !ok, last_checked_at: now() };
  if (existing) {
    Object.assign(existing, entry);
  } else {
    db.health_checks.push(entry);
  }
  await saveDb(db);
  return entry;
}

export async function getHealthChecks() {
  const db = await ensureDb();
  return db.health_checks || [];
}
