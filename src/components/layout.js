import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="site-header">
        <div className="site-shell header-grid">
          <Link href="/" className="brand-link">
            <span className="brand-eyebrow">National Index</span>
            <span className="brand-title">Pokemon Wiki</span>
          </Link>

          <nav className="site-nav" aria-label="Primary">
            <Link href="/">Pokedex</Link>
            <Link href="/pokemon/pikachu">Starter Profile</Link>
          </nav>

          <p className="status-pill">
            <span className="status-dot" aria-hidden="true" />
            Live PokeAPI
          </p>
        </div>
      </header>

      <main className="site-main">
        <div className="site-shell">{children}</div>
      </main>
    </>
  );
}
