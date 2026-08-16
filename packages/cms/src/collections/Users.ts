import { CollectionConfig } from 'payload/types';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Publisher', value: 'publisher' },
        { label: 'Analyst', value: 'analyst' },
        { label: 'Affiliate Manager', value: 'affiliate_manager' },
      ],
      defaultValue: 'publisher',
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
    },
    {
      name: 'accessControl',
      label: 'Access Control',
      type: 'group',
      fields: [
        {
          name: 'allowedNetworks',
          label: 'Allowed Affiliate Networks',
          type: 'relationship',
          relationTo: 'affiliateNetworks',
          hasMany: true,
        },
        {
          name: 'allowedCampaigns',
          label: 'Allowed Campaigns',
          type: 'relationship',
          relationTo: 'campaigns',
          hasMany: true,
        },
      ],
    },
  ],
  timestamps: true,
};
