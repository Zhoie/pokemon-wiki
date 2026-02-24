import { ArrowLeft, Barbell, Lightning, Ruler, Star } from '@phosphor-icons/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPokemonByName, PokeApiNotFoundError } from '@/lib/pokeapi';
import styles from '../../styles/Pokemon.module.css';

function formatLabel(value) {
  return String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
    types: (data.types || []).map((entry) => entry.type.name),
    abilities: (data.abilities || []).map((entry) => entry.ability.name),
    stats: (data.stats || []).map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
    height: data.height / 10,
    weight: data.weight / 10,
    baseExperience: data.base_experience,
  };
}

export default function PokemonDetail({ pokemon }) {
  const peakStat = pokemon.stats.reduce((result, stat) => {
    if (stat.value > result.value) {
      return stat;
    }

    return result;
  }, pokemon.stats[0]);

  return (
    <>
      <Head>
        <title>{formatLabel(pokemon.name)} | Pokemon Wiki</title>
        <meta
          name="description"
          content={`View detailed stats, abilities, and type data for ${pokemon.name}.`}
        />
      </Head>

      <article className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Return to Index
          </Link>

          <div>
            <p className={styles.id}>#{String(pokemon.id).padStart(4, '0')}</p>
            <h1 className={styles.name}>{formatLabel(pokemon.name)}</h1>
            <p className={styles.subtitle}>Deep profile with physical metrics, ability tags, and stat distribution.</p>
          </div>
        </header>

        <section className={styles.heroGrid}>
          <div className={styles.visualPanel}>
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={360}
              height={360}
              priority
              className={styles.spriteImage}
            />

            <ul className={styles.typeOrbit}>
              {pokemon.types.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </div>

          <div className={styles.infoColumn}>
            <dl className={styles.metrics}>
              <div>
                <dt>
                  <Ruler size={15} aria-hidden="true" />
                  Height
                </dt>
                <dd>{pokemon.height} m</dd>
              </div>

              <div>
                <dt>
                  <Barbell size={15} aria-hidden="true" />
                  Weight
                </dt>
                <dd>{pokemon.weight} kg</dd>
              </div>

              <div>
                <dt>
                  <Star size={15} aria-hidden="true" />
                  Base Experience
                </dt>
                <dd>{pokemon.baseExperience}</dd>
              </div>
            </dl>

            <section className={styles.infoBlock}>
              <h2>Abilities</h2>
              <ul className={styles.tokenList}>
                {pokemon.abilities.map((ability) => (
                  <li key={ability}>{formatLabel(ability)}</li>
                ))}
              </ul>
            </section>

            <section className={styles.infoBlock}>
              <h2>Peak Stat</h2>
              <p className={styles.peakStat}>
                <Lightning size={15} aria-hidden="true" />
                {formatLabel(peakStat.name)} at {peakStat.value}
              </p>
            </section>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsHeader}>
            <h2>Base Stat Map</h2>
            <p>Bars are normalized to a 180-point scale.</p>
          </div>

          <ul className={styles.statsList}>
            {pokemon.stats.map((stat, index) => {
              const barWidth = Math.min(100, Math.round((stat.value / 180) * 100));

              return (
                <li key={stat.name} className={styles.statRow} style={{ '--index': index }}>
                  <p className={styles.statName}>{formatLabel(stat.name)}</p>
                  <div className={styles.statBarTrack}>
                    <span className={styles.statBarFill} style={{ width: `${barWidth}%` }} />
                  </div>
                  <p className={styles.statValue}>{stat.value}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </article>
    </>
  );
}

export async function getStaticProps({ params }) {
  const name = String(params?.name || '').trim().toLowerCase();

  if (!name) {
    return {
      notFound: true,
    };
  }

  try {
    const pokemon = await fetchPokemonByName(name);

    return {
      props: {
        pokemon: formatPokemon(pokemon),
      },
      revalidate: 86400,
    };
  } catch (error) {
    if (error instanceof PokeApiNotFoundError) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    throw error;
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
