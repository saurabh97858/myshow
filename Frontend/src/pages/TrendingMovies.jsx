import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import MovieCard from "../components/MovieCard";

const TrendingMovies = () => {
    const navigate = useNavigate();
    const { movies } = useAppContext();

    // Filter by isTrending flag
    const trendingMovies = movies ? movies.filter(m => m.isTrending) : [];

    return (
        <div className="min-h-screen bg-black pt-24 px-6 md:px-12 lg:px-24">
            <div className="flex items-center gap-3 mb-2">
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">Trending Movies</h1>
            </div>
            <p className="text-gray-400 mb-8 ml-11">Watch the most popular movies right now</p>

            {trendingMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {trendingMovies.map((movie) => (
                        <MovieCard movie={movie} key={movie._id} />
                    ))}
                </div>
            ) : (
                <div className="text-white text-center py-20">
                    <p>No trending movies available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default TrendingMovies;
