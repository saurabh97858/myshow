import { StarIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const formatRuntime = (minutes) => {
  if (!minutes && minutes !== 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + "h " : ""}${m}m`;
};

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  // Determine correct movieId (from MongoDB or TMDB)
  const movieId = movie._id || movie.id;

  // Handle missing image safely
  const posterImage =
    movie.backdrop_path || movie.poster_path
      ? `${image_base_url || IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`
      : "/placeholder.png";

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  const genres =
    movie.genres && movie.genres.length > 0
      ? movie.genres.slice(0, 2).map((g) => g.name).join(" | ")
      : null;

  const runtime = movie.runtime ? formatRuntime(movie.runtime) : null;

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-64">
      <img
        onClick={() => {
          navigate(`/movies/${movieId}`);
          window.scrollTo(0, 0);
        }}
        src={posterImage}
        alt={movie.title || "Movie Poster"}
        className="rounded-lg h-52 w-full object-cover cursor-pointer"
      />

      <p className="font-semibold mt-2 truncate">{movie.title || "Untitled"}</p>

      <p className="text-sm text-gray-400 mt-1">
        {releaseYear}
        {genres ? ` • ${genres}` : ""}
        {runtime ? ` • ${runtime}` : ""}
      </p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => {
            navigate(`/movies/${movieId}`);
            window.scrollTo(0, 0);
          }}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {movie.vote_average !== undefined && movie.vote_average !== null
            ? movie.vote_average.toFixed(1)
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
