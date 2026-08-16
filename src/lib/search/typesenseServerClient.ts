import Typesense from 'typesense';

const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || process.env.SEARCH_API_KEY || 'xyz123';
const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = Number(process.env.TYPESENSE_PORT || 8108);
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';

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

export async function searchProducts({
  q = '',
  page = 1,
  per_page = 20,
  filters = '',
  sort_by = '',
}: {
  q?: string;
  page?: number;
  per_page?: number;
  filters?: string;
  sort_by?: string;
}) {
  const searchParameters: any = {
    q: q || '*',
    query_by: 'title,description,tags',
    page,
    per_page,
    sort_by: sort_by || undefined,
  };

  if (filters) {
    searchParameters.filter_by = filters;
  }

  const res = await client.collections('products').documents().search(searchParameters);
  return res;
}
