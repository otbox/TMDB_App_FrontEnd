import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar/SearchBar";
import { getAllMovies } from "../services/tmdbService";
import type { Movie } from "../types/Movie";
import MovieCard from "../components/MovieGrid/MovieCard/MovieCard";
import MovieGrid from "../components/MovieGrid/MovieGrid";

export default function Home() {

    return (
        <>
            <div className="">
                <MovieGrid />
            </div>
        </>
    )
}

