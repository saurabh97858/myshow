import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Set base URL from environment or fallback to production backend
const backendUrl = import.meta.env.DEV
  ? "http://localhost:3000"
  : (import.meta.env.VITE_BASE_URL || "https://myshow-5pza.onrender.com");
axios.defaults.baseURL = backendUrl;

// Create an axios instance for consistency
const api = axios.create({
  baseURL: backendUrl,
});

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null); // null = checking, true = admin, false = not admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'user' | 'admin' | 'superadmin'
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [adminApplicationStatus, setAdminApplicationStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [adminAccount, setAdminAccount] = useState(JSON.parse(localStorage.getItem('adminAccount')) || null);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  
  console.log("🔥 [AppContext] Rendering AppProvider. isLoaded:", isLoaded, "user:", user?.id);

  const location = useLocation();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState({ city: "New York", state: "New York" });

  // ✅ Setup request interceptor ONCE
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        console.log(`📡 [Interceptor] Intercepting ${config.url}`);
        
        // 1. Check for Clerk Token (Highest priority for social login users)
        let token;
        try {
            token = await getToken({ skipCache: false });
        } catch (e) {
            console.warn("   ⚠️ [Interceptor] getToken failed:", e.message);
        }

        if (token) {
          const authVal = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          config.headers.Authorization = authVal;
          console.log(`   🔑 [Interceptor] Clerk Token injected for ${config.url}`);
          return config;
        }

        // 2. Fallback: Check for Admin Token (Custom Auth)
        if (adminToken) {
          const authVal = adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`;
          config.headers.Authorization = authVal;
          console.log(`   🔐 [Interceptor] Admin Token injected for ${config.url}`);
          return config;
        }

        console.warn(`   ⚠️ [Interceptor] No active session (Clerk or Admin) for ${config.url}`);
      } catch (error) {
        console.error("   ❌ [Interceptor] Unexpected error:", error);
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [adminToken, getToken]);

  // ✅ Check if current user is admin
  const fetchIsAdmin = async () => {
    console.log("🔍 [AppContext] Starting Admin Check. isLoaded:", isLoaded, "UserId:", user?.id);
    
    // 1. Guard against empty state or loading Clerk
    if (!isLoaded) return;

    try {
      // If we have an admin account via custom auth, we're already admin
      if (adminAccount) {
          console.log("   ✅ Found Custom Admin Account");
          setIsAdmin(true);
          setIsSuperAdmin(false);
          setUserRole('admin');
          return;
      }

      // 2. Guard: If no user and no adminAccount, we're definitely not admin
      if (!user) {
          console.log("   ℹ️ No User logged in, setting isAdmin: false");
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserRole('user');
          return;
      }

      console.log("   📡 Calling /api/admin/is-admin...");
      const token = await getToken();
      const { data } = await api.get("/api/admin/is-admin", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log("   ✅ Received Admin Response:", data);

      if (data.success) {
        setIsAdmin(data.isAdmin);
        setIsSuperAdmin(data.isSuperAdmin || false);
        setUserRole(data.role || 'user');
        console.log(`   🎭 User Role Set: ${data.role} | isAdmin: ${data.isAdmin}`);
      } else {
        console.warn("   ⚠️ Admin check success: false", data.message);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setUserRole('user');
      }

      if (data.success && !data.isAdmin && location.pathname.startsWith("/admin")) {
        console.log("   🚫 Access denied to admin route, redirecting...");
        navigate("/");
        toast.error("Access denied!");
      }
    } catch (error) {
      console.error("   ❌ Admin Check FAILED:", error.message);
      if (error.response) {
          console.error("      Response Data:", error.response.data);
          console.error("      Status:", error.response.status);
      }
      // If it's a 401/403 and we were using custom auth, log out
      if (error.response?.status === 401 && adminToken) {
          adminLogout();
      }
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole('user');
    }
  };

  const adminLogin = async (email, password) => {
      setLoading(true);
      try {
          const { data } = await api.post('/api/admin/auth/login', { email, password });
          if (data.success) {
              setAdminToken(data.token);
              setAdminAccount(data.admin);
              localStorage.setItem('adminToken', data.token);
              localStorage.setItem('adminAccount', JSON.stringify(data.admin));
              toast.success("Admin login successful");
              navigate('/admin');
              return true;
          } else {
              toast.error(data.message);
              return false;
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Login failed");
          return false;
      } finally {
          setLoading(false);
      }
  };

  const adminLogout = () => {
      setAdminToken(null);
      setAdminAccount(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminAccount');
      toast.success("Logged out successfully");
      navigate('/');
  };

  // ✅ Fetch admin application status
  const fetchAdminApplicationStatus = async () => {
    try {
      // No need to pass token explicitly, interceptor handles it
      const { data } = await api.get("/api/admin-application/my-status");

      if (data.success && data.application) {
        setAdminApplicationStatus(data.application.status);
      } else {
        setAdminApplicationStatus(null);
      }
    } catch (error) {
      console.error("Admin application status check failed:", error);
    }
  };

  // ✅ Fetch all shows
  const fetchShows = async () => {
    try {
      const { data } = await api.get("/api/show/all");
      if (data.success) setShows(data.shows);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Fetch all movies
  const fetchMovies = async () => {
    try {
      const { data } = await api.get("/api/movie/all");
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
      // No need to pass token explicitly, interceptor handles it
      const { data } = await api.get("/api/user/favourites");
      if (data.success) setFavouriteMovies(data.movies);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete movie (Admin only)
  const deleteMovie = async (movieId) => {
    try {
      // No need to pass token explicitly, interceptor handles it
      const { data } = await api.delete(`/api/movie/delete/${movieId}`);

      if (data.success) {
        toast.success("Movie deleted successfully");
        fetchMovies();
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
    const checkConnection = async () => {
      try {
        console.log(`🔌 [ConnectionTest] Pinging Backend: ${backendUrl}/api/ai/ping ...`);
        const { data } = await api.get("/api/ai/ping");
        console.log("✅ [ConnectionTest] Backend Reachable:", data.message);
      } catch (err) {
        console.error("❌ [ConnectionTest] Backend Unreachable:", err.message);
        if (err.response) console.error("   Status:", err.response.status, "Data:", err.response.data);
      }
    };
    
    checkConnection();
    fetchShows();
    fetchMovies();
  }, []);

  // Fetch admin status & favourites when user is available
  useEffect(() => {
    console.log("🔄 [AppContext] useEffect triggered. Status:", { isLoaded, hasUser: !!user, hasAdminAccount: !!adminAccount });
    
    // Wait until Clerk is loaded
    if (!isLoaded) {
        console.log("   ⏳ [AppContext] Waiting for Clerk to load...");
        return;
    }

    if (user || adminAccount) {
        console.log("   🚀 [AppContext] Triggering fetchIsAdmin()...");
        fetchIsAdmin();
        if (user) {
            fetchFavouriteMovies();
            fetchAdminApplicationStatus();
        }
    } else {
        console.log("   ℹ️ [AppContext] No session detected, clearing admin state.");
        // Clear state if no user
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setUserRole('user');
        setFavouriteMovies([]);
        setAdminApplicationStatus(null);
    }
  }, [user, adminAccount, isLoaded]);

  const value = {
    api,
    axios: api,
    backendUrl,
    fetchIsAdmin,
    user: adminAccount ? { fullName: adminAccount.name || 'Admin', primaryEmailAddress: { emailAddress: adminAccount.email } } : user,
    adminAccount,
    adminToken,
    adminLogin,
    adminLogout,
    getToken,
    navigate,
    isAdmin,
    isSuperAdmin,
    userRole,
    shows,
    fetchShows,
    movies,
    fetchMovies,
    deleteMovie,
    favouriteMovies,
    fetchFavouriteMovies,
    image_base_url,
    isLoaded,
    loading,
    setLoading,
    userLocation,
    setUserLocation,
    adminApplicationStatus,
    fetchAdminApplicationStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for easy use
export const useAppContext = () => useContext(AppContext);
