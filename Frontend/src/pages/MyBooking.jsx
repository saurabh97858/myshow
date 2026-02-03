import React, { useEffect, useState, useRef } from 'react';
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';
import { Share2, Calendar, Clock, MapPin, Ticket, Eye, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const MyBooking = () => {
  const { axios, getToken, user, isLoaded } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ticketRef = useRef(null);

  const getMyBookings = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        getMyBookings();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isLoaded]);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleShare = async (booking) => {
    const movieTitle = booking.show?.movie?.title || "Unknown Movie";
    const showDate = booking.show?.showDateTime ? new Date(booking.show.showDateTime).toLocaleDateString() : (booking.show?.date ? new Date(booking.show.date).toLocaleDateString() : "Date N/A");
    const showTime = booking.show?.showDateTime ? new Date(booking.show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (booking.show?.time || "Time N/A");
    const seats = booking.bookedSeats?.join(', ') || (booking.seats?.join(', ') || "N/A");
    const theaterName = booking.show?.theater?.name || "Unknown Theater";
    const theaterCity = booking.show?.theater?.city || "Unknown City";

    const shareData = {
      title: `Movie Ticket: ${movieTitle}`,
      text: `I'm watching ${movieTitle} at ${theaterName}, ${theaterCity} on ${showDate} at ${showTime}! Seats: ${seats}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Ticket shared successfully!");
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      toast.success("Ticket details copied to clipboard!");
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null, // Keep transparency if any
        scale: 2, // Higher resolution
        useCORS: true, // Allow loading cross-origin images (like poster)
      });
      const link = document.createElement('a');
      link.download = `Ticket_${selectedTicket?.show?.movie?.title || 'Movie'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download: ${error.message}`);
    }
  };


  if (isLoading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-24 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-2">My Bookings</h1>
        <p className="text-gray-400 mb-10">Manage your tickets and upcoming shows</p>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking, index) => {
              const show = booking.show || {};
              const movie = show.movie || {};
              // Use showDateTime from updated backend or fallback
              const dateObj = show.showDateTime ? new Date(show.showDateTime) : (show.date ? new Date(show.date) : null);

              const showDate = dateObj
                ? dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                : "Date N/A";

              const showTime = dateObj
                ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : (show.time || "Time N/A");

              const theaterName = show.theater?.name || "Theater N/A";
              const theaterCity = show.theater?.city || "City N/A";
              const seatList = booking.bookedSeats || booking.seats || [];

              // Handle image with fallbacks
              const posterImage = movie.posterUrl || movie.backdropUrl || "/placeholder.png";

              return (
                <div key={index} className="group relative bg-[#121212] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col md:flex-row">
                  {/* Left: Poster */}
                  <div className="md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden">
                    <img
                      src={posterImage}
                      alt={movie.title || "Unknown Movie"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = "/placeholder.png" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:hidden"></div>
                  </div>

                  {/* Perforated Line (Visual Only for desktop) */}
                  <div className="hidden md:block w-0 border-l-2 border-dashed border-gray-800 relative my-6">
                    <div className="absolute -top-8 -left-3 w-6 h-6 bg-[#09090B] rounded-full"></div>
                    <div className="absolute -bottom-8 -left-3 w-6 h-6 bg-[#09090B] rounded-full"></div>
                  </div>

                  {/* Middle: Details */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{movie.title || "Unknown Movie"}</h2>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm font-medium">{theaterName}, {theaterCity}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{movie.language || "N/A"}</span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span>{movie.format || "2D"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {showDate}
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Clock className="w-4 h-4 text-orange-400" />
                        {showTime}
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Ticket className="w-4 h-4 text-green-400" />
                        {seatList.join(", ") || "Seats N/A"}
                      </div>
                    </div>

                    {/* Food Items Display */}
                    {booking.foodItems && booking.foodItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Add-ons</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.foodItems.filter(f => f.quantity > 0).map((item, idx) => (
                            <span key={idx} className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/10">
                              {item.name} <span className="text-primary font-bold">x{item.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info Display */}
                    {(booking.contactDetails || user) && (
                      <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 flex gap-4">
                        <div>
                          <span className="block uppercase tracking-wider text-[10px] text-gray-600 mb-0.5">Booked By</span>
                          <span className="text-gray-300">{booking.contactDetails?.name || user?.name || "User"}</span>
                        </div>
                        <div>
                          <span className="block uppercase tracking-wider text-[10px] text-gray-600 mb-0.5">Mobile</span>
                          <span className="text-gray-300">{booking.contactDetails?.mobile || "N/A"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Action & Price */}
                  <div className="bg-white/5 p-6 md:w-64 flex flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 relative overflow-hidden">
                    {/* Payment Status Badge */}
                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20 mb-4">
                      Confirmed
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-white">₹{booking.amount}</p>
                    </div>

                    <div className="flex gap-3 w-full mt-6">
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleShare(booking)}
                        className="flex-1 bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors active:scale-95"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center bg-[#121212] rounded-3xl border border-white/5 border-dashed">
            <Ticket className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-gray-500 max-w-sm">Looks like you haven't booked any movies yet. Go explore the latest releases!</p>
          </div>
        )}
      </div>

      {/* Ticket View Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedTicket(null)}>
          <div className="w-full max-w-5xl relative flex flex-col items-center" onClick={e => e.stopPropagation()}>

            {/* Ticket Container */}
            <div ref={ticketRef} className="bg-[#121212] text-white rounded-3xl overflow-hidden shadow-2xl relative w-full flex flex-col md:flex-row border border-[#ffffff1a]">

              {/* LEFT: Poster Section */}
              <div className="relative md:w-1/3 h-64 md:h-auto min-h-[300px] bg-[#111827]">
                {(() => {
                  const posterUrl = selectedTicket.show?.movie?.posterUrl;
                  const proxyUrl = posterUrl
                    ? `${import.meta.env.VITE_BASE_URL || 'http://localhost:4000'}/api/proxy/image?url=${encodeURIComponent(posterUrl)}`
                    : "/placeholder.png";
                  console.log("Movie Data:", selectedTicket.show?.movie);
                  console.log("Original Poster URL:", posterUrl);
                  console.log("Constructed Proxy URL:", proxyUrl);
                  return (
                    <img
                      src={proxyUrl}
                      className="w-full h-full object-cover"
                      alt={selectedTicket.show?.movie?.title || "Movie Poster"}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error("Image failed to load:", e.target.src);
                        e.target.src = "https://placehold.co/400x600/1a1a1a/FFF?text=No+Poster";
                      }}
                    />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#000000cc] via-transparent to-transparent"></div>
              </div>

              {/* MIDDLE: Details Section */}
              <div className="flex-1 p-8 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-[#ffffff1a] bg-[#121212]">
                <h2 className="text-3xl font-black leading-tight mb-2 font-manrope text-white">{selectedTicket.show?.movie?.title}</h2>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider mb-6">
                  <span className="bg-[#ffffff1a] px-3 py-1 rounded border border-[#ffffff1a]">{selectedTicket.show?.movie?.language}</span>
                  <span className="bg-[#ffffff1a] px-3 py-1 rounded border border-[#ffffff1a]">{selectedTicket.show?.movie?.format || "2D"}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#F84565] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-[#e5e7eb]">{selectedTicket.show?.theater?.name}</p>
                      <p className="text-xs text-[#9ca3af]">{selectedTicket.show?.theater?.location}, {selectedTicket.show?.theater?.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-[#ffffff0d] px-4 py-2 rounded-xl border border-[#ffffff0d]">
                      <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-1">Date</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar size={14} className="text-[#F84565]" />
                        {new Date(selectedTicket.show?.showDateTime || selectedTicket.show?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-[#ffffff0d] px-4 py-2 rounded-xl border border-[#ffffff0d]">
                      <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-1">Time</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock size={14} className="text-[#fb923c]" />
                        {new Date(selectedTicket.show?.showDateTime || selectedTicket.show?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-2">Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTicket.bookedSeats || selectedTicket.seats || []).map(seat => (
                        <span key={seat} className="bg-[#ffffff1a] text-white border border-[#ffffff1a] px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedTicket.foodItems && selectedTicket.foodItems.length > 0 && (
                    <div className="pt-2 border-t border-[#ffffff1a]">
                      <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-2">Add-ons</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.foodItems.filter(f => f.quantity > 0).map((item, i) => (
                          <span key={i} className="text-xs text-[#9ca3af] bg-[#ffffff0d] px-2 py-1 rounded border border-[#ffffff0d]">{item.name} x{item.quantity}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#ffffff1a] flex gap-6">
                    <div>
                      <p className="text-[10px] text-[#4b5563] uppercase font-bold">Booked By</p>
                      <p className="text-xs text-[#d1d5db] font-medium">{selectedTicket.contactDetails?.name || user?.name || "User"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4b5563] uppercase font-bold">Mobile</p>
                      <p className="text-xs text-[#d1d5db] font-medium">{selectedTicket.contactDetails?.mobile || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Dashed Line Overlay for Desktop */}
                <div className="hidden md:absolute right-[-1px] top-0 bottom-0 w-[2px] border-r-2 border-dashed border-[#09090b] z-20"></div>
                <div className="hidden md:absolute -right-3 -top-3 w-6 h-6 bg-[#09090b] rounded-full z-20"></div>
                <div className="hidden md:absolute -right-3 -bottom-3 w-6 h-6 bg-[#09090b] rounded-full z-20"></div>
              </div>

              {/* RIGHT: Actions Section */}
              <div className="bg-[#161616] p-8 md:w-72 flex flex-col justify-between items-center text-center relative">
                <div>
                  <span className="bg-[#22c55e1a] text-[#22c55e] border border-[#22c55e33] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</span>
                </div>

                <div className="my-8">
                  <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-white tracking-tighter">₹{selectedTicket.amount}</p>
                </div>

                <div className="w-full space-y-3">
                  <div className="p-2 bg-white rounded-xl mb-6 mx-auto w-fit">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket._id}`}
                      className="w-24 h-24 object-contain"
                      alt="QR"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <button
                    onClick={handleDownloadTicket}
                    className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Download Ticket
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full bg-[#ffffff0d] border border-[#ffffff1a] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ffffff1a] transition-colors active:scale-95"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

            </div>

            {/* Close Button Outside */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
            >
              <X size={24} />
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

export default MyBooking
