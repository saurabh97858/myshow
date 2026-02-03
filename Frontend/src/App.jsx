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
import { Toaster } from "react-hot-toast";
import { SignIn, SignUp } from "@clerk/clerk-react";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AddMovie from "./pages/admin/AddMovie";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import { useAppContext } from "./context/AppContext";

const App = () => {
  const { user, isAdmin, loading, isLoaded } = useAppContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSeatLayoutRoute = /^\/movies\/[^/]+\/[^/]+$/.test(location.pathname);

  if (!isLoaded || (user && isAdmin === null)) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Toaster />
      {!isAdminRoute && !isSeatLayoutRoute && <Navbar />}

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
          {/* <Route path="add-shows" element={<AddShows />} /> */}
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>

        {/* Clerk Auth Routes */}
        <Route
          path="/sign-in/*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-black">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-black">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />
      </Routes >

      {!isAdminRoute && <Footer />
      }
    </>
  );
};

export default App;
