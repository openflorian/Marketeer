/**
 * PSEO Generator - Elite Programmatic SEO Engine
 * 
 * Generiert automatisiert tausende Produktvergleich-Seiten basierend auf:
 * - JSONB Produktdatenbank
 * - EPC + Trend Scores
 * - User Search Intent
 * 
 * Output: SSG-Route-Definitionen für Astro Build
 */

import { z } from 'zod';

// Produktschema (aus CMS)
const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  trendScore: z.number().min(0).max(100),
  forecastGrowth: z.number(),
  performanceData: z.object({
    epc: z.number(),
    conversionRate: z.number(),
    cookieDuration: z.number(),
  }),
});

type Product = z.infer<typeof ProductSchema>;

/**
 * Elite pSEO Template Types
 */
enum PSEOTemplate {
  COMPARISON = 'comparison', // "Product A vs Product B"
  CATEGORY_GUIDE = 'category_guide', // "Best [Category] 2025"
  BUYING_GUIDE = 'buying_guide', // "[Feature] Buying Guide"
  BRAND_DEEP_DIVE = 'brand_deep_dive', // "[Brand] Ecosystem Deep Dive"
}

interface PSEOPage {
  slug: string;
  template: PSEOTemplate;
  seoMetadata: {
    title: string;
    metaDescription: string;
    h1: string;
    keywords: string[];
    searchVolume: number;
    difficulty: number;
    opportunity: number; // (volume - difficulty) * epc_average
  };
  content: {
    introduction: string;
    mainContent: string;
    conclusion: string;
    faq: Array<{ q: string; a: string }>;
  };
  products: Product[];
  monetization: {
    primaryAffiliateLinks: Array<{ productId: string; network: string }>;
    expectedEPC: number;
  };
  canonicalUrl: string;
  publishAt: Date;
}

/**
 * Generation Logic für "Product A vs B" Template
 * Dies ist das höchst-performante Template für Long-Tail SEO
 */
class PSEOComparison implements PSEOPage {
  slug: string;
  template = PSEOTemplate.COMPARISON;
  seoMetadata: PSEOPage['seoMetadata'];
  content: PSEOPage['content'];
  products: Product[];
  monetization: PSEOPage['monetization'];
  canonicalUrl: string;
  publishAt: Date;

  constructor(productA: Product, productB: Product) {
    this.products = [productA, productB];
    this.slug = this.generateSlug(productA, productB);
    this.canonicalUrl = `https://niche-engine.local/${this.slug}`;
    this.publishAt = new Date();

    // SEO Metadata generieren
    this.seoMetadata = {
      title: `${productA.title} vs ${productB.title} - Detaillierter Vergleich 2025`,
      metaDescription: `Vergleichen Sie ${productA.title} und ${productB.title}. Alle Features, Preise und Affiliate-Links in einer Analyse.`,
      h1: `${productA.title} vs ${productB.title} - Welcher ist besser?`,
      keywords: [
        `${productA.title} vs ${productB.title}`,
        `${productA.title} alternative`,
        `${productB.title} alternative`,
      ],
      searchVolume: Math.random() * 500 + 100, // Mock SV
      difficulty: Math.random() * 30 + 10, // Mock Difficulty
      opportunity: 0, // Wird berechnet
    };

    // Opportunity = (SearchVolume - Difficulty) * Average EPC
    const avgEPC = (productA.performanceData.epc + productB.performanceData.epc) / 2;
    this.seoMetadata.opportunity = (this.seoMetadata.searchVolume - this.seoMetadata.difficulty) * avgEPC;

    // Content generieren (in Produktion: LLM-gestützt via OpenAI API)
    this.content = this.generateContent(productA, productB);

    // Monetization Setup
    this.monetization = {
      primaryAffiliateLinks: [
        { productId: productA.id, network: 'amazon-pa' },
        { productId: productB.id, network: 'awin' },
      ],
      expectedEPC: avgEPC,
    };
  }

  private generateSlug(productA: Product, productB: Product): string {
    const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `compare/${slugify(productA.title)}-vs-${slugify(productB.title)}`;
  }

  private generateContent(productA: Product, productB: Product): PSEOPage['content'] {
    return {
      introduction: `
        # ${this.seoMetadata.h1}
        
        In diesem ausführlichen Vergleich untersuchen wir ${productA.title} und ${productB.title} 
        direkt nebeneinander. Beide Produkte haben ihre Stärken und Schwächen.
        
        **Schnelle Antwort:** 
        ${productA.performanceData.epc > productB.performanceData.epc 
          ? `${productA.title} bietet das bessere EPC-Potenzial.` 
          : `${productB.title} hat die besseren Konversionsmetriken.`}
      `,
      mainContent: `
        ## Feature-Vergleich
        
        | Feature | ${productA.title} | ${productB.title} |
        |---------|-------|-------|
        | Trend Score | ${productA.trendScore}/100 | ${productB.trendScore}/100 |
        | Expected EPC | $${productA.performanceData.epc.toFixed(2)} | $${productB.performanceData.epc.toFixed(2)} |
        | Conversion Rate | ${productA.performanceData.conversionRate}% | ${productB.performanceData.conversionRate}% |
        | Cookie Duration | ${productA.performanceData.cookieDuration}d | ${productB.performanceData.cookieDuration}d |
      `,
      conclusion: `
        ## Fazit
        
        Beide Produkte sind hochwertig. Die Wahl hängt von Ihren Anforderungen ab:
        
        - **Wähle ${productA.title}**, wenn: Höheres EPC-Potenzial wichtig ist
        - **Wähle ${productB.title}**, wenn: Bessere Konversionsrate im Fokus steht
      `,
      faq: [
        {
          q: `Welcher ist besser: ${productA.title} oder ${productB.title}?`,
          a: `Das hängt vom Anwendungsfall ab. ${productA.title} hat ein EPC von $${productA.performanceData.epc}, während ${productB.title} $${productB.performanceData.epc} bietet.`,
        },
        {
          q: `Sind diese Produkte kompatibel miteinander?`,
          a: 'Ja, viele Nutzer verwenden beide Produkte zusammen.',
        },
      ],
    };
  }
}

/**
 * Main Generator Class
 */
export class PSEOGenerator {
  private products: Product[] = [];

  async loadProducts(products: Product[]): Promise<void> {
    this.products = products.filter(p => p.performanceData.epc > 1); // Nur rentable Produkte
    console.log(`✅ Loaded ${this.products.length} products for pSEO generation`);
  }

  /**
   * Generiere ALLE möglichen Vergleichsseiten
   * Kombinatorik: n² / 2 Seiten (uniqueness)
   */
  async generateAllComparisons(): Promise<PSEOPage[]> {
    const pages: PSEOPage[] = [];

    for (let i = 0; i < this.products.length; i++) {
      for (let j = i + 1; j < this.products.length; j++) {
        const comparison = new PSEOComparison(this.products[i], this.products[j]);
        pages.push(comparison);
      }
    }

    console.log(`🚀 Generated ${pages.length} comparison pages`);
    return pages;
  }

  /**
   * Filtering: Nur Seiten mit gutem SEO Opportunity generieren
   * (volume × (1 - difficulty/100) × epc) > threshold
   */
  async generateHighOpportunityPages(threshold: number = 100): Promise<PSEOPage[]> {
    const allPages = await this.generateAllComparisons();
    const filtered = allPages.filter(p => p.seoMetadata.opportunity > threshold);

    console.log(`🎯 Filtered to ${filtered.length} high-opportunity pages (opportunity > ${threshold})`);
    return filtered;
  }

  /**
   * Exportiere als Astro SSG Routes
   */
  async exportAstroRoutes(pages: PSEOPage[]): Promise<string> {
    const routes = pages.map(page => ({
      params: {
        slug: page.slug,
      },
      props: {
        page: JSON.stringify(page),
      },
    }));

    return JSON.stringify(routes, null, 2);
  }

  /**
   * Content-Validation: Stelle sicher, dass kein Thin-Content produziert wird
   */
  async validateContent(pages: PSEOPage[]): Promise<{ valid: PSEOPage[]; invalid: PSEOPage[] }> {
    const valid: PSEOPage[] = [];
    const invalid: PSEOPage[] = [];

    for (const page of pages) {
      const wordCount = (page.content.introduction + page.content.mainContent + page.content.conclusion).split(' ').length;

      if (wordCount < 300) {
        invalid.push(page);
        console.warn(`⚠️ Thin content: ${page.slug} (${wordCount} words)`);
      } else {
        valid.push(page);
      }
    }

    console.log(`✅ Valid pages: ${valid.length} | ⚠️ Invalid: ${invalid.length}`);
    return { valid, invalid };
  }
}

// ===== DEMO EXECUTION =====
async function main() {
  const generator = new PSEOGenerator();

  // Mock Produkte
  const mockProducts: Product[] = [
    {
      id: 'p1',
      title: 'QuantumMech Keyboard v4',
      category: 'Hardware',
      trendScore: 94,
      forecastGrowth: 1.5,
      performanceData: { epc: 2.45, conversionRate: 3.2, cookieDuration: 30 },
    },
    {
      id: 'p2',
      title: 'Self-Hosted AI Node',
      category: 'Hardware',
      trendScore: 78,
      forecastGrowth: 2.1,
      performanceData: { epc: 8.75, conversionRate: 4.1, cookieDuration: 45 },
    },
    {
      id: 'p3',
      title: 'Dotfiles Macro Pad',
      category: 'Peripherals',
      trendScore: 45,
      forecastGrowth: 0.9,
      performanceData: { epc: 1.2, conversionRate: 2.5, cookieDuration: 14 },
    },
  ];

  await generator.loadProducts(mockProducts);
  const highOpportunityPages = await generator.generateHighOpportunityPages(50);
  const { valid, invalid } = await generator.validateContent(highOpportunityPages);

  console.log('\n📄 Sample Page Generated:');
  console.log(JSON.stringify(valid[0], null, 2));
}

main().catch(console.error);
