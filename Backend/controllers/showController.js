import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/showModel.js";

// ✅ Get now-playing movies from TMDB
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Add a show
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    // Check if movie exists in DB
    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch from TMDB
      const [detailsRes, creditsRes] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieData = detailsRes.data;
      const creditsData = creditsRes.data;

      movie = await Movie.create({
        _id: movieId,
        title: movieData.title,
        overview: movieData.overview,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        genres: movieData.genres,
        casts: creditsData.cast,
        release_date: movieData.release_date,
        original_language: movieData.original_language,
        tagline: movieData.tagline || "",
        vote_average: movieData.vote_average,
        runtime: movieData.runtime,
      });
    }

    // Create shows
    const showsToCreate = showsInput.map(({ date, time }) => ({
      movie: movieId,
      showDateTime: new Date(`${date}T${time}`),
      showPrice,
      occupiedSeats: {},
    }));

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show added successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get all upcoming shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueShowsMap = new Map();
    shows.forEach((show) => {
      const movieId = show.movie._id.toString();
      if (!uniqueShowsMap.has(movieId)) uniqueShowsMap.set(movieId, show);
    });

    res.json({ success: true, shows: Array.from(uniqueShowsMap.values()) });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get single show by movieId
export const getShow = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.params.id;
    if (!movieId) return res.json({ success: false, message: "Movie ID required" });

    const movie = await Movie.findById(movieId);
    if (!movie) return res.json({ success: false, message: "Movie not found" });

    const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } });

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime.toISOString().split("T")[1].substring(0, 5),
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
