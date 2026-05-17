export type Movie = { 
    meta : MovieMeta,
    info : MovieInfo
}

export type MovieInfo = {
        id : number,
      original_language: string,
      original_title: string,
      overview: string,
      popularity: number,
      poster_path: string,
      release_date: Date, //YYYY-MM-dd
      title: string,
      video: boolean,
      vote_average: number,
      vote_count: number
}


export type MovieMeta = {
    adult: boolean,
    backdrop_path: string,
    genre_ids: number[]
}

