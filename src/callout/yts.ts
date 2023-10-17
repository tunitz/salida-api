const base = 'https://yts.mx/api/v2/movie_details.json'

const getYTSDetails = async (id:string) => {
    const res = await fetch(`${base}?imdb_id=${id}`);
    if (!res.ok) return null

    return await res.json()
}

export { getYTSDetails }