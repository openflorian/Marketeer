# NicheEngine - Quick Start Guide

## Installation & Setup (5 minutes)

### Prerequisites

```bash
# Install Bun (Modern Runtime)
curl -fsSL https://bun.sh/install | bash

# Verify Installation
bun --version  # Should be 1.0+
```

### Clone & Install

```bash
# Clone Repository
git clone https://github.com/yourusername/niche-engine.git
cd Marketeer

# Install all dependencies
bun install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local

# Required variables:
DATABASE_URL=postgresql://user:password@localhost:5432/niche_engine
PAYLOAD_SECRET=your-secret-key-min-32-chars
CLOUDFLARE_API_TOKEN=your-cf-token
OPENAI_API_KEY=your-openai-key (for pSEO content generation)
```

---

## Development Startup

### Option 1: All Services in One Terminal (Recommended)

```bash
# Starts Frontend + CMS + API in Parallel
bun run dev

# Output:
# ✅ Frontend (Astro):    http://localhost:3000
# ✅ CMS (Payload):        http://localhost:3000/cms/admin
# ✅ API (tRPC):           http://localhost:3001
# ✅ Watching for changes...
```

### Option 2: Individual Services

```bash
# Terminal 1: Frontend
cd packages/frontend
bun run dev

# Terminal 2: CMS
cd packages/cms
bun run dev

# Terminal 3: API
cd packages/api
bun run dev
```

---

## First Steps

### 1. Access the Admin Dashboard

```
URL: http://localhost:3000/cms/admin
Login: admin@example.com / password
```

### 2. Create Some Products

CMS → Collections → Products

```json
{
  "title": "Test Keyboard Pro",
  "category": "hardware",
  "affiliateLinks": [
    {
      "network": "amazon-pa",
      "rawUrl": "https://amazon.com/dp/B0XXXXX?tag=your-tag",
      "subId": "test-placement"
    }
  ],
  "trendMetrics": {
    "trendScore": 75,
    "forecastGrowth": 1.5
  },
  "performanceData": {
    "epc": 3.45,
    "conversionRate": 2.5,
    "cookieDuration": 24
  }
}
```

### 3. View the Storefront

```
URL: http://localhost:3000
```

You should see:
- ✅ Dynamisches Schaufenster mit Produkten
- ✅ Gamification Daily Loot Crate
- ✅ AI Recommendation Zone
- ✅ Performance Metrics Dashboard

---

## Key Commands

### Build & Deployment

```bash
# Build all packages for production
bun run build

# Run performance audit
bun run analyze

# Deploy to Cloudflare (Frontend)
cd packages/frontend
wrangler pages deploy dist

# Deploy to Vercel (API)
cd packages/api
vercel deploy

# Deploy to Cloudflare Workers
cd packages/edge-workers
wrangler publish
```

### Database

```bash
# Run migrations
bun run db:migrate

# Seed test data
cd packages/cms
bun run seed

# Open database CLI
psql $DATABASE_URL
```

### pSEO Generation

```bash
# Generate pSEO pages
cd packages/pseo-engine
bun run generate

# Validate pSEO content
bun run validate

# Output: pSEO pages JSON
```

---

## Architecture Quick Reference

```
Frontend (Astro 5)
  ├─ Pages: src/pages/*.astro
  ├─ Components: src/components/*.tsx (Preact Islands)
  ├─ Layouts: src/layouts/Base.astro
  └─ Build: bun run build

API (tRPC + Bun)
  ├─ Routers: src/server.ts
  ├─ Procedures: affiliate, products, analytics
  └─ Database: PostgreSQL via Payload CMS

CMS (Payload 3)
  ├─ Collections: src/collections/*.ts
  ├─ Admin UI: /cms/admin
  └─ API: /cms/api/products, /cms/api/campaigns

Edge Workers (Cloudflare)
  ├─ Server-Side Tracking: /api/track
  ├─ A/B Testing: /test/:campaignId
  ├─ Predictive EPC: /edge/predict-epc
  └─ Cloaked Redirect: /go/:productId
```

---

## Debugging

### View Logs

```bash
# Frontend (Astro)
bun run dev packages/frontend

# API (tRPC)
DEBUG=* bun run dev packages/api

# CMS (Payload)
DEBUG=payload* bun run dev packages/cms

# Edge Workers
wrangler tail
```

### Inspect Database

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# View products
SELECT id, title, trendMetrics FROM products LIMIT 5;

# View clicks
SELECT productId, COUNT(*) as clicks FROM clicks GROUP BY productId;

# View performance
SELECT * FROM performance_metrics WHERE date = TODAY() LIMIT 10;
```

### Test API

```bash
# Use tRPC Devtools (in browser)
# http://localhost:3001/_next/data/trpc-devtools

# Or via curl
curl -X POST http://localhost:3001/trpc/products.list \
  -H "Content-Type: application/json" \
  -d '{"json":{"limit":5}}'
```

---

## Customization

### Change Branding

```typescript
// packages/frontend/src/pages/index.astro
- Update title, description
- Change color scheme (UnoCSS in uno.config.ts)
- Modify header/footer text
```

### Add Custom Components

```typescript
// Create new Preact island
// packages/frontend/src/components/MyComponent.tsx

export default function MyComponent() {
  return <div>Custom Component</div>;
}

// Use in Astro page with client:load
import MyComponent from '../components/MyComponent.tsx';
<MyComponent client:load />
```

### Add New Affiliate Network

```typescript
// packages/cms/src/collections/Products.ts
// Add to affiliateLinks array options:

{
  name: 'network',
  label: 'Network',
  type: 'select',
  options: [
    { label: 'Amazon PA-API', value: 'amazon-pa' },
    { label: 'AWIN', value: 'awin' },
    { label: 'YOUR_NETWORK', value: 'your_network' }, // ← Add here
  ],
}

// Then update API router to handle new network
// packages/api/src/server.ts → selectBestAffiliateNetwork()
```

---

## Performance Tips

### 1. Optimize Images

```bash
# Cloudflare R2 automatically optimizes
# But you can also pre-optimize:

npx sharp convert-all ./public/images --output-dir ./public/images-optimized --format webp
```

### 2. Cache Strategy

```typescript
// Edit cache headers in astro.config.ts
export default defineConfig({
  server: {
    headers: {
      // Cache static assets
      '*.js': 'public, max-age=31536000', // 1 year
      '*.css': 'public, max-age=31536000',
      // Don't cache HTML
      '*.html': 'no-cache',
    }
  }
});
```

### 3. Database Queries

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_products_trend ON products((trendMetrics->>'trendScore'));
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_clicks_productId ON clicks(productId);
CREATE INDEX idx_clicks_date ON clicks(date);
```

---

## Deployment Checklist

Before going to production:

- [ ] Database migration completed
- [ ] All environment variables set
- [ ] Performance audit passed (95+ Lighthouse)
- [ ] Security scan passed (no vulnerabilities)
- [ ] Affiliate networks configured and tested
- [ ] Google Analytics / Tracking setup
- [ ] Domain DNS configured
- [ ] SSL/TLS certificates valid
- [ ] Backup strategy configured
- [ ] Monitoring alerts set up

---

## Troubleshooting

### "Port 3000 already in use"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 bun run dev
```

### "Database connection refused"

```bash
# Check PostgreSQL is running
psql -h localhost -U niche_user -d niche_engine -c "SELECT 1"

# Or start Docker container
docker run --name postgres-dev -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
```

### "tRPC Devtools not working"

```bash
# tRPC Devtools require specific setup
# For now, test API directly:
curl -X POST http://localhost:3001/trpc/products.list -H "Content-Type: application/json" -d '{}'
```

---

## Next Steps

1. **Read the Docs**
   - [API Reference](./api-reference.md)
   - [Technical Architecture](./technical-architecture.md)
   - [pSEO Configuration](./pseo-config.md)

2. **Customize**
   - Add your products to CMS
   - Configure affiliate networks
   - Set up tracking

3. **Deploy**
   - Follow [Deployment Guide](./deployment.md)
   - Configure production environment
   - Set up monitoring

4. **Optimize**
   - Run performance audits
   - A/B test your content
   - Monitor affiliate revenue

---

## Support & Resources

- **GitHub Issues**: Report bugs
- **Documentation**: All docs in `/docs` folder
- **Discord Community**: [Join](https://discord.gg/niche-engine)
- **Affiliate Networks Docs**:
  - [Amazon PA-API](https://webservices.amazon.com/onca/doc/)
  - [AWIN API](https://wiki.awin.com/index.php/API)
  - [CJ API](https://www.cj.com/developers)

---

**Happy building! 🚀**

NicheEngine - Elite Publisher Technology for the 1% of Publishers.
