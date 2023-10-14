const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API}`
    }
}

async function main() {
    const generic_genres = await prisma.genre.createMany({
        data: (await (await fetch('https://api.themoviedb.org/3/genre/list', options)).json()).genres,
        skipDuplicates: true
    })

    const movie_genres = await prisma.genre.createMany({
        data: (await (await fetch('https://api.themoviedb.org/3/genre/movie/list', options)).json()).genres,
        skipDuplicates: true
    })

    const tv_genres = await prisma.genre.createMany({
        data: (await (await fetch('https://api.themoviedb.org/3/genre/tv/list', options)).json()).genres,
        skipDuplicates: true
    })

    console.log({ generic_genres, movie_genres, tv_genres })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
