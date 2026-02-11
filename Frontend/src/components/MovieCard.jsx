import { Star, Trash2, Calendar, Clock, Ticket } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const formatRuntime = (minutes) => {
  if (!minutes && minutes !== 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + "h " : ""}${m}m`;
};

const MovieCard = ({ movie, className, preferBackdrop }) => {
  const navigate = useNavigate();
  const { isAdmin, deleteMovie } = useAppContext();

  // Use _id from MongoDB
  const movieId = movie?._id;

  if (!movieId) {
    console.warn("MovieCard received movie without ID:", movie);
    return null;
  }

  const posterImage = (preferBackdrop && movie.backdropUrl)
    ? movie.backdropUrl
    : (movie.posterUrl || movie.backdropUrl || "/placeholder.png");

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : "N/A";

  const genres =
    movie.genres && movie.genres.length > 0
      ? movie.genres.slice(0, 2).map(g => g.trim())
      : [];

  const runtime = movie.duration ? formatRuntime(movie.duration) : null;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      deleteMovie(movieId);
    }
  };

  const handleCardClick = () => {
    navigate(`/movies/${movieId}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-full ${className || "aspect-[2/3]"} rounded-3xl overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]`}
    >
      {/* Background Image */}
      <img
        src={posterImage}
        onError={(e) => { e.target.src = "/placeholder.png" }}
        alt={movie.title || "Movie Poster"}
        className="absolute inset-0 w-full h-full object-fill transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay - Always present but stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>

      {/* Delete Button (Admin Only) */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 z-20 bg-red-500/80 backdrop-blur-md p-2.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg hover:scale-110"
          title="Delete Movie"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end z-10">
        {/* Top Badges (Only visible on hover or if important) */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {movie.rating ? movie.rating.toFixed(1) : "N/A"}
          </div>
        </div>

        {/* Main Info */}
        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
          <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2 mix-blend-screen font-outfit">
            {movie.title || "Untitled"}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300 mb-4 font-medium">
            <span>{releaseYear}</span>
            {runtime && (
              <>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {runtime}</span>
              </>
            )}
            {genres.length > 0 && (
              <>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="truncate max-w-[120px]">{genres.join(", ")}</span>
              </>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/theaters/${movieId}`);
              window.scrollTo(0, 0);
            }}
            className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <Ticket className="w-4 h-4" />
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
