// Simple Typesense indexer for local prototype

import fs from 'fs';
import path from 'path';
import Typesense from 'typesense';

const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY ?? 'xyz123';
const TYPESENSE_HOST = process.env.TYPESENSE_HOST ?? 'localhost';
const TYPESENSE_PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL ?? 'http';

const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 5,
});

const COLLECTION_NAME = 'products';

async function ensureCollection(schema: any) {
  try {
    // Try to delete existing collection if present
    try {
      await client.collections(COLLECTION_NAME).retrieve();
      console.log('Collection exists. Deleting...');
      await client.collections(COLLECTION_NAME).delete();
    } catch (err) {
      // collection does not exist; ignore
    }

    console.log('Creating collection...');
    await client.collections().create(schema);
  } catch (err) {
    console.error('Failed creating collection:', err);
    process.exit(1);
  }
}

async function importDocuments(docs: any[]) {
  const CHUNK = 50;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = docs.slice(i, i + CHUNK);
    try {
      const payload = batch.map((d: any) => JSON.stringify(d)).join('\n');
      const res = await client.collections(COLLECTION_NAME).documents().import(payload, { action: 'upsert' });
      console.log('Imported batch', Math.floor(i / CHUNK), res);
    } catch (e) {
      console.error('Import error:', e);
      process.exit(1);
    }
  }
}

async function run() {
  const samplePath = path.join(__dirname, 'sample-products.json');
  if (!fs.existsSync(samplePath)) {
    console.error('sample-products.json not found in', samplePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(samplePath, 'utf8');
  const docs = JSON.parse(raw);

  // Define collection schema
  const schema = {
    name: COLLECTION_NAME,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'vendor', type: 'string', facet: true },
      { name: 'categories', type: 'string[]', facet: true },
      { name: 'price', type: 'float', facet: true },
      { name: 'rating', type: 'float', facet: true },
      { name: 'inventory', type: 'int32' },
      { name: 'published_at', type: 'int64' },
      { name: 'tags', type: 'string[]', facet: true },
    ],
    default_sorting_field: 'published_at',
  };

  await ensureCollection(schema);
  await importDocuments(docs);

  console.log('Indexing complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
