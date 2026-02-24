import { ArrowUpRight, Sparkle } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PokemonCard.module.css';

function formatName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getVariantClass(id) {
  const variant = id % 8;

  if (variant === 2 || variant === 6) {
    return styles.wide;
  }

  if (variant === 4) {
    return styles.tall;
  }

  return '';
}

export default function PokemonCard({ pokemon }) {
  const variantClass = getVariantClass(pokemon.id);
  const primaryType = pokemon.types[0] || 'unknown';

  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className={`${styles.card} ${variantClass}`}
      style={{ '--index': pokemon.id % 12 }}
    >
      <header className={styles.topRow}>
        <span className={styles.id}>#{String(pokemon.id).padStart(4, '0')}</span>
        <span className={styles.detailLink}>
          Profile
          <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </header>

      <div className={styles.imageWrap}>
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={220}
          height={220}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <h2 className={styles.name}>{formatName(pokemon.name)}</h2>

      <footer className={styles.footerRow}>
        <ul className={styles.types}>
          {pokemon.types.map((type) => (
            <li key={type} className={styles.type}>
              {type}
            </li>
          ))}
        </ul>

        <p className={styles.metaTag}>
          <Sparkle size={13} aria-hidden="true" />
          {primaryType}
        </p>
      </footer>
    </Link>
  );
}
