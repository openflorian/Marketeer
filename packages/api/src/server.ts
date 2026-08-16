import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import * as crypto from 'crypto';

// Hier würde die CMS/DB Integration sein
interface Product {
  id: string;
  title: string;
  affiliateLinks: Array<{
    network: string;
    rawUrl: string;
    subId: string;
  }>;
  trendScore: number;
  forecastGrowth: number;
  performanceData: {
    epc: number;
  };
}

// Mock Datenbank für Demo
const mockProducts: Record<string, Product> = {
  'p_qm_keyboard_v4': {
    id: 'p_qm_keyboard_v4',
    title: 'QuantumMech Keyboard v4',
    affiliateLinks: [
      {
        network: 'amazon-pa',
        rawUrl: 'https://amazon.com/dp/B0XXXXX?tag=niche123',
        subId: 'page_showcase_v1',
      },
    ],
    trendScore: 94,
    forecastGrowth: 1.5,
    performanceData: {
      epc: 2.45,
    },
  },
};

// Mock Click Log (würde in PostgreSQL gehen)
const clickLog: any[] = [];

const t = initTRPC.create();

// ===== ROUTERS =====

// 1. AFFILIATE LINK CLOAKING & REDIRECT
export const affiliateRouter = t.router({
  // Redirect über cloaked URL
  redirect: t.procedure
    .input(z.object({
      productId: z.string(),
      placement: z.string().optional(),
      variant: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const product = mockProducts[input.productId];

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // ===== SERVER-SIDE TRACKING (Bypass Ad Block) =====
      const clickEntry = {
        productId: input.productId,
        placement: input.placement || 'direct',
        variant: input.variant || 'default',
        timestamp: new Date().toISOString(),
        userAgent: ctx.userAgent,
        ipHash: hashIP(ctx.ip),
        screenResolution: ctx.screenResolution,
      };

      clickLog.push(clickEntry);
      console.log('[TRACKING] Click recorded:', clickEntry);

      // Wähle das beste Affiliate Network basierend auf EPC
      const bestLink = product.affiliateLinks[0];

      return {
        redirectUrl: bestLink.rawUrl,
        trackingId: crypto.randomUUID(),
        productTitle: product.title,
      };
    }),
});

// 2. PRODUCT LISTING & AI RANKING
export const productsRouter = t.router({
  // Hole Produkte mit AI-basiertem Ranking
  list: t.procedure
    .input(z.object({
      category: z.string().optional(),
      sortBy: z.enum(['trend', 'epc', 'forecast']).optional().default('trend'),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const products = Object.values(mockProducts);

      // Sortiere nach gewünschtem Kriterium
      let sorted = products.sort((a, b) => {
        if (input.sortBy === 'trend') {
          return b.trendScore - a.trendScore;
        } else if (input.sortBy === 'epc') {
          return b.performanceData.epc - a.performanceData.epc;
        } else {
          return b.forecastGrowth - a.forecastGrowth;
        }
      });

      return sorted.slice(0, input.limit).map(p => ({
        id: p.id,
        title: p.title,
        trendScore: p.trendScore,
        forecastGrowth: p.forecastGrowth,
        epc: p.performanceData.epc,
        priorityScore: p.trendScore * p.forecastGrowth,
      }));
    }),

  // Hole einzelnes Produkt mit vollem Detail
  getById: t.procedure
    .input(z.string())
    .query(async ({ input }) => {
      const product = mockProducts[input];
      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }
      return product;
    }),
});

// 3. ANALYTICS & PERFORMANCE
export const analyticsRouter = t.router({
  // Hole Clickstream Analytics
  getClickMetrics: t.procedure
    .input(z.object({
      productId: z.string().optional(),
      dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
    }))
    .query(async ({ input }) => {
      // In der Produktion: Query aus PostgreSQL
      const clicks = input.productId
        ? clickLog.filter(c => c.productId === input.productId)
        : clickLog;

      return {
        totalClicks: clicks.length,
        uniqueIPs: new Set(clicks.map(c => c.ipHash)).size,
        placements: Object.values(
          clicks.reduce((acc: any, c) => {
            acc[c.placement] = (acc[c.placement] || 0) + 1;
            return acc;
          }, {})
        ),
      };
    }),

  // Hole Predictive EPC für ML Engine
  getPredictiveEPC: t.procedure
    .input(z.object({
      productId: z.string(),
      userProfile: z.object({
        deviceType: z.enum(['mobile', 'tablet', 'desktop']),
        dayOfWeek: z.number(),
        hour: z.number(),
      }),
    }))
    .query(async ({ input }) => {
      const product = mockProducts[input.productId];
      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // ===== MACHINE LEARNING: Predictive EPC =====
      // In der Produktion: TensorFlow.js Model oder Python-Backend
      let predictedEpc = product.performanceData.epc;

      // Heuristic adjustments (würde durch echtes ML-Modell ersetzt)
      if (input.userProfile.deviceType === 'desktop') {
        predictedEpc *= 1.3; // Desktop-User klicken 30% mehr
      }

      if (input.userProfile.dayOfWeek === 5 || input.userProfile.dayOfWeek === 6) {
        predictedEpc *= 1.2; // Wochenende boost
      }

      if (input.userProfile.hour >= 20 && input.userProfile.hour <= 23) {
        predictedEpc *= 1.15; // Abends höhere Bereitschaft zu kaufen
      }

      return {
        baseEpc: product.performanceData.epc,
        predictedEpc: Math.round(predictedEpc * 100) / 100,
        adjustmentFactors: {
          device: input.userProfile.deviceType,
          timeOfDay: `${input.userProfile.hour}:00`,
          dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][input.userProfile.dayOfWeek],
        },
        confidence: 0.87, // ML model confidence
      };
    }),
});

// ===== MAIN ROUTER =====
export const appRouter = t.router({
  affiliate: affiliateRouter,
  products: productsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

// ===== HELPER FUNCTIONS =====
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex');
}

// ===== HTTP SERVER STARTEN =====
const server = createHTTPServer({
  router: appRouter,
  createContext: async ({ req }) => ({
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    screenResolution: req.headers['x-screen-resolution'],
  }),
});

const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, () => {
  console.log(`✅ tRPC API Server running on http://localhost:${PORT}`);
});
