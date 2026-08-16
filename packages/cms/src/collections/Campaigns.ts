import { CollectionConfig } from 'payload/types';

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    useAsTitle: 'name',
    group: 'Content & Campaigns',
  },
  fields: [
    {
      name: 'name',
      label: 'Campaign Name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      label: 'Campaign Type',
      type: 'select',
      options: [
        { label: 'pSEO (Programmatic SEO)', value: 'pseo' },
        { label: 'A/B Test', value: 'ab_test' },
        { label: 'Seasonal / Promotional', value: 'seasonal' },
        { label: 'Affiliate Rotation', value: 'affiliate_rotation' },
      ],
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'draft',
    },
    // pSEO-SPEZIFISCH
    {
      name: 'pseoConfig',
      label: 'pSEO Configuration',
      type: 'group',
      admin: {
        condition: (data) => data.type === 'pseo',
      },
      fields: [
        {
          name: 'templateType',
          label: 'pSEO Template',
          type: 'select',
          options: [
            { label: 'Product A vs B', value: 'comparison' },
            { label: 'Category Reviews', value: 'category_reviews' },
            { label: 'Buying Guide', value: 'buying_guide' },
            { label: 'Brand Deep Dive', value: 'brand_deep_dive' },
          ],
        },
        {
          name: 'generationTrigger',
          label: 'Generation Trigger',
          type: 'textarea',
          admin: {
            description: 'e.g., "Generate pages for all product combinations where EPC > $5"',
          },
        },
        {
          name: 'expectedPageCount',
          label: 'Expected Page Count',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'generatedPageCount',
          label: 'Generated Page Count',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // A/B TEST KONFIGURATION
    {
      name: 'abTestConfig',
      label: 'A/B Test Configuration',
      type: 'group',
      admin: {
        condition: (data) => data.type === 'ab_test',
      },
      fields: [
        {
          name: 'variants',
          label: 'Variants',
          type: 'array',
          fields: [
            {
              name: 'variantName',
              label: 'Variant Name',
              type: 'text',
            },
            {
              name: 'variation',
              label: 'What Changes',
              type: 'select',
              options: [
                { label: 'Button Color', value: 'button_color' },
                { label: 'CTA Text', value: 'cta_text' },
                { label: 'Product Order', value: 'product_order' },
                { label: 'Layout', value: 'layout' },
              ],
            },
            {
              name: 'value',
              label: 'Variant Value',
              type: 'text',
            },
            {
              name: 'trafficAllocation',
              label: 'Traffic Allocation (%)',
              type: 'number',
              admin: { step: 1, min: 1, max: 100 },
            },
            {
              name: 'conversionRate',
              label: 'Current Conversion Rate (%)',
              type: 'number',
              admin: { readOnly: true, step: 0.1 },
            },
          ],
        },
      ],
    },
    // PERFORMANCE TRACKING
    {
      name: 'performance',
      label: 'Campaign Performance',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          label: 'Start Date',
          type: 'date',
        },
        {
          name: 'endDate',
          label: 'End Date',
          type: 'date',
        },
        {
          name: 'impressions',
          label: 'Total Impressions',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'clicks',
          label: 'Total Clicks',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'conversions',
          label: 'Total Conversions',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'revenue',
          label: 'Total Revenue',
          type: 'number',
          admin: { readOnly: true, step: 0.01 },
        },
        {
          name: 'roi',
          label: 'ROI (%)',
          type: 'number',
          admin: { readOnly: true, step: 0.1 },
        },
      ],
    },
  ],
  timestamps: true,
  versions: true,
};
