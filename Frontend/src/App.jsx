import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes, useLocation, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import Theaters from "./pages/Theaters";
import TheatersList from "./pages/TheatersList";
import TheaterMovies from "./pages/TheaterMovies";
import MyBookings from "./pages/MyBooking";
import Favourite from "./pages/Favourite";
import TrendingMovies from "./pages/TrendingMovies";
import { Toaster } from "react-hot-toast";
import { SignIn, SignUp } from "@clerk/clerk-react";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AddMovie from "./pages/admin/AddMovie";
import AddTheater from "./pages/admin/AddTheater";
import ManageTrending from "./pages/admin/ManageTrending";
import ManageAdmins from "./pages/admin/ManageAdmins";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import AdminSupport from "./pages/admin/AdminSupport";
import HelpCenter from "./pages/HelpCenter";
import Experiences from "./pages/Experiences";
import AdminApplicationForm from "./pages/AdminApplicationForm";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSettings from "./pages/admin/AdminSettings";
import { useAppContext } from "./context/AppContext";

const App = () => {
  const { user, isAdmin, loading, isLoaded } = useAppContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSeatLayoutRoute = /^\/movies\/[^/]+\/[^/]+$/.test(location.pathname);
  const isMovieDetailsRoute = /^\/movies\/[^/]+$/.test(location.pathname);
  const isHelpCenterRoute = location.pathname === "/help-center";
  const isExperiencesRoute = location.pathname === "/experiences";

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { zIndex: 999999, marginTop: '70px', background: '#333', color: '#fff' } }} />
      {!isAdminRoute && !isSeatLayoutRoute && !isMovieDetailsRoute && !isHelpCenterRoute && !isExperiencesRoute && <Navbar />}

      <Routes>
        {/* Main App Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:movieId" element={<MovieDetails />} />
        <Route path="/theaters" element={<TheatersList />} />
        <Route path="/theater/:theaterId" element={<TheaterMovies />} />
        <Route path="/theaters/:movieId" element={<Theaters />} />
        <Route path="/movies/:movieId/:showId" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/trending" element={<TrendingMovies />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/apply-admin" element={<AdminApplicationForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            isAdmin ? (
              <AdminLayout />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-movie" element={<AddMovie />} />
          <Route path="add-theater" element={<AddTheater />} />
          <Route path="manage-trending" element={<ManageTrending />} />
          <Route path="manage-admins" element={<ManageAdmins />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Clerk Auth Routes */}
        <Route
          path="/sign-in/*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 pt-10 transform scale-90">
              <SignIn routing="path" path="/sign-in" />
              <div className="mt-4 text-center bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm w-full max-w-[340px]">
                 <p className="text-gray-400 text-xs mb-1">Theater partner?</p>
                 <Link to="/admin-login" className="text-primary hover:text-primary-dark font-bold text-base underline underline-offset-4">
                    Partner Login
                 </Link>
              </div>
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 pt-10 transform scale-90">
              <SignUp routing="path" path="/sign-up" />
              <div className="mt-4 text-center bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm w-full max-w-[340px]">
                 <p className="text-gray-400 text-xs mb-1">Theater partner?</p>
                 <Link to="/admin-login" className="text-primary hover:text-primary-dark font-bold text-base underline underline-offset-4">
                    Partner Login
                 </Link>
              </div>
            </div>
          }
        />
      </Routes >

      {!isAdminRoute && !isHelpCenterRoute && !isExperiencesRoute && <Footer />
      }
    </>
  );
};

export default App;
