import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import DateSelect from "../components/DateSelect";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const { axios, getToken, user, fetchFavouriteMovies, favouriteMovies, image_base_url } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [dateTime, setDateTime] = useState({});
  const [loading, setLoading] = useState(true);

  const imageBaseUrl = image_base_url || "https://image.tmdb.org/t/p/w500";

  const formatRuntime = (minutes) => {
    if (!minutes && minutes !== 0) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  // Fetch movie + show timings
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const token = user ? await getToken() : null;
        const { data } = await axios.get(`/api/show/${movieId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (data.success) {
          setMovie(data.movie);
          setDateTime(data.dateTime || {});
        } else {
          toast.error(data.message || "Movie not found");
        }
      } catch (err) {
        console.error("Error fetching show:", err?.response ?? err.message);
        toast.error("Failed to load show details");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchShowDetails();
  }, [movieId]);

  const handleFavourite = async () => {
    if (!user) return toast.error("Please login to proceed");
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/update-favourite",
        { movieId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (fetchFavouriteMovies) await fetchFavouriteMovies();
        toast.success(data.message ?? "Updated favourites");
      } else {
        toast.error(data.message ?? "Failed to update favourites");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update favourites");
    }
  };

  if (loading) return <Loading />;
  if (!movie) return <p className="text-center mt-10 text-gray-400">Movie not found</p>;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-10">
      {/* Movie Info */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className="md:w-2/5">
          <img
            src={movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : "/default-poster.jpg"}
            alt={movie.title}
            className="rounded-xl h-[420px] w-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <p className="text-primary font-medium">{movie.original_language?.toUpperCase()}</p>
          <h1 className="text-3xl md:text-4xl font-semibold">{movie.title}</h1>

          <div className="flex items-center gap-2 text-gray-300 mt-1">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {movie.vote_average ? `${movie.vote_average.toFixed(1)} User Rating` : "No rating"}
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight">{movie.overview}</p>

          <p className="mt-2 text-gray-300">
            {movie.runtime ? formatRuntime(movie.runtime) + " • " : ""}
            {movie.genres ? movie.genres.map((g) => g.name).join(", ") + " • " : ""}
            {movie.release_date ? movie.release_date.split("-")[0] : ""}
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button
              onClick={handleFavourite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favouriteMovies?.some((m) => m._id === movieId) ? "fill-primary text-primary" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.casts && movie.casts.length > 0 && (
        <div className="mt-10">
          <p className="text-lg font-medium mb-4">Cast</p>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-4 w-max px-2">
              {movie.casts.slice(0, 12).map((cast, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <img
                    src={
                      cast.profile_path
                        ? `${imageBaseUrl}${cast.profile_path}`
                        : "/default-cast.jpg"
                    }
                    alt={cast.name}
                    className="rounded-full h-20 w-20 object-cover"
                  />
                  <p className="font-medium text-xs mt-2">{cast.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show Date + Time */}
      <div className="mt-10" id="dateSelect">
        <DateSelect dateTime={dateTime} id={movieId} />

        {Object.keys(dateTime).length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Available Show Timings</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dateTime).map(([date, times]) =>
                times.map((t) => (
                  <span
                    key={t.showId}
                    className="px-3 py-1 bg-primary/30 text-white rounded-lg cursor-pointer"
                  >
                    {t.time}
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
