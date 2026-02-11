import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import MovieCard from "./MovieCard";

const TrendingMoviesSection = () => {
    const navigate = useNavigate();
    const { movies } = useAppContext();

    // Filter by isTrending flat
    const trendingMovies = movies ? movies.filter(m => m.isTrending) : [];

    if (!trendingMovies || trendingMovies.length === 0) return null;

    return (
        <div className="py-12 px-6 md:px-12 lg:px-24 bg-black border-t border-white/5">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Trending Now</h2>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">Top rated movies everyone is watching</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-xs animate-pulse hidden md:block">Scroll for more &rarr;</span>
                    <Link to="/trending" className="text-primary hover:text-white transition-colors text-sm font-semibold flex items-center gap-1">
                        See All
                    </Link>
                </div>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory">
                {trendingMovies.map((movie) => (
                    <div
                        key={movie._id}
                        className="min-w-[180px] md:min-w-[220px] snap-start flex-shrink-0"
                    >
                        <MovieCard movie={movie} className="aspect-[3/4]" preferBackdrop={false} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingMoviesSection;
