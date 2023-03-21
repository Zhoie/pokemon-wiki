import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then((response) => {
        const { results } = response.data;
        const pokemonNames = results.map((result) => result.name);
        setPokemonList(pokemonNames);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <h1>Pokedex</h1>
      <ul>
        {pokemonList.map((name) => (
          <li key={name}>
            <Link href={`/pokemon/${name}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
