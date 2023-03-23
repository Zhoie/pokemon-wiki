import { useRouter } from 'next/router'

import styles from '../../styles/Pokemon.module.css'


export default function Pokemon(props) {

    const router = useRouter()
   
    return (
        <>
            <div className = "pokemonCard">
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.data.id}.png`} alt={props.data.name} />
                <ul>
                    <li>id:{props.data.id}</li>
                    <li>name: {props.data.name}</li>
                    <li>height: {props.data.height}</li>
                    <li>weight: {props.data.weight}</li>
                    <li>base experience: {props.data.base_experience}</li>

                </ul>
            </div>
            
        </> 
        
    )
}


export async function getServerSideProps({query}) {

    const name = query.name;


    try{
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        const data = await res.json()

        console.log(data)
        
        return {
            props: {
            data: data
            }
        }
    } catch {
        console.log(error)
    }

}

