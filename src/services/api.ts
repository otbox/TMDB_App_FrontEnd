import type { Movie } from "../types/Movie";


class TmdbApi { 
    private url : string = "https://api.themoviedb.org/3"; 
    private apiKey : string;

    constructor () {
        this.apiKey = import.meta.env.VITE_API_KEY;
    }


    async getAllMovies() : Promise<Movie[]> {
        const urlpath = `${this.url}/discover/movie` 
    }

}