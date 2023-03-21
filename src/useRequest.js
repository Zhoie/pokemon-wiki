import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

const API_URL = 'https://pokeapi.co/api/v2/pokemon'
const PAGE_LIMINT = 100


export default function fetchPokemon(name) {

    const url = name ? `${API_URL}/${name}` : `${API_URL}?limit=${PAGE_LIMINT}`
    const { data }  = useSWR(url, fetcher)

    console.log(data)
    return data
}