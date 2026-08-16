# NicheEngine API Reference

## Overview

Das tRPC API ist der zentrale Backend für NicheEngine. Es verbindet:
- **Frontend** (Astro) ↔ **API** (tRPC) ↔ **CMS** (Payload) ↔ **ML Engine**

Alle Anfragen sind **type-safe** durch Zod-Schemas.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.niche-engine.com`

---

## Router: `affiliate`

### `affiliate.redirect`

**Purpose**: Cloaked Affiliate-Link Redirect mit Server-Side Tracking

**Input**:
```typescript
{
  productId: string;      // z.B. "p_qm_keyboard_v4"
  placement: string;      // z.B. "showcase", "comparison-table"
  variant: string;        // z.B. "control", "treatment_v1"
}
```

**Output**:
```typescript
{
  redirectUrl: string;    // Der echte Affiliate URL (server-side)
  trackingId: string;     // UUID für das Tracking
  productTitle: string;   // Für Debugging/Logging
}
```

**Usage (Frontend)**:
```typescript
const redirect = await trpc.affiliate.redirect.query({
  productId: 'p_qm_keyboard_v4',
  placement: 'showcase',
});
// User wird weitergeleitet, Click wird getracked
```

**Server-Side Tracking Ablauf**:
1. User klickt auf Affiliate-Link
2. Frontend sendet `affiliate.redirect` an API
3. API speichert Click-Event (IP-Hash, User-Agent, Placement)
4. API leitet zu echtem Affiliate-Link weiter
5. Analytics Pipeline verarbeitet Event (Ad Blocker-proof!)

---

## Router: `products`

### `products.list`

**Purpose**: Hole Produkte mit AI-Ranking

**Input**:
```typescript
{
  category?: string;      // z.B. "hardware", "software"
  sortBy?: "trend" | "epc" | "forecast"; // Default: "trend"
  limit?: number;         // Default: 20
}
```

**Output**:
```typescript
Array<{
  id: string;
  title: string;
  trendScore: number;      // 0-100
  forecastGrowth: number;  // 0.1-5.0
  epc: number;             // Earnings Per Click
  priorityScore: number;   // trendScore × forecastGrowth
}>
```

**Example**:
```typescript
// Hole Top 10 aufstrebende Produkte
const products = await trpc.products.list.query({
  sortBy: 'forecast',
  limit: 10,
});
```

---

### `products.getById`

**Purpose**: Hole vollständige Produktdetails

**Input**: `productId: string`

**Output**:
```typescript
{
  id: string;
  title: string;
  category: string;
  trendMetrics: {
    trendScore: number;
    forecastGrowth: number;
  };
  affiliateLinks: Array<{
    network: string;
    rawUrl: string;
    subId: string;
  }>;
  performanceData: {
    epc: number;
    conversionRate: number;
    cookieDuration: number;
  };
}
```

---

## Router: `analytics`

### `analytics.getClickMetrics`

**Purpose**: Hole Clickstream Analytics (ohne Third-Party Cookies!)

**Input**:
```typescript
{
  productId?: string;
  dateRange?: { from: Date; to: Date };
}
```

**Output**:
```typescript
{
  totalClicks: number;
  uniqueIPs: number;
  placements: Array<{ placement: string; count: number }>;
}
```

---

### `analytics.getPredictiveEPC`

**Purpose**: Machine Learning Vorhersage für Affiliate EPC

**Input**:
```typescript
{
  productId: string;
  userProfile: {
    deviceType: "mobile" | "tablet" | "desktop";
    dayOfWeek: number;    // 0 = Sunday, 6 = Saturday
    hour: number;         // 0-23
  };
}
```

**Output**:
```typescript
{
  baseEpc: number;        // Historischer Durchschnitt
  predictedEpc: number;   // ML-Vorhersage
  confidence: number;     // 0-1
  adjustmentFactors: {
    device: string;
    timeOfDay: string;
    dayOfWeek: string;
  };
}
```

**Beispiel**:
```typescript
// Freitag Abend, Desktop-User
const prediction = await trpc.analytics.getPredictiveEPC.query({
  productId: 'p_ai_node_mini',
  userProfile: {
    deviceType: 'desktop',
    dayOfWeek: 5,  // Friday
    hour: 20,      // 8 PM
  },
});

// Output: { baseEpc: 8.75, predictedEpc: 12.2, confidence: 0.87 }
// => AI sagt: Dieser User wird 40% höhere EPC generieren
```

---

## Error Handling

Alle Fehler folgen TRPCError Format:

```typescript
{
  code: "NOT_FOUND" | "UNAUTHORIZED" | "BAD_REQUEST" | ...
  message: string;
  cause?: any;
}
```

**Example**:
```typescript
try {
  await trpc.products.getById.query('invalid_id');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Product nicht gefunden');
  }
}
```

---

## Rate Limiting

- **Standard**: 100 requests/min pro IP
- **Affiliate Router**: 1000 requests/min (höher wegen hohem Traffic)

---

## Authentication

Momentan keine Authentifizierung. In Produktion:
- Nutze `@trpc/next` mit Auth-Middleware
- Signiere Requests mit Secret Key

---

## Cloudflare Edge Integration

Zusätzlich zu tRPC API gibt es auch Cloudflare Worker Endpoints:

- **POST** `/api/track` - Server-Side Tracking
- **POST** `/edge/predict-epc` - Edge-Level ML Predictions
- **GET** `/test/:campaignId` - A/B Test Variante zuweisen
- **GET** `/go/:productId` - Cloaked Redirect

---

## Performance Targets

- **API Response Time**: <100ms (p95)
- **Edge Worker Response Time**: <50ms
- **Tracking Latency**: <10ms (non-blocking)

