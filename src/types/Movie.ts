export type Movie = {
    id: number,
    original_language: string,
    original_title: string,
    overview: string,
    popularity: number,
    poster_path: string,
    release_date: Date, //YYYY-MM-dd
    title: string,
    video: boolean,
    vote_average: number,
    vote_count: number,
    adult: boolean,
    backdrop_path: string,
    genre_ids: number[]
}

export type Genre = {
    id: number,
    name: string
}