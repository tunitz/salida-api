const base = 'https://api.themoviedb.org/3'
const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_API}`
    }
};

const BUILD_URL = (path:string, params?:any) => {
    let params_parased  = []
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            params_parased.push(`${key}=${value}`)
        }
    }

    return fetch(`${base}${path}?${params_parased.join('&')}`, options)
}

const getNowPlaying = async (page:number= 1, language:string = 'en-US') => {
    const res = await BUILD_URL('/movie/now_playing', {page, language});
    if (!res.ok) return null

    return await res.json()
}

const getPopular = async (page:number = 1, language:string = 'en-US') => {
    const res = await BUILD_URL('/movie/popular', {page, language});
    if (!res.ok) return []

    return await res.json()
}

const getTopRated = async (page:number = 1, language:string = 'en-US') => {
    const res = await BUILD_URL('/movie/top_rated', {page, language});
    if (!res.ok) return []

    return await res.json()
}

const getImdbCode = async (movie_id:number = 1, language:string = 'en-US') => {
    const res = await BUILD_URL(`/movie/${movie_id}?append_to_response=external_ids&language=${language}`);
    if (!res.ok) return null

    const data = await res.json()
    return data.imdb_id ? data.imdb_id : null
}

export { getNowPlaying, getPopular, getTopRated, getImdbCode }