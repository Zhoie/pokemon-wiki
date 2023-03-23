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
              <h1>{pokemon.name}</h1>
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`} alt={pokemon.name} /> 
              
            </div>

          )

        })
      }
      
    </div>
  )
}



export async function getStaticProps() {

  // const limit = 20
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
  const data = await res.json()

  return {
    props: {
      data: data.results
    }
  }

}

