import { getImdbCode } from './callout/tmdb'
import { PrismaClient } from '@prisma/client'
import { Feed } from 'feed'

const db = new PrismaClient()

const TRACKERS = [
    'tr=udp://open.demonii.com:1337/announce',
    'tr=udp://tracker.openbittorrent.com:80',
    'tr=udp://tracker.coppersurfer.tk:6969',
    'tr=udp://glotorrents.pw:6969/announce',
    'tr=udp://tracker.opentrackr.org:1337/announce',
    'tr=udp://torrent.gresille.org:80/announce',
    'tr=udp://p4p.arenabg.com:1337',
    'tr=udp://tracker.leechers-paradise.org:6969'
]
const BUILD_MAGNET = (hash:string, name:string) => `magnet:?xt=urn:btih:${hash}&dn=${name}&${TRACKERS.join('&')}`

const fetchFromDB = async (movie_list:any = [], query:any = {}) => {
    const movie_ids = movie_list.results.map((movie:any) => movie.id)
    const imdb_ids = await movie_ids.reduce(async (list:string[], current:number) => {
        const imdb_code = await getImdbCode(current)
        const all = await list
        if (imdb_code) return [...all, imdb_code]
        else return [...all]
    }, [])

    return await findFromDB(query, imdb_ids)
}

const findFromDB = async (query:any, imdb_ids?:any) => {
    const { title, year, genre, rating, quality, video_codec, type, media_type, exclude_genre} = query

    const filters:any = [
        { title: { search: title, mode: 'insensitive' } },
        { imdb_code: { in: imdb_ids?.length? imdb_ids : undefined }},
        { year: Number(year) || undefined },
        { rating: { gte: Number(rating) || undefined }},
        { media_type: { search: media_type, mode: 'insensitive' } },
        {
            genre: {
                some: {
                    name: {
                        in: genre?.split(','),
                        mode: 'insensitive'
                    }
                },
                none: {
                    name: {
                        in: exclude_genre?.split(',') || []
                    }
                }
            }
        },
    ]

    const torrent_filters:any = [
        { quality: { search: quality, mode: 'insensitive' } },
        { video_codec: { search: video_codec, mode: 'insensitive' } },
        { type: { search: type, mode: 'insensitive' } }
    ]

    if (filters.length) {
        return await db.movie.findMany({
            where: {
                AND: filters
            },
            include: {
                torrents: {
                    select: {
                        hash: true,
                        quality: true,
                        type: true,
                        video_codec: true
                    },
                    where: {
                        AND: torrent_filters
                    }
                },
                genre: true
            },
        })
    } else return []
}

const description = (torrent:any, poster:string, title:string) => {
    return `
        <img src="${poster}" alt="${title} width="100" height="200">
        <br/>
        <span><b>Quality</b>: ${torrent.quality}</span>
        <br/>
        <span><b>Type</b>: ${torrent.type}</span>
        <br/>
        <span><b>Video Codec</b>: ${torrent.video_codec}</span>
    `
}

const buildRSS = (movie_list:any) => {
    const feed = new Feed({
        title: "Salida RSS",
        description: "RSS feed for Salida",
        id: "http://salida.tunitz.xyz/",
        link: "http://salida.tunitz.xyz/",
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        copyright: `All rights reserved ${(new Date()).getFullYear()}, Salida`,
        updated: new Date(), // optional, default = today
        generator: "salida-rss", // optional, default = 'Feed for Node.js'
    });

    movie_list.forEach((movie:any) => {
        movie.torrents.forEach((torrent:any) => {
            feed.addItem({
                title: movie.title,
                link: BUILD_MAGNET(torrent.hash, movie.slug),
                description: description(torrent, movie.poster, movie.title),
                date: torrent.created_date,
                image: movie.poster
            })
        })
    })

    return feed.rss2()
}

export { fetchFromDB, findFromDB, buildRSS }