import { fetchTypeList, PokeApiRequestError } from '@/lib/pokeapi';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const types = await fetchTypeList();

    return res.status(200).json({
      types: ['all', ...types],
    });
  } catch (error) {
    if (error instanceof PokeApiRequestError) {
      return res.status(502).json({ error: 'POKEAPI_UNAVAILABLE' });
    }

    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
