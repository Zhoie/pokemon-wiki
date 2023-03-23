import styles from '../styles/Home.module.css';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home(props) {
  const router = useRouter()

  return(
    <div className={styles.container}>
      <Head> 
        <title>Pokemon</title>
      </Head>
      {props.data.map((pokemon, index) => {
        return(
          <div className={styles.pokemon} key={index}>
            <Link href={{pathname: `/pokemon/${pokemon.name}`}}>
              <button >
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`} alt={pokemon.name} />
                <h2>{pokemon.name}</h2>
              </button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export async function getStaticProps() {
  try{
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
    const data = await res.json()
    return {
      props: {
        data: data.results
      }
    }
  } catch (error) {
    console.log(error)
  }
}
