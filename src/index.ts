import { Elysia } from "elysia";
import { fetchFromDB, findFromDB, buildRSS } from './utils'
import { getPopular, getNowPlaying, getTopRated,  } from './callout/tmdb'

const BUILD_RESULT = (movie_list:any = []) => ({
    ok: !!movie_list?.length,
    count: movie_list?.length,
    movies: movie_list
})

const fetchTMDBData  = async (callout:any, page:number = 1, last_page:number = 0) => {
    const last_page_number = Number(last_page)
    const page_number = Number(page) || 1
    if (last_page_number < page_number) return await callout(page_number) 

    let movie_list:any = []
    for (let current_page = page_number; current_page < last_page_number; current_page++) {
        const { results } = await callout(current_page)

        if (results) {
            movie_list = movie_list.concat(results)
        }
    }

    return { results: movie_list }
}

const app = new Elysia()
    .group('/movies', app => app
        .get('/search', async ({ query = {} } : any) => {
            return BUILD_RESULT(await findFromDB(query))
        })
        .get('/popular', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await fetchTMDBData(getPopular, query?.page, query?.last_page), query))
        })
        .get('/popular/rss', async ({ query } : any) => {
            return buildRSS(await fetchFromDB(await fetchTMDBData(getPopular, query?.page, query?.last_page), query))
        })
        .get('/now_playing', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await fetchTMDBData(getNowPlaying, query?.page, query?.last_page), query))
        })
        .get('/now_playing/rss', async ({ query } : any) => {
            return buildRSS(await fetchFromDB(await fetchTMDBData(getNowPlaying, query?.page, query?.last_page), query))
        })
        .get('/top_rated', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await fetchTMDBData(getTopRated, query?.page, query?.last_page), query))
        })
        .get('/top_rated/rss', async ({ query } : any) => {
            return buildRSS(await fetchFromDB(await fetchTMDBData(getTopRated, query?.page, query?.last_page), query))
        })
    )
    .get("/", () => {
        return 'Welcome to salida-api!\nPlease reach out to tun for more info!' 
    })
    .listen({
        port: process.env.PORT,
        hostname: process.env.HOST
    });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
