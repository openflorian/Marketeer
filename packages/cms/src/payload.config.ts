import path from 'path';
import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { fileURLToPath } from 'url';

// Collections für Elite Affiliate Management
import { Products } from './collections/Products';
import { AffiliateNetworks } from './collections/AffiliateNetworks';
import { Campaigns } from './collections/Campaigns';
import { PerformanceMetrics } from './collections/PerformanceMetrics';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: 'gravatar',
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 1024,
          height: 768,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Products,
    AffiliateNetworks,
    Campaigns,
    PerformanceMetrics,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/niche-engine',
  }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  routes: {
    api: '/cms/api',
    admin: '/cms/admin',
  },
});
