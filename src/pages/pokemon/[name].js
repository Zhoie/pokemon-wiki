import styles from '../../styles/Pokemon.module.css'



export default function Pokemon(props) {
    const height = props.data.height / 10
    const weight = props.data.weight / 10

    return (
        <>
            <div className={styles.pokemonCard}>
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.data.id}.png`} alt={props.data.name} />
                <ul className={styles.pokemonDetails}>
                    <li><span className={styles.pokemonLabel}>id:</span>{props.data.id}</li>
                    <li><span className={styles.pokemonLabel}>name:</span> {props.data.name}</li>
                    <li><span className={styles.pokemonLabel}>height:</span> {height} m</li>
                    <li><span className={styles.pokemonLabel}>weight:</span> {weight} kg</li>
                    <li><span className={styles.pokemonLabel}>base experience:</span> {props.data.base_experience}</li>

                </ul>
            </div>

        </>

    )
}


export async function getServerSideProps({ query }) {

    const name = query.name;


    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        const data = await res.json()

        console.log(data)

        return {
            props: {
                data: data
            }
        }
    } catch (error) {
        console.log(error)
    }

}
