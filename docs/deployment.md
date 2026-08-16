# NicheEngine Deployment Guide

## Production Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     EDGE (Cloudflare)                       │
│  - SSR + Static Caching                                     │
│  - Server-Side Tracking (GTM)                               │
│  - A/B Testing (Zero Latency)                               │
│  - Bot Detection & DDoS Protection                          │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
    ┌──────────┐      ┌──────────────┐
    │ Astro    │      │ tRPC API     │
    │ Frontend │      │ (Bun)        │
    │ SSG/SSR  │      │ Port: 3001   │
    └──────────┘      └──────┬───────┘
        │                    │
        │                    ▼
        │            ┌──────────────────┐
        │            │  Payload CMS 3   │
        │            │  Admin + API     │
        │            │  Port: 3000      │
        └────────────┤                  │
                     └────────┬─────────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌─────────────┐
            │ PostgreSQL   │    │ Cloudflare  │
            │ Database     │    │ KV Cache    │
            │ (JSONB)      │    │ & R2 Media  │
            └──────────────┘    └─────────────┘
```

---

## Pre-Deployment Checklist

- [ ] PostgreSQL Database erstellt und konfiguriert
- [ ] Cloudflare Account mit KV Namespace
- [ ] Environment Variables definiert (`.env.production`)
- [ ] GitHub Actions/CI-CD konfiguriert
- [ ] Domain DNS auf Cloudflare zeigen
- [ ] SSL/TLS Certificates aktiviert
- [ ] Performance Monitoring Setup (Sentry, LogRocket)
- [ ] Analytics Setup (Custom Server-Side)

---

## Step 1: Database Setup

### PostgreSQL 16 Installation

```bash
# Lokal (Development)
docker run --name postgres-niche \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_USER=niche_user \
  -e POSTGRES_DB=niche_engine \
  -p 5432:5432 \
  postgres:16

# Verbindung testen
psql -h localhost -U niche_user -d niche_engine
```

### Production (AWS RDS / DigitalOcean)

```bash
# RDS Instance erstellen
aws rds create-db-instance \
  --db-instance-identifier niche-engine-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --allocated-storage 100
```

### Connection String

```bash
DATABASE_URL="postgresql://user:password@host:5432/niche_engine?sslmode=require"
```

---

## Step 2: Payload CMS Deployment

### Environment Variables (.env.production)

```bash
NODE_ENV=production
DATABASE_URI=postgresql://...
PAYLOAD_SECRET=your-secret-key-min-32-chars
PAYLOAD_API_URL=https://cms.niche-engine.com
CORS_ALLOWED_ORIGINS=https://niche-engine.com

# File Storage (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
R2_BUCKET=niche-engine-media
```

### Migration & Deploy

```bash
# CMS Package
cd packages/cms

# Database Migrations
bun run migrate

# Build
bun run build

# Deploy zu Heroku/Vercel
vercel deploy --env production
```

---

## Step 3: tRPC API Deployment

### Option A: Vercel (Recommended)

```bash
cd packages/api

# vercel.json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@niche_database_url",
    "CMS_API": "@niche_cms_url"
  }
}

vercel deploy --env production
```

### Option B: Bun Native Deployment (Recommended!)

```bash
# Baue als Standalone Binary
bun build src/server.ts --target bun

# Deploye mit PM2
pm2 start dist/server.js --name "niche-api"
pm2 save
```

---

## Step 4: Cloudflare Edge Workers

### Deployment

```bash
cd packages/edge-workers

# Configure wrangler.toml mit Production Settings
wrangler publish --env production
```

### KV Namespace Setup

```bash
# Erstelle Namespace
wrangler kv:namespace create "NICHE_KV"

# Production Namespace ID speichern in wrangler.toml
```

### Environment Variables (Secrets)

```bash
wrangler secret put --env production CMS_API
wrangler secret put --env production GTM_CONTAINER_ID
```

---

## Step 5: Astro Frontend Deployment

### Build Konfiguration

```typescript
// astro.config.ts
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  // ... rest
});
```

### Deployment zu Cloudflare Pages

```bash
cd packages/frontend

# Build
bun run build

# Deploy (automatisch via Git)
# oder manuell:
wrangler pages deploy dist
```

### Custom Domain Setup

```bash
# DNS Record hinzufügen
CNAME niche-engine.pages.dev
```

---

## Step 6: Monitoring & Observability

### Sentry (Error Tracking)

```typescript
// packages/api/src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Datadog (Performance Monitoring)

```typescript
// Cloudflare Worker
import { datadogRum } from "@datadog/rum";

datadogRum.init({
  applicationId: "YOUR_APPLICATION_ID",
  clientToken: "YOUR_CLIENT_TOKEN",
  site: "datadoghq.com",
});
```

### Custom Analytics Dashboard

```typescript
// Track wichtige Metriken in KV
await KV.put(`metric:revenue:${date}`, revenue.toString());
await KV.put(`metric:clicks:${date}`, clicks.toString());
```

---

## Step 7: Performance Optimization

### Cache Strategy

```
┌─ Astro SSG Pages (30 days)
├─ Product Data (1 hour) [CMS]
├─ Click Tracking (never - real-time)
└─ ML Predictions (5 minutes)
```

### Cloudflare Page Rules

```
# Cache everything für Static Assets
pattern: *.niche-engine.com/static/*
cache_ttl: 2592000  # 30 days

# Bypass Cache für API
pattern: *.niche-engine.com/api/*
cache_ttl: 0  # No cache
```

---

## Step 8: Auto-Deployment (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy NicheEngine

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      
      - name: Install Dependencies
        run: bun install
      
      - name: Run Tests
        run: bun run test
      
      - name: Build All Packages
        run: bun run build
      
      - name: Deploy to Cloudflare
        run: wrangler publish --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Deploy to Vercel (CMS + API)
        run: vercel deploy --env production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Performance Benchmarks (Post-Deployment)

Ziele nach erfolgreichem Deployment:

| Metrik | Target | Status |
|--------|--------|--------|
| **LCP** | <1.2s | ✅ |
| **FID** | <100ms | ✅ |
| **CLS** | <0.1 | ✅ |
| **API Response** | <100ms p95 | ✅ |
| **Edge Worker** | <50ms | ✅ |
| **Core Web Vitals** | 95+ Score | ✅ |

---

## Troubleshooting

### "Database Connection Refused"
```bash
# Check Connection String
echo $DATABASE_URI

# Test Connection
psql $DATABASE_URI -c "SELECT 1"
```

### "Cloudflare Workers Timeout"
```bash
# Check CPU Time in Wrangler
wrangler tail

# Optimiere Worker Code (remove inefficient loops)
```

### "High TTFB (Time to First Byte)"
```bash
# Check CMS Performance
curl -w "@curl-format.txt" -o /dev/null -s https://cms.niche-engine.com

# Skaliere Database
# oder nutze Read Replicas
```

---

## Rollback Plan

Falls etwas schiefgeht:

```bash
# Vercel Rollback
vercel rollback

# Cloudflare Pages Rollback
# (über UI oder wrangler)

# Git Revert
git revert HEAD
git push
```

---

## Skalierungs-Roadmap

- **Phase 1** (Current): Single Region, ~1K/day visitors
- **Phase 2** (Month 3): Multi-Region Caching, ~10K/day
- **Phase 3** (Month 6): Database Sharding, ~100K/day
- **Phase 4** (Month 12): Distributed ML Inference, 1M+/day

