import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon, Clock, Calendar, Film, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const { axios, getToken, user, fetchFavouriteMovies, favouriteMovies } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [dateTime, setDateTime] = useState({});
  const [loading, setLoading] = useState(true);

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1 = time, 2 = seats, 3 = payment
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Payment & Extras State
  const [paymentDetails, setPaymentDetails] = useState({
    name: '', mobile: '', email: '',
    paymentMethod: 'UPI', // UPI | Card
    upiId: '',
    cardNumber: '', cardExpiry: '', cardCvv: ''
  });
  const [snacks, setSnacks] = useState({ popcorn: 0, coke: 0 });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  // Fetch occupied seats for a specific show
  const fetchOccupiedSeats = async (showId) => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`);
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || []);
        setBookingStep(2); // Proceed to seats after fetching
      } else {
        toast.error(data.message || "Failed to fetch seat availability");
      }
    } catch (err) {
      console.error("Error fetching seats", err);
      toast.error("Failed to load seat availability");
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes && minutes !== 0) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  const isFavourite = favouriteMovies?.some((m) => m._id === movieId);

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
    if (!user) return toast.error("Please login to add favourites");
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/update-favourite",
        { movieId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (fetchFavouriteMovies) await fetchFavouriteMovies();
        toast.success(isFavourite ? "Removed from favourites" : "Added to favourites ❤️");
      } else {
        toast.error(data.message ?? "Failed to update favourites");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update favourites");
    }
  };

  // Seat selection logic
  const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 12;

  const seatCategories = {
    Standard: { rows: ["A", "B", "C", "D"], color: "border-gray-400", bgSelected: "bg-gray-500", price: 100, label: "Standard" },
    Premium: { rows: ["E", "F", "G", "H"], color: "border-blue-400", bgSelected: "bg-blue-500", price: 150, label: "Premium" },
    VIP: { rows: ["I", "J"], color: "border-yellow-400", bgSelected: "bg-yellow-500", price: 250, label: "VIP" },
  };

  const getCategory = (row) => {
    if (seatCategories.Standard.rows.includes(row)) return "Standard";
    if (seatCategories.Premium.rows.includes(row)) return "Premium";
    if (seatCategories.VIP.rows.includes(row)) return "VIP";
    return "Standard";
  };

  const getPrice = (category) => seatCategories[category]?.price || 100;

  const handleSeatClick = (seatId) => {
    // Check if seat is occupied
    // if (occupiedSeats.includes(seatId)) {
    //   return toast.error("Already selected, please choose next");
    // }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 5) {
        return toast.error("Maximum 5 seats allowed!");
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  // const totalPrice = ... (removed, using dynamic func below)

  const handleBuyTickets = () => {
    navigate(`/theaters/${movieId}`);
  };

  const handleProceedToSeats = () => {
    if (!selectedTime) {
      return toast.error("Please select a show time");
    }
    setSelectedSeats([]); // Clear previous selection to avoid conflicts
    fetchOccupiedSeats(selectedTime.showId);
  };

  // Calculate totals
  const seatPrice = selectedSeats.reduce((total, seatId) => {
    const row = seatId.charAt(0);
    const category = getCategory(row);
    return total + getPrice(category);
  }, 0);

  const snacksPrice = (snacks.popcorn * 200) + (snacks.coke * 150);
  const finalPrice = Math.max(0, seatPrice + snacksPrice - discount);

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) return toast.error("Please select at least one seat");
    setBookingStep(3);
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "MYS50") {
      setDiscount(50);
      toast.success("Coupon Applied: ₹50 Off");
    } else {
      toast.error("Invalid Code");
      setDiscount(0);
    }
  };

  const handleFinalPayment = async () => {
    // Validation
    if (!paymentDetails.name || !paymentDetails.mobile) return toast.error("Name and Mobile are required");
    if (paymentDetails.paymentMethod === 'UPI' && !paymentDetails.upiId) return toast.error("Enter UPI ID");
    if (paymentDetails.paymentMethod === 'Card' && !paymentDetails.cardNumber) return toast.error("Enter Card Details");

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats: selectedSeats,
          amount: finalPrice,
          contactDetails: {
            name: paymentDetails.name,
            mobile: paymentDetails.mobile,
            email: paymentDetails.email
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("🎉 Booking confirmed!");
        setShowBooking(false);
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not complete booking");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) return <Loading />;
  if (!movie) return <p className="text-center mt-10 text-gray-400">Movie not found</p>;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section with Backdrop */}
      <div
        className="relative h-[500px] bg-cover"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(5,5,5,1)), url(${movie.backdropUrl || movie.posterUrl || '/default-poster.jpg'})`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

        <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-16 lg:px-24">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl mx-auto">

            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.posterUrl || "/default-poster.jpg"}
                onError={(e) => { e.target.src = "/default-poster.jpg" }}
                alt={movie.title}
                className="w-48 md:w-64 h-72 md:h-96 object-cover rounded-2xl shadow-2xl ring-4 ring-white/10"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
              <span className="inline-block w-fit px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full mb-3 mx-auto md:mx-0">
                {movie.language?.toUpperCase() || "HINDI"}
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300 mb-4">
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                )}

                {movie.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.duration)}</span>
                  </div>
                )}

                {movie.releaseDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {movie.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-800/80 text-gray-300 text-sm rounded-full border border-gray-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-white transition rounded-full font-medium backdrop-blur">
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </button>

                <button
                  onClick={handleBuyTickets}
                  className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white transition rounded-full font-medium shadow-lg shadow-primary/30"
                >
                  🎟️ Buy Tickets
                </button>

                <button
                  onClick={handleFavourite}
                  className={`p-3 rounded-full transition backdrop-blur ${isFavourite
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-10 bg-[#050505]">
        <div className="max-w-6xl mx-auto">

          {movie.description && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                About the Movie
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>
          )}

          {movie.casts && movie.casts.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Cast
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {movie.casts.slice(0, 10).map((castName, idx) => (
                  <div key={idx} className="flex-shrink-0 flex flex-col items-center text-center w-20">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-xl font-bold text-white">
                        {castName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-xs mt-2 text-gray-300 line-clamp-2">{castName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b] animate-fade-in">
          <div className="relative w-full h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-black">

            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold">{movie.title}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Select Your Seats
                </p>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Step 2: Seat Selection (Now Step 2) */}
              {bookingStep === 2 && (
                <div>
                  {/* Back button removed as per user request for simplified flow */}
                  {/* Screen */}
                  <div className="text-center mb-8">
                    <div className="relative mx-auto w-3/4 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full mb-2 shadow-lg shadow-gray-500/30"></div>
                    <p className="text-gray-500 text-sm">SCREEN</p>
                  </div>

                  {/* Seats */}
                  <div className="flex flex-col items-center gap-2 mb-8">
                    {seatRows.map((row) => {
                      const category = getCategory(row);
                      const catInfo = seatCategories[category];

                      return (
                        <div key={row} className="flex items-center gap-2">
                          <span className="w-6 text-gray-500 text-sm font-medium">{row}</span>
                          <div className="flex gap-1">
                            {Array.from({ length: seatsPerRow }, (_, i) => {
                              const seatId = `${row}${i + 1}`;
                              const isSelected = selectedSeats.includes(seatId);
                              const isOccupied = occupiedSeats.includes(seatId);

                              return (
                                <button
                                  key={seatId}
                                  onClick={() => handleSeatClick(seatId)}
                                  className={`w-7 h-7 rounded-t-lg text-xs font-medium transition-all duration-200
                                    ${isOccupied
                                      ? 'bg-gray-700/50 text-gray-500 cursor-pointer border-gray-700 border-2'
                                      : isSelected
                                        ? `${catInfo.bgSelected} text-white scale-110 shadow-lg`
                                        : `bg-gray-800 ${catInfo.color} border-2 hover:bg-gray-700`
                                    }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            })}
                          </div>
                          <span className="w-6 text-gray-500 text-sm font-medium">{row}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 mb-8 flex-wrap">
                    {Object.entries(seatCategories).map(([name, info]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-t-lg ${info.color} border-2 bg-gray-800`}></div>
                        <span className="text-sm text-gray-400">{info.label} - ₹{info.price}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-t-lg bg-gray-700/50 border-2 border-gray-700"></div>
                      <span className="text-sm text-gray-400">Booked</span>
                    </div>
                  </div>

                  {/* Selection Summary */}
                  < div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700" >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Selected Seats</p>
                        <p className="text-lg font-semibold">
                          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Total</p>
                        <p className="text-2xl font-bold text-primary">₹{seatPrice}</p>
                      </div>
                    </div>

                    {/* Booking & Total Summary */}
                    {
                      selectedSeats.length > 0 && (
                        <div className="mt-4 border-t border-gray-700 pt-4">
                          <div className="flex flex-col gap-2 mb-4 text-sm text-gray-300">
                            <div className="flex justify-between"><span>Date</span><span className="text-white">{formatDate(selectedDate)}</span></div>
                            <div className="flex justify-between"><span>Time</span><span className="text-white">{formatTime(selectedTime?.time || "")}</span></div>
                          </div>
                          <button
                            onClick={handleProceedToPayment}
                            className="w-full py-3 bg-primary hover:bg-primary-dull text-white font-bold rounded-full shadow-lg"
                          >
                            Proceed to Payment
                          </button>
                        </div>
                      )
                    }
                  </div >
                </div >
              )}

              {/* Step 3: Payment */}
              {bookingStep === 3 && (
                <div className="animate-fade-in text-white h-full flex flex-col">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back to Seats
                  </button>

                  <div className="flex flex-col lg:flex-row gap-8 pb-10">

                    {/* Left Column: Details & Payment */}
                    <div className="flex-1 space-y-8">

                      {/* Contact Details */}
                      <section>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Contact Details
                        </h3>
                        <div className="bg-gray-800/40 p-6 rounded-2xl border border-white/5 space-y-4 shadow-sm backdrop-blur-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400 font-medium ml-1">Full Name</label>
                              <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={paymentDetails.name}
                                onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400 font-medium ml-1">Email Address</label>
                              <input
                                type="email"
                                placeholder="name@example.com"
                                value={paymentDetails.email}
                                onChange={e => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                              <label className="text-xs text-gray-400 font-medium ml-1">Mobile Number</label>
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={paymentDetails.mobile}
                                onChange={e => setPaymentDetails({ ...paymentDetails, mobile: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Add-ons */}
                      <section>
                        <h3 className="font-bold text-lg mb-4">🍿 Snacks & Add-ons</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${snacks.popcorn > 0 ? 'bg-primary/5 border-primary/50' : 'bg-gray-800/40 border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-2xl">🍿</div>
                              <div>
                                <p className="font-medium">Popcorn</p>
                                <p className="text-xs text-gray-400">₹200</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                              <button onClick={() => setSnacks({ ...snacks, popcorn: Math.max(0, snacks.popcorn - 1) })} className="w-7 h-7 hover:bg-white/10 rounded flex items-center justify-center transition text-gray-400 hover:text-white">-</button>
                              <span className="w-4 text-center font-bold text-sm">{snacks.popcorn}</span>
                              <button onClick={() => setSnacks({ ...snacks, popcorn: snacks.popcorn + 1 })} className="w-7 h-7 hover:bg-white/10 rounded flex items-center justify-center transition text-gray-400 hover:text-white">+</button>
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${snacks.coke > 0 ? 'bg-primary/5 border-primary/50' : 'bg-gray-800/40 border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">🥤</div>
                              <div>
                                <p className="font-medium">Coke</p>
                                <p className="text-xs text-gray-400">₹150</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                              <button onClick={() => setSnacks({ ...snacks, coke: Math.max(0, snacks.coke - 1) })} className="w-7 h-7 hover:bg-white/10 rounded flex items-center justify-center transition text-gray-400 hover:text-white">-</button>
                              <span className="w-4 text-center font-bold text-sm">{snacks.coke}</span>
                              <button onClick={() => setSnacks({ ...snacks, coke: snacks.coke + 1 })} className="w-7 h-7 hover:bg-white/10 rounded flex items-center justify-center transition text-gray-400 hover:text-white">+</button>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Payment Method */}
                      <section>
                        <h3 className="font-bold text-lg mb-4">💳 Payment Method</h3>
                        <div className="space-y-4 bg-gray-800/40 p-6 rounded-2xl border border-white/5">
                          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentDetails.paymentMethod === 'UPI' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-white/5 bg-black/20 hover:bg-black/40'}`}>
                            <div className="mt-1">
                              <input type="radio" name="payment" checked={paymentDetails.paymentMethod === 'UPI'} onChange={() => setPaymentDetails({ ...paymentDetails, paymentMethod: 'UPI' })} className="hidden" />
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentDetails.paymentMethod === 'UPI' ? 'border-primary' : 'border-gray-500'}`}>
                                {paymentDetails.paymentMethod === 'UPI' && <div className="w-3 h-3 bg-primary rounded-full animate-scale-in"></div>}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-1">UPI (Google Pay, PhonePe)</p>
                              <p className="text-xs text-gray-400">Pay directly from your bank account</p>
                              {paymentDetails.paymentMethod === 'UPI' && (
                                <div className="mt-4 animate-fade-in-up">
                                  <input
                                    type="text"
                                    placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                                    value={paymentDetails.upiId}
                                    onChange={e => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary outline-none transition-all placeholder:text-gray-600"
                                  />
                                </div>
                              )}
                            </div>
                          </label>

                          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentDetails.paymentMethod === 'Card' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-white/5 bg-black/20 hover:bg-black/40'}`}>
                            <div className="mt-1">
                              <input type="radio" name="payment" checked={paymentDetails.paymentMethod === 'Card'} onChange={() => setPaymentDetails({ ...paymentDetails, paymentMethod: 'Card' })} className="hidden" />
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentDetails.paymentMethod === 'Card' ? 'border-primary' : 'border-gray-500'}`}>
                                {paymentDetails.paymentMethod === 'Card' && <div className="w-3 h-3 bg-primary rounded-full animate-scale-in"></div>}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-1">Credit / Debit Card</p>
                              <p className="text-xs text-gray-400">Visa, Mastercard, RuPay & more</p>

                              {paymentDetails.paymentMethod === 'Card' && (
                                <div className="mt-4 space-y-3 animate-fade-in-up">
                                  <input
                                    type="text"
                                    placeholder="Card Number"
                                    value={paymentDetails.cardNumber}
                                    onChange={e => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary outline-none"
                                  />
                                  <div className="flex gap-3">
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      value={paymentDetails.cardExpiry}
                                      onChange={e => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                                      className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary outline-none"
                                    />
                                    <input
                                      type="text"
                                      placeholder="CVV"
                                      value={paymentDetails.cardCvv}
                                      onChange={e => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                                      className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-primary outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-96 shrink-0">
                      <div className="sticky top-24 space-y-6">
                        {/* Order Details Card */}
                        <div className="bg-gray-800/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                          <h3 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">Order Summary</h3>

                          <div className="flex gap-4 mb-6">
                            <img src={movie.posterUrl || "/default-poster.jpg"} alt={movie.title} className="w-16 h-24 object-cover rounded-lg shadow-md" />
                            <div>
                              <h4 className="font-bold text-white line-clamp-1">{movie.title}</h4>
                              <p className="text-xs text-gray-400 mt-1">{movie.language} • {movie.format || "2D"}</p>
                              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {formatDate(selectedDate)}
                              </p>
                              <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatTime(selectedTime?.time || "")}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm border-b border-white/10 pb-4 mb-4">
                            <div className="flex justify-between text-gray-300">
                              <span>Tickets ({selectedSeats.length})</span>
                              <span>₹{seatPrice}</span>
                            </div>
                            <div className="text-xs text-gray-500 pl-2">
                              {selectedSeats.join(", ")}
                            </div>
                            {snacksPrice > 0 && (
                              <div className="flex justify-between text-gray-300">
                                <span>Snacks</span>
                                <span>₹{snacksPrice}</span>
                              </div>
                            )}
                            {discount > 0 && (
                              <div className="flex justify-between text-green-400 font-medium">
                                <span>Discount</span>
                                <span>-₹{discount}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400">Total Payable</span>
                            <span className="text-2xl font-bold text-white">₹{finalPrice}</span>
                          </div>

                          {/* Coupon Section moved here */}
                          <div className="mb-6">
                            <div className="flex gap-2 p-1.5 bg-black/20 rounded-xl border border-white/5">
                              <input
                                type="text"
                                placeholder="PROMO CODE"
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                                className="bg-transparent border-none flex-1 px-3 text-sm outline-none uppercase font-medium placeholder:text-gray-600"
                              />
                              <button
                                onClick={applyCoupon}
                                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider"
                              >
                                Apply
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleFinalPayment}
                            className="w-full py-4 bg-primary hover:bg-primary-dull text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>Pay ₹{finalPrice}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Secure SSL Encrypted Transaction
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Step 1: Date & Time Selection (Now Step 1) */}
              {
                bookingStep === 1 && (
                  <div>
                    {/* (No previous seat display here anymore) */}

                    {/* Date Selection */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">📅 Select Date</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {Object.keys(dateTime).sort().map((date) => (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedTime(null);
                            }}
                            className={`flex-shrink-0 flex flex-col items-center px-5 py-4 rounded-xl transition-all
                            ${selectedDate === date
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                              }`}
                          >
                            <span className="text-sm opacity-80">{formatDate(date).split(',')[0]}</span>
                            <span className="text-2xl font-bold">{new Date(date).getDate()}</span>
                            <span className="text-sm opacity-80">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">🕐 Select Time</h3>
                        <div className="flex flex-wrap gap-3">
                          {dateTime[selectedDate]?.map((timeObj) => (
                            <button
                              key={timeObj.showId}
                              onClick={() => setSelectedTime(timeObj)}
                              className={`px-6 py-3 rounded-xl font-medium transition-all
                              ${selectedTime?.showId === timeObj.showId
                                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                }`}
                            >
                              {formatTime(timeObj.time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {selectedTime && (
                      <div className="mt-6">
                        <button
                          onClick={handleProceedToSeats}
                          className="w-full py-4 bg-primary hover:bg-primary-dull text-white font-bold rounded-full transition-all shadow-lg"
                        >
                          Continue to Select Seats →
                        </button>
                      </div>
                    )}
                  </div>
                )
              }
            </div >
          </div >
        </div >
      )
      }
    </div >
  );
};

export default MovieDetails;
