import { CollectionConfig } from 'payload/types';

export const AffiliateNetworks: CollectionConfig = {
  slug: 'affiliateNetworks',
  admin: {
    useAsTitle: 'name',
    group: 'Affiliate Core',
  },
  fields: [
    {
      name: 'name',
      label: 'Network Name',
      type: 'select',
      options: [
        { label: 'Amazon PA-API', value: 'amazon-pa' },
        { label: 'AWIN', value: 'awin' },
        { label: 'CJ Affiliate', value: 'cj' },
        { label: 'Impact', value: 'impact' },
        { label: 'Tradedoubler', value: 'tradedoubler' },
        { label: 'Direct Partnerships', value: 'direct' },
      ],
      required: true,
    },
    {
      name: 'apiKey',
      label: 'API Key / Auth Token',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'Encrypted in database',
      },
    },
    {
      name: 'isActive',
      label: 'Is Active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'syncSchedule',
      label: 'Sync Schedule (Cron)',
      type: 'text',
      defaultValue: '0 * * * *', // Every hour
      admin: {
        description: 'e.g., "0 */6 * * *" = every 6 hours',
      },
    },
    {
      name: 'lastSyncTime',
      label: 'Last Sync Time',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'performanceMetadata',
      label: 'Performance Metadata',
      type: 'group',
      fields: [
        {
          name: 'avgEpc',
          label: 'Average EPC',
          type: 'number',
          admin: {
            readOnly: true,
            step: 0.01,
          },
        },
        {
          name: 'avgConversionRate',
          label: 'Average Conversion Rate (%)',
          type: 'number',
          admin: {
            readOnly: true,
            step: 0.1,
          },
        },
        {
          name: 'totalClicks30d',
          label: 'Total Clicks (30d)',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'networkHealthScore',
          label: 'Network Health Score (0-100)',
          type: 'number',
          admin: {
            readOnly: true,
            step: 1,
          },
        },
      ],
    },
    {
      name: 'integrationNotes',
      label: 'Integration Notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
};
