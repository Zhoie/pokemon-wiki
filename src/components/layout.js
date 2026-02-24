import Link from 'next/link'
import Head from 'next/head'

export default function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Pokemon</title>
            </Head>
            <h1 className="nav-title">Pokemon Dex</h1>
            <nav className="header-nav">
                <ul>
                    <li><Link href="/">home</Link></li>
                </ul>
            </nav>

            {children}
        </>
    )
}
