import { CollectionConfig } from 'payload/types';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Affiliate Core',
  },
  fields: [
    {
      name: 'title',
      label: 'Product Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Product Description',
      type: 'richText',
    },
    {
      name: 'category',
      label: 'Product Category',
      type: 'select',
      options: [
        { label: 'Hardware', value: 'hardware' },
        { label: 'Software', value: 'software' },
        { label: 'Services', value: 'services' },
        { label: 'Peripherals', value: 'peripherals' },
        { label: 'Gadgets', value: 'gadgets' },
      ],
    },
    // AFFILIATE NETWORK INTEGRATION
    {
      name: 'affiliateLinks',
      label: 'Affiliate Links',
      type: 'array',
      fields: [
        {
          name: 'network',
          label: 'Affiliate Network',
          type: 'relationship',
          relationTo: 'affiliateNetworks',
          required: true,
        },
        {
          name: 'rawUrl',
          label: 'Raw Affiliate URL',
          type: 'text',
          required: true,
          admin: {
            description: 'Never exposed to client - used server-side only',
          },
        },
        {
          name: 'subId',
          label: 'Tracking Sub-ID',
          type: 'text',
          admin: {
            description: 'e.g., placement-variant-ab-test',
          },
        },
      ],
      minRows: 1,
      maxRows: 5,
    },
    // TREND & FORECAST METRICS
    {
      name: 'trendMetrics',
      label: 'Trend Metrics (AI-Generated)',
      type: 'group',
      fields: [
        {
          name: 'trendScore',
          label: 'Current Trend Score (0-100)',
          type: 'number',
          required: true,
          admin: {
            step: 1,
            min: 0,
            max: 100,
            description: 'Higher = more trending. Updated hourly via ML pipeline.',
          },
        },
        {
          name: 'forecastGrowth',
          label: 'Forecast Growth Multiplier',
          type: 'number',
          required: true,
          admin: {
            step: 0.1,
            min: 0.1,
            max: 5,
            description: 'Expected growth rate. 1.0 = stable, 2.0 = 100% growth expected',
          },
        },
        {
          name: 'lastUpdated',
          label: 'Last Updated',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // PERFORMANCE DATA
    {
      name: 'performanceData',
      label: 'Performance Data',
      type: 'group',
      fields: [
        {
          name: 'epc',
          label: 'Earnings Per Click',
          type: 'number',
          admin: {
            step: 0.01,
            description: 'Average revenue per affiliate click',
          },
        },
        {
          name: 'conversionRate',
          label: 'Conversion Rate (%)',
          type: 'number',
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'cookieDuration',
          label: 'Cookie Duration (days)',
          type: 'number',
          admin: {
            description: '⚠️ Critical for conversion window planning',
          },
        },
        {
          name: 'clicksLast30Days',
          label: 'Clicks (Last 30 Days)',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // SEO & CONTENT
    {
      name: 'seoData',
      label: 'SEO & Content',
      type: 'group',
      fields: [
        {
          name: 'slug',
          label: 'URL Slug',
          type: 'text',
          unique: true,
          required: true,
        },
        {
          name: 'metaDescription',
          label: 'Meta Description',
          type: 'textarea',
          maxLength: 160,
        },
        {
          name: 'canonical',
          label: 'Canonical URL',
          type: 'text',
          admin: {
            description: 'Für de-duplication bei pSEO-generated pages',
          },
        },
        {
          name: 'pseoGenerated',
          label: 'Is pSEO Generated?',
          type: 'checkbox',
          admin: {
            description: 'Automatically generated via pSEO engine?',
          },
        },
      ],
    },
    // GAMIFICATION & CRO
    {
      name: 'croTriggers',
      label: 'CRO Psycho-Triggers',
      type: 'group',
      fields: [
        {
          name: 'scarcityFlag',
          label: 'Enable Scarcity Trigger',
          type: 'checkbox',
          admin: {
            description: 'Show "only X left" badge',
          },
        },
        {
          name: 'fomoBadge',
          label: 'FOMO Badge Text',
          type: 'text',
          admin: {
            description: 'e.g., "Last 3 units", "Flash sale ends in 2h"',
          },
        },
        {
          name: 'exitIntentOffer',
          label: 'Exit-Intent Offer',
          type: 'textarea',
          admin: {
            description: 'Custom message when user tries to leave',
          },
        },
      ],
    },
  ],
  versions: true,
  timestamps: true,
  access: {
    read: async () => true,
    create: async ({ req }) => req.user?.role === 'admin',
    update: async ({ req }) => req.user?.role === 'admin',
    delete: async ({ req }) => req.user?.role === 'admin',
  },
};
