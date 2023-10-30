import { buildRSS2 } from './utils'
import { getPopular, getNowPlaying, getTopRated, getMovieDetails } from './callout/tmdb'
import { getYTSDetails } from './callout/yts'
import { Elysia } from 'elysia'

const BUILD_RESULT = (movie_list:any = []) => ({
    ok: !!movie_list?.length,
    count: movie_list?.length,
    movies: movie_list
})

const fetchBatchIds = async (callout:any, start:number = 1, end:number = 1) => {
    const start_page = Number(start) || 1
    const end_page = Number(end) || 1

    let movie_ids:number[] = []
    for (let current_page = start_page; current_page <= end_page; current_page++) {
        const { results } = await callout(current_page)

        if (Array.isArray(results)) {
            movie_ids = movie_ids.concat(results.map(item => item.id))
        }
    }
    return movie_ids
}

const fetchMovieDetails = async (ids:number[]) => {
    let movies:any = []

    for (const id of ids) {
        const movie = await getMovieDetails(id)
        if (movie) movies.push(movie)
    }

    return await movies
}

const fetchTorrents = async (movies:any, quality?:string) => {
    return await Promise.all(
        movies.map(async (movie:any) => {
            const { data } = await getYTSDetails(movie.imdb_id) || {}
            movie.torrents = filterTorrents(data?.movie?.torrents, quality)
            return movie
        })
    )
}

const filterTorrents = (torrents:any = [], quality?:string) => {
    if (!quality) return torrents
    const torrent = torrents.sort((a:any, b:any) => a.seeds > b.seeds).find((torrent:any) => torrent.quality === quality)

    if (torrent) return [torrent]
    else return []
}

const app = new Elysia()
    .get("/", () => {
        return 'Welcome to salida-api!\nPlease reach out to tun for more info!' 
    })
    .get("/popular", async ({ query }) => {
        const { start, end }:any = query
        return BUILD_RESULT(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getPopular, start, end))))
    })
    .get("/popular/rss", async ({ query }) => {
        const { start, end, quality }:any = query
        return buildRSS2(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getPopular, start, end)), quality))
    })
    .get("/top_rated", async ({ query }) => {
        const { start, end }:any = query
        return BUILD_RESULT(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getTopRated, start, end))))
    })
    .get("/top_rated/rss", async ({ query }) => {
        const { start, end, quality }:any = query
        return buildRSS2(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getTopRated, start, end)), quality))
    })
    .get("/now_playing", async ({ query }) => {
        const { start, end }:any = query
        return BUILD_RESULT(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getNowPlaying, start, end))))
    })
    .get("/now_playing/rss", async ({ query }) => {
        const { start, end, quality }:any = query
        return buildRSS2(await fetchTorrents(await fetchMovieDetails(await fetchBatchIds(getNowPlaying, start, end)), quality))
    })
    .listen({
        port: process.env.PORT,
        hostname: process.env.HOST
    });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
