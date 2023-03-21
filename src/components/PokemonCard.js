import React from "react";
import usePokemon from "../hooks/usePokemon";

export default function PokemonCard({pokemon}) {
  
  const name = {pokemon};
  const { result, error } = usePokemon(name);

  if(error) {return <div>failed to load</div>
  }
  

}
