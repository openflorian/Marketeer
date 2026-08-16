import { CollectionConfig } from 'payload/types';

export const PerformanceMetrics: CollectionConfig = {
  slug: 'performanceMetrics',
  admin: {
    useAsTitle: 'date',
    group: 'Analytics',
    defaultColumns: ['date', 'product', 'network', 'clicks', 'conversions', 'revenue'],
  },
  fields: [
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'product',
      label: 'Product',
      type: 'relationship',
      relationTo: 'products',
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'relationship',
      relationTo: 'campaigns',
    },
    {
      name: 'network',
      label: 'Affiliate Network',
      type: 'relationship',
      relationTo: 'affiliateNetworks',
    },
    {
      name: 'metrics',
      label: 'Metrics',
      type: 'group',
      fields: [
        {
          name: 'impressions',
          label: 'Impressions',
          type: 'number',
        },
        {
          name: 'clicks',
          label: 'Clicks',
          type: 'number',
        },
        {
          name: 'conversions',
          label: 'Conversions',
          type: 'number',
        },
        {
          name: 'revenue',
          label: 'Revenue ($)',
          type: 'number',
          admin: { step: 0.01 },
        },
        {
          name: 'ctr',
          label: 'CTR (%)',
          type: 'number',
          admin: { step: 0.01, readOnly: true },
        },
        {
          name: 'conversionRate',
          label: 'Conversion Rate (%)',
          type: 'number',
          admin: { step: 0.01, readOnly: true },
        },
        {
          name: 'epc',
          label: 'EPC ($)',
          type: 'number',
          admin: { step: 0.01, readOnly: true },
        },
      ],
    },
    {
      name: 'aiInsights',
      label: 'AI-Generated Insights',
      type: 'group',
      fields: [
        {
          name: 'anomalyDetected',
          label: 'Anomaly Detected',
          type: 'checkbox',
          admin: {
            description: 'Unusual performance pattern detected by ML',
          },
        },
        {
          name: 'anomalyDescription',
          label: 'Anomaly Description',
          type: 'textarea',
          admin: {
            condition: (data) => data.aiInsights?.anomalyDetected,
          },
        },
        {
          name: 'recommendation',
          label: 'Recommendation',
          type: 'textarea',
          admin: {
            description: 'e.g., "Increase ad spend", "Switch network", "Optimize copy"',
          },
        },
      ],
    },
  ],
  timestamps: false,
};
