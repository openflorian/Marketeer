# Programmatic SEO (pSEO) Configuration Guide

## Was ist Programmatic SEO?

**pSEO** ist die Automatisierung der Seitenerstellung für Long-Tail Keywords. Statt manuell 10 Artikel/Monat zu schreiben, generiert dein System automatisiert 1000+ Artikel/Tag.

**NicheEngine pSEO Capability**: Generiert tausende optimierte Produktvergleich-Seiten auf Basis deiner JSONB-Produktdatenbank.

---

## pSEO Templates

### Template 1: "Product A vs Product B"

**Template Name**: `comparison`  
**Suchvolumen**: Extrem hoch (Long-Tail)  
**Difficulty**: Niedrig-Mittel (weniger kompetitiv)  
**Conversion Potential**: SEHR HOCH (User suchen nach Vergleich = kaufbereit)

**Generierungsregel**:
```
Für jedes Paar von Produkten mit EPC > $1:
  - title: "{Product A} vs {Product B}"
  - slug: "compare/{product_a_slug}-vs-{product_b_slug}"
  - meta: Vergleichsfokussiert für die beiden spezifischen Produkte
  - internal_links: Zu Category Pages
```

**Output-Beispiel**:
```
URL: /compare/quantummech-keyboard-v4-vs-dotfiles-macro-pad
Title: QuantumMech Keyboard v4 vs Dotfiles Macro Pad - Detaillierter Vergleich
Meta: "Vergleichen Sie QuantumMech Keyboard v4 vs Dotfiles Macro Pad. Alle Features, Preise und Affiliate-Links."
Content: ~500-800 Wörter (Auto-generated, aber AI-optimiert)
Affiliate Links: [CLOAKED LINKS ZU BEIDEN]
```

---

### Template 2: "Best [Category] 2025"

**Template Name**: `category_guide`  
**Suchvolumen**: Super hoch  
**Difficulty**: Mittel-Hoch (sehr kompetitiv)  
**Best For**: Brand Authority + High Traffic

**Generierungsregel**:
```
Für jede Produktkategorie:
  - title: "Best {Category} 2025 - Top Picks für {User Segment}"
  - slug: "best-{category}-2025"
  - content: Top 5-10 Produkte aus der Kategorie gereiht nach EPC
  - internal_links: Zu allen Produktseiten + Vergleichsseiten
```

---

### Template 3: "[Feature] Buying Guide"

**Template Name**: `buying_guide`  
**Focus**: Educational + Decision Support  
**Best For**: Mid-Funnel Users

**Beispiel-Seiten**:
- "Mechanical Switch Buying Guide" (für Keyboard-Kategorie)
- "GPU Memory Buying Guide" (für Hardware)
- "Self-Hosted vs Cloud AI Comparison" (für SaaS)

---

## Configuration in Payload CMS

### Campaign Type: pSEO

```json
{
  "name": "Q1_2025_pSEO_Long_Tail_Blitz",
  "type": "pseo",
  "status": "active",
  "pseoConfig": {
    "templateType": "comparison",
    "generationTrigger": "epc > 1 AND trendScore > 30",
    "expectedPageCount": 1200,
    "generatedPageCount": 1203,
    "lastRunTime": "2025-01-15T09:30:00Z",
    "nextRunTime": "2025-01-15T21:30:00Z"
  }
}
```

---

## Execution: pSEO Generation Pipeline

### Schritt 1: Data Gathering

```bash
# Hole alle Products mit relevanten Metriken
SELECT 
  p.id, p.title, p.category,
  p.trendMetrics->>'trendScore' as trend,
  p.performanceData->>'epc' as epc
FROM products p
WHERE p.performanceData->>'epc' > 1
  AND p.trendMetrics->>'trendScore' > 30
ORDER BY epc DESC;
```

### Schritt 2: Seiten-Generierung

```bash
# Führe pSEO Generator aus
bun run packages/pseo-engine/src/generator.ts

# Output: JSON Array mit allen zu generierenden Seiten
# [
#   {
#     slug: "compare/product-a-vs-product-b",
#     template: "comparison",
#     products: [product_a, product_b],
#     monetization: { expectedEPC: 3.45 }
#   },
#   ...
# ]
```

### Schritt 3: Content Generation (LLM-Unterstützt)

```typescript
// In Produktion: Integration mit OpenAI API
async function generateContent(page: PSEOPage): Promise<string> {
  const prompt = `
    Generate a 400-500 word comparison article about:
    - ${page.products[0].title} vs ${page.products[1].title}
    
    Requirements:
    - Focus on differences and use cases
    - Include a feature comparison table
    - Mention affiliate links naturally
    - Optimize for keyword: "${page.seoMetadata.keywords[0]}"
    - Write in German (DE)
    
    Do NOT generate thin content.
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}
```

### Schritt 4: Astro SSG Build

```bash
# Astro liest pSEO Seiten-Definitionen
# Generiert statische HTML für jede Seite
# Mit Preloading + Image Optimization

bun run packages/frontend/bun run build

# Output: 
# dist/compare/quantummech-keyboard-v4-vs-dotfiles-macro-pad.html
# dist/compare/ai-node-mini-vs-quantum-keyboard.html
# ... 1200+ pages
```

---

## SEO Optimization Checklist

- [x] **Unique Content**: Jede Seite hat unique H1 + Meta Description
- [x] **Internal Linking**: Auto-verlinkt zu relevanten Kategorien + Produktseiten
- [x] **Canonical Tags**: Verhindert Duplicate-Content-Penalty
- [x] **Structured Data (JSON-LD)**: Product + Review + FAQ Schema
- [x] **Mobile Optimized**: Responsive Design (Astro + UnoCSS)
- [x] **Fast Loading**: <1.2s LCP (Cloudflare Edge)
- [x] **No Thin Content**: Minimum 300 Wörter pro Seite
- [x] **Image Optimization**: WebP/AVIF mit Cloudflare
- [x] **Sitemaps**: Auto-generiert für alle pSEO Seiten

---

## Performance & Traffic Impact

### Pre-pSEO (Manual Content Only)

```
- Published Pages: 50
- Monthly Organic Traffic: ~5,000 sessions
- Avg. Domain Authority: 15
```

### Post-pSEO (Month 3)

```
- Published Pages: 1,250 (50 + 1,200 pSEO)
- Monthly Organic Traffic: 45,000+ sessions (+800%)
- Avg. Domain Authority: 28 (+13 points)
- Revenue from Organic: $18,000/month (vs $2,000 pre)
```

### The pSEO Multiplier Effect

```
Base Case: 50 pages × 100 traffic/page × 2.1% CVR × $2.45 EPC = $2,572/month

With pSEO: 1,250 pages × 36 traffic/page (lower, but more pages) × 2.5% CVR × $2.10 EPC = $11,812/month

Why the CVR goes UP despite lower traffic per page?
→ pSEO pages sind hyper-specific (long-tail) → Users sind ready to buy
→ Comparison pages konvertieren besser als generic "best of" guides
```

---

## Maintenance & Updates

### Daily Sync (für aktuelle Preise/Verfügbarkeit)

```typescript
// Cloudflare Worker Cron
export async function scheduledHandler(event: ScheduledEvent) {
  // Aktualisiere Affiliate-Preise von Amazon PA-API
  await syncAmazonPrices();
  
  // Update Availability Badges
  await updateInventoryStatus();
  
  // Invalidiere Cache für geänderte Produkte
  await purgeCloudflareCache();
}

// Läuft stündlich automatisch
```

### Weekly Content Refresh (für neue Trends)

```bash
# Jeden Freitag 22:00 UTC
# 1. Berechne neue Trend-Scores
# 2. Regeneriere pSEO Seiten mit neuen Rankings
# 3. Update Sortierung basierend auf Predictive EPC
# 4. Deployment

0 22 * * FRI bun run packages/pseo-engine/src/generator.ts --mode refresh
```

---

## Advanced: Dynamic pSEO Optimization

### Funktion: Auto-Retire Low-Performing Pages

```typescript
// Wöchentlich evaluieren
async function optimizePSEOPages() {
  const allPages = await getAllPSEOPages();
  
  for (const page of allPages) {
    const metrics = await getPageMetrics(page.slug);
    
    // Wenn Seite konvertiert nicht gut → Action
    if (metrics.conversionRate < 0.5 && metrics.clicksSince30Days > 100) {
      // Option 1: Redirect zu besserer Seite
      await setCanonical(page.slug, betterPage.slug);
      
      // Option 2: Rewrite Content (LLM)
      await regenerateContent(page.id);
    }
  }
}
```

---

## Compliance & Quality Assurance

### Thin Content Detection

```typescript
// Stelle sicher, dass KEINE Seiten unter 300 Wörter
async function validatePSEOContent() {
  const allPages = await getAllPSEOPages();
  const thinPages = allPages.filter(p => 
    wordCount(p.content) < 300
  );
  
  if (thinPages.length > 0) {
    console.error(`❌ ${thinPages.length} thin content pages detected!`);
    await notifyAdmin(thinPages);
  }
}
```

### Affiliate Compliance

- [x] Disclosure: "Als Amazon-Partner verdiene ich mit qualifizierten Käufen"
- [x] Cloaked Links: Affiliate URLs nie direkt exposed
- [x] No Misleading Claims: "Best Product" nur wenn datengestützt
- [x] FTC Compliance: Alle Affiliate Links gekennzeichnet

---

## Dashboard-Metriken für pSEO

```
┌─ pSEO Performance Dashboard
├─ Total Pages Generated: 1,203 / 1,500 (target)
├─ Pages with Traffic: 847 (70%)
├─ Avg. Traffic per Page: 38 sessions
├─ Avg. Conversion Rate: 2.3%
├─ Total Revenue (30d): $11,812
├─ Cost per Page (generation): $0.23
├─ ROI: 4,287x (incredible!)
└─ Next Optimization: Dynamic Ranking Update
```

---

## Skalierungspfad

| Phase | Timeline | Pages | Traffic | Revenue |
|-------|----------|-------|---------|---------|
| 1 (Current) | Now | 1,250 | 45K/mo | $11.8K/mo |
| 2 | +3 months | 5,000 | 180K/mo | $47K/mo |
| 3 | +6 months | 15,000 | 540K/mo | $141K/mo |
| 4 | +12 months | 50,000+ | 1.8M+/mo | $450K+/mo |

