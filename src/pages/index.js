import { ArrowClockwise, Compass, Sparkle, WarningCircle } from '@phosphor-icons/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FiltersBar from '@/components/FiltersBar';
import MagneticButton from '@/components/MagneticButton';
import Pagination from '@/components/Pagination';
import PokemonCard from '@/components/PokemonCard';
import styles from '../styles/Home.module.css';

const DEFAULT_QUERY = {
  q: '',
  type: 'all',
  sort: 'id-asc',
  page: 1,
};

const VALID_SORTS = new Set(['id-asc', 'id-desc', 'name-asc', 'name-desc']);
const SORT_LABELS = {
  'id-asc': 'ID low to high',
  'id-desc': 'ID high to low',
  'name-asc': 'Name A to Z',
  'name-desc': 'Name Z to A',
};

const DEFAULT_COLLECTION = {
  items: [],
  page: 1,
  pageSize: 24,
  totalItems: 0,
  totalPages: 1,
};

function normalizeQuery(query) {
  const rawQ = typeof query.q === 'string' ? query.q.trim().toLowerCase() : '';
  const rawType = typeof query.type === 'string' ? query.type.trim().toLowerCase() : 'all';
  const rawSort = typeof query.sort === 'string' ? query.sort.trim().toLowerCase() : 'id-asc';
  const parsedPage = Number.parseInt(String(query.page || '1'), 10);

  return {
    q: rawQ,
    type: rawType || DEFAULT_QUERY.type,
    sort: VALID_SORTS.has(rawSort) ? rawSort : DEFAULT_QUERY.sort,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_QUERY.page,
  };
}

function getRouterQuery(state) {
  const query = {};

  if (state.q) {
    query.q = state.q;
  }

  if (state.type !== DEFAULT_QUERY.type) {
    query.type = state.type;
  }

  if (state.sort !== DEFAULT_QUERY.sort) {
    query.sort = state.sort;
  }

  if (state.page !== DEFAULT_QUERY.page) {
    query.page = String(state.page);
  }

  return query;
}

function areSameState(a, b) {
  return a.q === b.q && a.type === b.type && a.sort === b.sort && a.page === b.page;
}

function getErrorMessage(code) {
  if (code === 'POKEAPI_UNAVAILABLE') {
    return 'The upstream source is unavailable. Retry in a moment.';
  }

  if (code === 'INVALID_SORT') {
    return 'Sort mode is invalid. Choose a valid sort rule.';
  }

  return 'Unable to load the catalog right now.';
}

function toDisplay(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function LoadingGrid() {
  return (
    <div className={`${styles.grid} ${styles.loadingGrid}`}>
      {Array.from({ length: 12 }).map((_, index) => (
        <article
          key={`skeleton-${index}`}
          className={styles.skeletonCard}
          style={{ '--index': index }}
          aria-hidden="true"
        >
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonImage} />
          <span className={styles.skeletonLineLong} />
        </article>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const queryState = useMemo(() => normalizeQuery(router.query), [router.query]);

  const [searchInput, setSearchInput] = useState('');
  const [types, setTypes] = useState(['all']);
  const [typesError, setTypesError] = useState('');
  const [collection, setCollection] = useState(DEFAULT_COLLECTION);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState('');
  const [retryTick, setRetryTick] = useState(0);
  const [typesRetryTick, setTypesRetryTick] = useState(0);

  const setRouteState = useCallback(
    (patch, options = {}) => {
      if (!router.isReady) {
        return;
      }

      const next = normalizeQuery({
        ...queryState,
        ...patch,
      });

      if (areSameState(next, queryState)) {
        return;
      }

      const navigate = options.replace ? router.replace : router.push;
      void navigate(
        {
          pathname: '/',
          query: getRouterQuery(next),
        },
        undefined,
        {
          shallow: true,
          scroll: false,
        }
      );
    },
    [queryState, router]
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setSearchInput(queryState.q);
  }, [queryState.q, router.isReady]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const normalizedInput = searchInput.trim().toLowerCase();
    if (normalizedInput === queryState.q) {
      return;
    }

    const debounceId = setTimeout(() => {
      setRouteState(
        {
          q: normalizedInput,
          page: 1,
        },
        {
          replace: true,
        }
      );
    }, 250);

    return () => {
      clearTimeout(debounceId);
    };
  }, [queryState.q, router.isReady, searchInput, setRouteState]);

  useEffect(() => {
    let isActive = true;

    async function loadTypes() {
      setTypesError('');

      try {
        const response = await fetch('/api/pokemon/types');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'INTERNAL_SERVER_ERROR');
        }

        if (!Array.isArray(payload.types) || payload.types.length === 0) {
          throw new Error('INTERNAL_SERVER_ERROR');
        }

        if (isActive) {
          setTypes(payload.types);
        }
      } catch {
        if (isActive) {
          setTypes(['all']);
          setTypesError('Type options did not load. Browsing still works with the default type.');
        }
      }
    }

    loadTypes();

    return () => {
      isActive = false;
    };
  }, [typesRetryTick]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    let isActive = true;

    async function loadCollection() {
      setLoading(true);
      setErrorCode('');

      const params = new URLSearchParams({
        q: queryState.q,
        type: queryState.type,
        sort: queryState.sort,
        page: String(queryState.page),
      });

      try {
        const response = await fetch(`/api/pokemon?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'INTERNAL_SERVER_ERROR');
        }

        if (isActive) {
          setCollection({
            items: payload.items || [],
            page: payload.page || 1,
            pageSize: payload.pageSize || 24,
            totalItems: payload.totalItems || 0,
            totalPages: payload.totalPages || 1,
          });

          if (payload.page && payload.page !== queryState.page) {
            setRouteState({ page: payload.page }, { replace: true });
          }
        }
      } catch (error) {
        if (isActive) {
          setErrorCode(error.message || 'INTERNAL_SERVER_ERROR');
          setCollection(DEFAULT_COLLECTION);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCollection();

    return () => {
      isActive = false;
    };
  }, [queryState.page, queryState.q, queryState.sort, queryState.type, retryTick, router.isReady, setRouteState]);

  const availableTypes = useMemo(() => {
    if (types.includes(queryState.type)) {
      return types;
    }

    if (queryState.type === 'all') {
      return types;
    }

    return ['all', queryState.type, ...types.filter((type) => type !== 'all' && type !== queryState.type)];
  }, [queryState.type, types]);

  const showingFrom = collection.totalItems === 0 ? 0 : (collection.page - 1) * collection.pageSize + 1;
  const showingTo = collection.totalItems === 0 ? 0 : Math.min(collection.totalItems, collection.page * collection.pageSize);

  const currentSpotlight = collection.items[0] || null;
  const activeTags = [
    queryState.q ? `Search: ${queryState.q}` : 'Search: all names',
    queryState.type === 'all' ? 'Type: all classes' : `Type: ${toDisplay(queryState.type)}`,
    `Sort: ${SORT_LABELS[queryState.sort]}`,
  ];

  return (
    <>
      <Head>
        <title>Pokemon Wiki | Complete Pokedex</title>
        <meta
          name="description"
          content="Browse every Pokemon with precision filters, ranked sorting, and profile deep-dives."
        />
      </Head>

      <div className={styles.page}>
        <section className={styles.heroFrame}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>Field Guide</p>
            <h1 className={styles.title}>Track every species with a high-precision catalog.</h1>
            <p className={styles.subtitle}>
              Query by name, type, and sort mode without losing URL shareability. The current view is always
              reproducible and easy to pass across teams.
            </p>

            <div className={styles.heroActions}>
              <MagneticButton
                className={styles.primaryButton}
                onClick={() => {
                  setSearchInput('');
                  setRouteState(DEFAULT_QUERY);
                }}
              >
                Reset view
              </MagneticButton>

              <Link href={currentSpotlight ? `/pokemon/${currentSpotlight.name}` : '/pokemon/pikachu'} className={styles.secondaryLink}>
                Open spotlight profile
              </Link>
            </div>
          </div>

          <aside className={styles.heroPanel}>
            <h2>Session Snapshot</h2>
            <ul className={styles.snapshotList}>
              <li>
                <span className={styles.snapshotLabel}>Visible Entries</span>
                <strong>{collection.totalItems.toLocaleString()}</strong>
              </li>
              <li>
                <span className={styles.snapshotLabel}>Current Page</span>
                <strong>{collection.page}</strong>
              </li>
              <li>
                <span className={styles.snapshotLabel}>Sort Logic</span>
                <strong>{SORT_LABELS[queryState.sort]}</strong>
              </li>
            </ul>

            <p className={styles.panelStatus}>
              <Sparkle size={15} aria-hidden="true" />
              Live catalog refreshes with each filter mutation.
            </p>
          </aside>
        </section>

        <section className={styles.controlPanel}>
          <FiltersBar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            typeValue={queryState.type}
            onTypeChange={(type) => setRouteState({ type, page: 1 })}
            sortValue={queryState.sort}
            onSortChange={(sort) => setRouteState({ sort, page: 1 })}
            typeOptions={availableTypes}
            disabled={loading && collection.items.length === 0}
          />

          {typesError ? (
            <div className={styles.inlineMessage}>
              <p>{typesError}</p>
              <button
                type="button"
                className={styles.inlineButton}
                onClick={() => setTypesRetryTick((value) => value + 1)}
              >
                Reload types
              </button>
            </div>
          ) : null}

          {!errorCode && loading && collection.items.length > 0 ? (
            <p className={styles.refreshNotice}>Refreshing list with your latest filters...</p>
          ) : null}
        </section>

        {errorCode ? (
          <section className={styles.statePanel}>
            <h2>Catalog Request Failed</h2>
            <p>{getErrorMessage(errorCode)}</p>
            <button
              type="button"
              className={styles.stateButton}
              onClick={() => setRetryTick((value) => value + 1)}
            >
              <ArrowClockwise size={16} aria-hidden="true" />
              Retry Request
            </button>
          </section>
        ) : null}

        {!errorCode && loading && collection.items.length === 0 ? (
          <section className={styles.statePanel}>
            <h2>Building the catalog surface</h2>
            <p>Loading entries and type metadata from the live source.</p>
            <LoadingGrid />
          </section>
        ) : null}

        {!errorCode && !loading && collection.items.length === 0 ? (
          <section className={styles.statePanel}>
            <h2>No entries matched this query</h2>
            <p>Adjust the filter set or reset to the default complete index.</p>
            <MagneticButton
              className={styles.stateButton}
              onClick={() => {
                setSearchInput('');
                setRouteState(DEFAULT_QUERY);
              }}
            >
              <Compass size={16} aria-hidden="true" />
              Clear Filters
            </MagneticButton>
          </section>
        ) : null}

        {!errorCode && collection.items.length > 0 ? (
          <>
            <section className={styles.resultsHeader}>
              <div>
                <p className={styles.resultsKicker}>Current Window</p>
                <h2>
                  Showing {showingFrom} to {showingTo} of {collection.totalItems.toLocaleString()} entries
                </h2>
              </div>

              <ul className={styles.tagList}>
                {activeTags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>

            <section className={styles.grid}>
              {collection.items.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </section>

            <Pagination
              page={collection.page}
              totalPages={collection.totalPages}
              onPageChange={(page) => setRouteState({ page })}
              disabled={loading}
            />
          </>
        ) : null}

        <p className={styles.footerNote}>
          <WarningCircle size={14} aria-hidden="true" />
          Catalog data is sourced directly from PokeAPI and may reflect upstream timing delays.
        </p>
      </div>
    </>
  );
}
