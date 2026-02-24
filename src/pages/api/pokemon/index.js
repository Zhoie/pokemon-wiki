import {
  fetchPokemonById,
  fetchPokemonList,
  fetchPokemonNamesByType,
  PokeApiNotFoundError,
  PokeApiRequestError,
} from '@/lib/pokeapi';

const PAGE_SIZE = 24;
const DEFAULT_SORT = 'id-asc';

const SORTERS = {
  'id-asc': (a, b) => a.id - b.id,
  'id-desc': (a, b) => b.id - a.id,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
};

function normalizeString(value) {
  return String(value || '').trim().toLowerCase();
}

function getFallbackSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function formatCardItem(detail, fallbackName) {
  return {
    id: detail.id,
    name: detail.name || fallbackName,
    image:
      detail.sprites?.other?.['official-artwork']?.front_default ||
      detail.sprites?.front_default ||
      getFallbackSprite(detail.id),
    types: (detail.types || []).map((entry) => entry.type.name),
  };
}

function normalizePage(value) {
  const parsed = Number.parseInt(String(value || '1'), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const q = normalizeString(req.query.q);
  const type = normalizeString(req.query.type) || 'all';
  const sort = normalizeString(req.query.sort) || DEFAULT_SORT;

  if (!SORTERS[sort]) {
    return res.status(400).json({ error: 'INVALID_SORT' });
  }

  const requestedPage = normalizePage(req.query.page);

  try {
    const list = await fetchPokemonList();

    let filtered = list;

    if (type !== 'all') {
      const typeResult = await fetchPokemonNamesByType(type);

      if (!typeResult.found) {
        filtered = [];
      } else {
        filtered = filtered.filter((entry) => typeResult.names.has(entry.name));
      }
    }

    if (q) {
      filtered = filtered.filter((entry) => entry.name.includes(q));
    }

    const sorted = [...filtered].sort(SORTERS[sort]);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);

    const start = (page - 1) * PAGE_SIZE;
    const paginated = sorted.slice(start, start + PAGE_SIZE);

    const items = await Promise.all(
      paginated.map(async (entry) => {
        try {
          const detail = await fetchPokemonById(entry.id);
          return formatCardItem(detail, entry.name);
        } catch (error) {
          if (error instanceof PokeApiNotFoundError) {
            return {
              id: entry.id,
              name: entry.name,
              image: getFallbackSprite(entry.id),
              types: [],
            };
          }

          throw error;
        }
      })
    );

    return res.status(200).json({
      items,
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
    });
  } catch (error) {
    if (error instanceof PokeApiRequestError) {
      return res.status(502).json({ error: 'POKEAPI_UNAVAILABLE' });
    }

    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
