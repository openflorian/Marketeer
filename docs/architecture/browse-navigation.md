# Browse & Navigation — Technical Blueprint

This document captures the Browse & Navigation + Tech Setup blueprint for Marketeer. It prioritizes instant search, scalable faceting, high-performance navigation, progressive enhancement (critical content without JS), build performance, and operational reliability.

## 1) Goals
- Instant, sub-second browsing & filtering across thousands → millions of products.
- Robust faceting, typo tolerance, semantic similarity, and word-similarity ranking.
- Platform-agnostic, hierarchical categories with MegaNav → CLP/PLP decisioning.
- Critical above-the-fold SEO content without requiring JavaScript.
- Fast builds and scalable indexing; reliable handling of tens of thousands of redirects and requests.
- Provider-switchable analytics and built-in A/B testing.

## 2) High-level architecture
- Data middle-layer ("Search Booster"): index product catalog + derived search metadata (copy, attributes, variants, ratings, vendor data, category tree). Acts between e-commerce provider (Shopify default) and frontend.
- Search engine (index + query layer): managed search (Algolia, Typesense Cloud, Meilisearch Cloud) or hosted (Elasticsearch/OpenSearch). Managed SaaS recommended for instant global latency, typo tolerance and operational simplicity.
- CDN + Edge: host SSG/ISR assets on CDN (Vercel, Netlify, Cloudflare) with edge functions for SSR/PPR and personalization.
- Frontend: Astro + TypeScript for maximal SSG capabilities and progressive enhancement. Use small client-side hydrate-only components for below-the-fold personalization.
- Build orchestration: incremental/partial builds, content hashing, and per-route content invalidation.

## 3) Data & Indexing strategy
- Source of truth: e-commerce provider product feed + canonical CMS entries (cover images, CLP copy, PDP FAQs).
- ETL to "Search Booster": nightly + realtime incremental updates for product/variant changes, price, inventory, reviews, categories, redirects.
- Index schema (recommended fields):
  - product core: id, title, description, long_description, sku, vendor, vendor_id, categories[], category_path[], variants[], prices_min, prices_max, rating_avg, reviews_count, badges, published_at, redirects[], image_previews[], attributes (map)
  - search metadata: ngrams, phonetic tokens, synonyms list, locale, language
  - facet fields typed and pre-computed (range facets for price; tokenized facets for vendor, variant attributes, rating buckets)
- Sharding & partitioning:
  - Use index prefixes or index-per-locale/region if multi-regional.
  - Partition high-cardinality facets (vendor IDs) as lists rather than full text to keep query speed.
- Update strategy:
  - Incremental delta updates via webhook → ETL → index; full rebuilds only for schema changes.
  - Soft deletes and tombstones for product removals; keep redirect mapping updated.

## 4) Search, ranking & relevance
- Query pipeline:
  - Preprocess: normalize, remove punctuation, locale-specific tokenization.
  - Lexical stage: prefix search, typo tolerance, stemming, phrase boosting for title/brand/SKU.
  - Semantic stage: optional vector similarity layer for "intent matching" + synonyms.
  - Combine scores: business-boosting (promotions, bestsellers, margin), click-through signals, personalization if available.
- Typo tolerance: 1–2 character edits allowed depending on token length; phrase exact-match boosted.
- Synonyms & variant handling: synonyms per-locale; map variant labels to standard attributes (e.g., "blk" → "black").
- Ranking rules (example): Title exact > brand/sku > category match > description > synonyms; boost by inventory, rating, conversion signals, margin.

## 5) Faceting, filtering & query UX
- Faceting types:
  - Value facets: vendor, color, size, tags
  - Range facets: price (sliders), rating (buckets)
  - Search-in-facet: tiny vendor list search
- Technical:
  - Precompute facet counts for top-level filters in the index; compute dynamic counts for filtered combinations at query-time.
  - Pagination: offset-based for SEO indexable pages, cursor-based for performance on deep browsing; maintain canonical query param patterns.
- Query param driven:
  - Canonical URL example: `/category/<slug>?page=2&sort=price_asc&color=red&price_min=10&price_max=200`
  - Shareable links SSG/ISR for indexable combinations; long-tail filter combinations served via CSR/SSR (PPR or edge function).

## 6) Page-specific rendering & caching strategy
- HP (Home Page)
  - Rendering: SSG or ISR for above-the-fold; PPR/CSR for personalization below-the-fold.
  - Features: category carousel with CTA to CLP/PLP; sales banners; A/B testing hooks.
  - Cache: CDN static, short TTL for frequent banners.
- CLP (Category Landing Page)
  - Rendering: SSG/ISR for category cover + initial product showcase; "Show all products" links to PLP.
  - Binding: CMS cover content + category product sample from search index.
  - Cache: CDN; revalidate on category or CMS updates.
- PLP (Product Listing Page)
  - Rendering: ISR for main categories/pagination first pages; PPR/SSR/CSR for filtering/faceting operations.
  - Search: powered by Search Booster; sub-second responses expected.
  - Pagination: offset for SEO indexable pages; cursor for deep results; avoid heavy infinite scroll by default.
  - Sorting: configurable with backend query mappings.
- SRP (Search Results Page)
  - Rendering: SSR/ISR/CSR depending on personalization; critical results above-the-fold as SSR to ensure content without JS.
- PDP (Product Details Page)
  - Rendering: SSG for bestsellers; ISR for long tail. Above-the-fold product summary and primary images static (without JS).
  - Variants: SSR endpoints or edge functions to compute variant availability and dynamic pricing.
  - Features: image carousel, FAQs (CMS), review panel (paginated), recommendations via index or collaborative filtering.
  - Cache: static for A/B tested content; dynamic sections via edge function.

## 7) Navigation, category tree & MegaNav
- Category model:
  - Platform-agnostic hierarchical categories stored in CMS or a category graph in Search Booster.
  - Each node includes: display priority, hero image, show-as (CLP vs PLP), redirect rules, SEO metadata.
- MegaNav design:
  - Fetch top-level categories and immediate children via edge cache; top nav static SSG with revalidation.
  - Click semantics: clicking a category resolves to CLP or PLP depending on configured show-as.
- URL canonicalization:
  - Human-readable slugs: `/category/men/shoes`
  - Redirects: support many-to-one and old slug redirects via redirect table indexed in Search Booster and pushed to CDN edge rules where possible.

## 8) Redirects & request handling at scale
- Centralized redirect store:
  - Maintain redirect mappings in Search Booster or a fast key-value store (edge-served) to handle tens of thousands.
  - Push critical redirect rules to CDN edge worker for zero-latency resolution where supported.
- Rate control & fallback:
  - CDN rate-limits and circuit-breaker patterns for external APIs (Shopify, search provider).
  - Cache redirect lookups aggressively; TTL tuned for edit frequency.

## 9) A/B testing & personalization
- A/B testing:
  - Use edge flags + experiment framework (LaunchDarkly, Vercel Experiments, or self-hosted) and ISR variants above-the-fold.
  - Record events server-side to avoid client-specific bias.
- Personalization:
  - Prefer server-side or edge personalization; heavy personalization can be client-side augmentation to avoid hindering SEO.
  - Respect consent for analytics/personalization.

## 10) Analytics provider switch & privacy
- Provider-agnostic analytics abstraction:
  - Frontend analytics layer with provider adapters (Google Analytics, PostHog, Plausible).
  - Toggle provider and send-on-consent via runtime config or build-time flag.
- Open-source analytics: provide PostHog or Plausible adapter with fallback to GA.

## 11) Progressive enhancement & SEO-first
- Above-the-fold without JS:
  - Render all critical content server-side (SSG/ISR).
  - Use semantic HTML and structured data (JSON-LD) for PDP/PLP/CLP.
- Accessibility:
  - Keyboard-focusable MegaNav and filters; skip links; proper heading hierarchy.

## 12) Builds & developer ergonomics
- Fast builds:
  - Incremental builds (Vite/Astro incremental), partial route builds, isolated rebuilds on content change.
  - Cache expensive ETL outputs (thumbnail generations, image variants).
- Local dev:
  - Dev-mode local search (Meilisearch/Typesense) container with sample dataset.
- CI:
  - Build-time checks for Lighthouse budgets, sitemap validation, redirect sanity checks.

## 13) Observability, monitoring & testing
- Metrics:
  - Search latency, query success rates, render TTFB, redirect hit/miss, CDN cache hit rate, build durations.
- Alerts:
  - Search failure rates, index lag > X minutes, redirect mismatches.
- Testing:
  - Unit tests for index mappings, e2e for browsing flows, load tests for search queries and redirect throughput.
- Logging:
  - Query logs for tuning relevance (strip PII).

## 14) Security & rate limits
- API keys: scoped and rotated regularly.
- Rate-limits: exponential backoff for external provider calls.
- Access control for admin pages.

## 15) Implementation checklist & acceptance criteria (per page)
- HP:
  - CTA carousel loads above-the-fold with accessible controls; SSG with ISR revalidate; A/B hook present.
- CLP:
  - CMS-driven hero + sample products; "Show all" navigates to PLP; renders above-the-fold without JS.
- PLP:
  - Sub-second search responses; filtering & sorting; shareable canonical URLs; SEO-friendly pagination.
- PDP:
  - Base product SSG for top sellers; variant SSR endpoint; image carousel updates with variant; FAQs via CMS; reviews paginated.
- Cross-cutting:
  - Redirects resolved at edge <50ms; CDN cache hit ratio > 90% on static pages; search P95 latency < 200ms for most queries.

## 16) Recommended stack & libraries (opinionated)
- Frontend: Astro + TypeScript; React/Solid/Svelte components as needed.
- Search: Algolia (Enterprise) or Typesense/Meilisearch for open-source; vector store (Pinecone/Weaviate) for intent matching.
- Edge/Server: Vercel/Cloudflare Pages + Workers or Netlify Edge Functions.
- Analytics: adapter pattern for GA/PostHog/Plausible.
- CI/CD: Vercel/Netlify; Lighthouse checks in CI.
- Observability: Datadog/Prometheus or open-source; Sentry for errors.

## 17) Roadmap & priorities
- Phase 0 (MVP): SSG HP & PDP for bestsellers; Search Booster with basic index; PLP first-page results; CDN + edge static caching; redirect table edge push.
- Phase 1: Full faceting & filters; typo tolerance & synonyms; CLP CMS binding; A/B testing; analytics adapter.
- Phase 2: Semantic similarity / vector intent matching; personalization & recommendations; scale testing for millions of products and 10k+ redirects.
- Phase 3: Multi-region indexing, advanced ranking tuning, edge image transforms.

## 18) Next steps
- Implementation tasks to create from this blueprint (examples):
  - Create ETL job specifications and index mapping artifacts.
  - Implement Search Booster prototype with a sample dataset.
  - Add CLP/PDP SSG templates in Astro and wire CMS content.
  - Implement redirect table and push to CDN edge rules.
  - Add analytics adapter with a default PostHog implementation.

---

This file was generated from the Browse & Navigation blueprint discussed in the PR conversation.
