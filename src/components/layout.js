import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
    const router = useRouter()

    return(
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

            { children }
        </>
    )
}
