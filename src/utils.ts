import { getImdbCode } from './callout/tmdb'
import { Feed } from 'feed'

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
const BUILD_MAGNET = (hash: string, name: string) => `magnet:?xt=urn:btih:${hash}&dn=${name}&${TRACKERS.join('&')}`

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original'

const description2 = (torrent:any, movie:any) => {
    return `
        <img src="${IMAGE_BASE+movie.poster_path}" alt="${movie.original_title} width="100" height="200">
        <br/>
        <span><b>Overview</b>: ${movie.overview}</span>
        <br/>
        <br/>
        <span><b>Genre</b>: ${movie.genres.map((m: any) => m.name).join(', ')}</span>
        <br/>
        <span><b>Popularity</b>: ${movie.popularity}</span>
        <br/>
        <span><b>Size</b>: ${torrent.size}</span>
        <br/>
        <span><b>Quality</b>: ${torrent.quality}</span>
        <br/>
        <span><b>Type</b>: ${torrent.type}</span>
        <br/>
        <span><b>Video Codec</b>: ${torrent.video_codec}</span>
        <br/>
        <span><b>Seeds</b>: ${torrent.seeds}</span>
        <br/>
        <span><b>Peers</b>: ${torrent.peers}</span>
    `
}

const buildRSS2 = (movie_list: any) => {
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

    movie_list.forEach((movie: any) => {
        movie.torrents.forEach((torrent: any) => {
            feed.addItem({
                title: movie.original_title,
                link: torrent.url,
                description: description2(torrent, movie),
                date: new Date(movie.release_date),
                image: IMAGE_BASE+movie.poster_path
            })
        })
    })

    return feed.rss2()
}


export { buildRSS2 }