import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Set base URL from environment
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = checking, true = admin, false = not admin
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]); // Store all movies
  const [favouriteMovies, setFavouriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState({ city: "New York", state: "New York" });

  // ✅ Check if current user is admin
  const fetchIsAdmin = async () => {
    try {
      console.log("Checking admin status...");
      const token = await getToken();
      console.log("Token available:", !!token);

      if (!token) {
        setIsAdmin(false);
        return;
      }

      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🔍 Admin Check API Response:", data);
      setIsAdmin(data.isAdmin);

      if (!data.success && data.message) {
        console.error("Admin Check Failed Reason:", data.message);
        // Optionally toast this for the user to see why it failed
        if (user) toast.error(`Admin Access Failed: ${data.message}`);
      }

      // Redirect non-admin users if trying to access /admin
      if (data.success && !data.isAdmin && location.pathname.startsWith("/admin")) {
        console.warn("⛔ User is NOT admin. Redirecting...");
        navigate("/");
        toast.error("Access denied!");
      }
    } catch (error) {
      console.error("❌ Admin Check FAILED:", error);
      console.error("Error Response:", error.response);
      console.error("Error Message:", error.message);

      setIsAdmin(false); // Safe fallback

      // Only show error toast if user is trying to access admin routes
      if (location.pathname.startsWith("/admin")) {
        toast.error("Failed to check admin status");
      }
    }
  };

  // ✅ Fetch all shows
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) setShows(data.shows);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Fetch all movies
  const fetchMovies = async () => {
    try {
      const { data } = await axios.get("/api/movie/all");
      if (data.success) setMovies(data.movies);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Fetch user's favourite movies
  const fetchFavouriteMovies = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favourites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setFavouriteMovies(data.movies);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete movie (Admin only)
  const deleteMovie = async (movieId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/movie/delete/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Movie deleted successfully");
        fetchMovies(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete movie");
    }
  };

  // Fetch shows and movies on mount
  useEffect(() => {
    fetchShows();
    fetchMovies();
  }, []);

  // Fetch admin status & favourites when user is available
  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavouriteMovies();
    }
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    fetchShows,
    movies,
    fetchMovies,
    deleteMovie,
    favouriteMovies,
    fetchFavouriteMovies,
    image_base_url,

    isLoaded, // Export Clerk loading state
    userLocation,
    setUserLocation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for easy use
export const useAppContext = () => useContext(AppContext);
