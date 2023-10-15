import { Elysia } from "elysia";
import { fetchFromDB, findFromDB, buildRSS } from './utils'
import { getPopular, getNowPlaying, getTopRated,  } from './callout/tmdb'

const BUILD_RESULT = (movie_list:any = []) => ({
    ok: !!movie_list?.length,
    count: movie_list?.length,
    movies: movie_list
})

const app = new Elysia()
    .group('/movies', app => app
        .get('/search', async ({ query = {} } : any) => {
            return BUILD_RESULT(await findFromDB(query))
        })
        .get('/popular', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await getPopular(query?.page), query))
        })
        .get('/popular/rss', async ({ query } : any) => {
            return buildRSS(await fetchFromDB(await getPopular(query?.page), query))
        })
        .get('/now_playing', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await getNowPlaying(query?.page), query))
        })
        .get('/top_rated', async ({ query } : any) => {
            return BUILD_RESULT(await fetchFromDB(await getTopRated(query?.page), query))
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
