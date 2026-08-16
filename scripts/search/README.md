# Local Search Booster (Typesense) — Prototype

This folder contains a minimal prototype to run a local Typesense instance and index a sample product payload. It's designed to be a developer starting point for the "Search Booster" described in the docs/architecture/browse-navigation.md blueprint.

Prerequisites
- Docker & Docker Compose
- Node 16+ (for running the indexer)

Run Typesense locally
1. From the repository root run:

   docker compose -f docker/search/docker-compose.yml up -d

2. Typesense will be available at http://localhost:8108 with API key `xyz123` (development only). Do not use this key in production.

Index sample products
1. Change to the scripts/search folder and install dependencies:

   cd scripts/search
   npm install

2. Run the indexer (it uses the default API key and localhost):

   npm run index

What this does
- Creates a `products` collection in Typesense with schema fields for title, description, vendor, categories, price, rating, inventory and tags.
- Imports the sample-products.json payload.

Next steps
- Replace sample-products.json with a real ETL that pulls from Shopify/CMS.
- Add webhooks to push incremental updates to Typesense.
- Add pagination, synonyms, n-gram preprocessing and vector similarity stage if needed.
