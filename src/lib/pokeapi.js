const BASE_URL = 'https://pokeapi.co/api/v2';

const MASTER_LIST_TTL_MS = 6 * 60 * 60 * 1000;
const TYPE_MEMBERSHIP_TTL_MS = 6 * 60 * 60 * 1000;
const POKEMON_DETAIL_TTL_MS = 24 * 60 * 60 * 1000;

const masterListCache = {
  data: null,
  expiresAt: 0,
};

const typeListCache = {
  data: null,
  expiresAt: 0,
};

const typeMembershipCache = new Map();
const pokemonDetailCache = new Map();

export class PokeApiRequestError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'PokeApiRequestError';
    this.status = status;
  }
}

export class PokeApiNotFoundError extends PokeApiRequestError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'PokeApiNotFoundError';
  }
}

function isFresh(cacheEntry) {
  return Boolean(cacheEntry?.data) && cacheEntry.expiresAt > Date.now();
}

function getMapCache(map, key) {
  const entry = map.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    map.delete(key);
    return null;
  }

  return entry.data;
}

function setMapCache(map, key, data, ttlMs) {
  map.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

async function fetchFromPokeApi(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`);

  if (response.status === 404) {
    throw new PokeApiNotFoundError();
  }

  if (!response.ok) {
    throw new PokeApiRequestError('Failed to fetch from PokeAPI', response.status);
  }

  return response.json();
}

export function parsePokemonIdFromUrl(url = '') {
  const match = String(url).match(/\/pokemon\/(\d+)\/?$/i);
  return match ? Number(match[1]) : null;
}

export async function fetchPokemonList() {
  if (isFresh(masterListCache)) {
    return masterListCache.data;
  }

  const payload = await fetchFromPokeApi('/pokemon?limit=2000&offset=0');

  const list = payload.results
    .map((entry) => {
      const id = parsePokemonIdFromUrl(entry.url);

      if (!id) {
        return null;
      }

      return {
        id,
        name: entry.name,
        url: entry.url,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);

  masterListCache.data = list;
  masterListCache.expiresAt = Date.now() + MASTER_LIST_TTL_MS;

  return list;
}

export async function fetchTypeList() {
  if (isFresh(typeListCache)) {
    return typeListCache.data;
  }

  const payload = await fetchFromPokeApi('/type');

  const types = payload.results
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  typeListCache.data = types;
  typeListCache.expiresAt = Date.now() + TYPE_MEMBERSHIP_TTL_MS;

  return types;
}

export async function fetchPokemonNamesByType(typeName) {
  const normalizedType = String(typeName || '').trim().toLowerCase();

  if (!normalizedType) {
    return {
      found: false,
      names: new Set(),
    };
  }

  const cached = getMapCache(typeMembershipCache, normalizedType);
  if (cached) {
    return cached;
  }

  try {
    const payload = await fetchFromPokeApi(`/type/${normalizedType}`);

    const names = new Set(
      payload.pokemon
        .map((entry) => entry?.pokemon?.name)
        .filter(Boolean)
    );

    const result = {
      found: true,
      names,
    };

    setMapCache(typeMembershipCache, normalizedType, result, TYPE_MEMBERSHIP_TTL_MS);
    return result;
  } catch (error) {
    if (error instanceof PokeApiNotFoundError) {
      const emptyResult = {
        found: false,
        names: new Set(),
      };

      setMapCache(typeMembershipCache, normalizedType, emptyResult, TYPE_MEMBERSHIP_TTL_MS);
      return emptyResult;
    }

    throw error;
  }
}

function cachePokemonDetail(data) {
  if (!data || !data.name || !data.id) {
    return;
  }

  setMapCache(pokemonDetailCache, `name:${data.name}`, data, POKEMON_DETAIL_TTL_MS);
  setMapCache(pokemonDetailCache, `id:${data.id}`, data, POKEMON_DETAIL_TTL_MS);
}

export async function fetchPokemonByName(name) {
  const normalizedName = String(name || '').trim().toLowerCase();

  if (!normalizedName) {
    throw new PokeApiNotFoundError('Pokemon name is required');
  }

  const cached = getMapCache(pokemonDetailCache, `name:${normalizedName}`);
  if (cached) {
    return cached;
  }

  const payload = await fetchFromPokeApi(`/pokemon/${normalizedName}`);
  cachePokemonDetail(payload);
  return payload;
}

export async function fetchPokemonById(id) {
  const normalizedId = Number(id);

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw new PokeApiNotFoundError('Pokemon id is invalid');
  }

  const cached = getMapCache(pokemonDetailCache, `id:${normalizedId}`);
  if (cached) {
    return cached;
  }

  const payload = await fetchFromPokeApi(`/pokemon/${normalizedId}`);
  cachePokemonDetail(payload);
  return payload;
}
