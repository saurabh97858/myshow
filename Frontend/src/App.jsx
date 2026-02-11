import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
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
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import AdminSupport from "./pages/admin/AdminSupport";
import HelpCenter from "./pages/HelpCenter";
import Experiences from "./pages/Experiences";
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
      <Toaster />
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

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            !user ? (
              <Navigate to="/sign-in" />
            ) : isAdmin ? (
              <AdminLayout />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-movie" element={<AddMovie />} />
          <Route path="add-theater" element={<AddTheater />} />
          <Route path="manage-trending" element={<ManageTrending />} />
          {/* <Route path="add-shows" element={<AddShows />} /> */}
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>

        {/* Clerk Auth Routes */}
        <Route
          path="/sign-in/*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-black/90 pt-20 transform scale-90">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-black/90 pt-20 transform scale-90">
              <SignUp routing="path" path="/sign-up" />
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
