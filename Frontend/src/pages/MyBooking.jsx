import React, { useEffect, useState, useRef } from 'react';
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';
import { Share2, Calendar, Clock, MapPin, Ticket, Eye, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

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
    if (!selectedTicket) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const movie = selectedTicket.show?.movie;
      const theater = selectedTicket.show?.theater;
      const dateObj = selectedTicket.show?.showDateTime
        ? new Date(selectedTicket.show.showDateTime)
        : (selectedTicket.show?.date ? new Date(selectedTicket.show.date) : null);

      // Background - Light cream/beige like real tickets
      pdf.setFillColor(250, 248, 245);
      pdf.rect(0, 0, 210, 297, 'F');

      // Top Header - Dark Blue/Black
      pdf.setFillColor(15, 23, 42); // Dark slate
      pdf.rect(0, 0, 210, 55, 'F');

      // Title
      pdf.setTextColor(248, 69, 101); // Primary red
      pdf.setFontSize(36);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MOVIE TICKET', 105, 25, { align: 'center' });

      // Confirmed badge
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect(75, 35, 60, 12, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓ CONFIRMED', 105, 42, { align: 'center' });

      // Main content area with border
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(1);
      pdf.rect(15, 65, 180, 200);

      let y = 80;

      // Movie Title - BOLD & LARGE
      pdf.setTextColor(15, 23, 42); // Dark blue/black
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      const movieTitle = movie?.title || 'Unknown Movie';
      pdf.text(movieTitle, 105, y, { align: 'center' });

      y += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138); // Dark blue
      pdf.text(`${movie?.language || 'N/A'} | ${movie?.format || '2D'}`, 105, y, { align: 'center' });

      // Decorative line
      y += 8;
      pdf.setDrawColor(248, 69, 101);
      pdf.setLineWidth(1.5);
      pdf.line(30, y, 180, y);

      // Theater Section
      y += 12;
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139); // Medium gray
      pdf.setFont('helvetica', 'bold');
      pdf.text('THEATER', 25, y);

      y += 7;
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42); // Dark
      pdf.setFont('helvetica', 'bold');
      pdf.text(theater?.name || 'Unknown Theater', 25, y);

      y += 6;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // Dark gray
      pdf.text(`${theater?.location || 'N/A'}, ${theater?.city || 'N/A'}`, 25, y);

      // Show Details
      y += 14;
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SHOW DETAILS', 25, y);

      y += 7;
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      const showDate = dateObj
        ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Date N/A';
      const showTime = dateObj
        ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'Time N/A';
      pdf.text(`📅 ${showDate}`, 25, y);

      y += 7;
      pdf.text(`🕐 ${showTime}`, 25, y);

      // Seats - PROMINENT
      y += 14;
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEATS', 25, y);

      y += 7;
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      const seats = (selectedTicket.bookedSeats || selectedTicket.seats || []).join(', ');
      pdf.text(seats || 'N/A', 25, y);

      // Add-ons
      if (selectedTicket.foodItems && selectedTicket.foodItems.length > 0) {
        y += 14;
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ADD-ONS', 25, y);

        y += 7;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 138);
        selectedTicket.foodItems.filter(f => f.quantity > 0).forEach(item => {
          pdf.text(`• ${item.name} x${item.quantity}`, 25, y);
          y += 6;
        });
      }

      // Booking Details
      y += 12;
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BOOKING DETAILS', 25, y);

      y += 7;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Name: ${selectedTicket.contactDetails?.name || user?.name || 'User'}`, 25, y);

      y += 6;
      pdf.text(`Mobile: ${selectedTicket.contactDetails?.mobile || 'N/A'}`, 25, y);

      // Payment Details
      if (selectedTicket.paymentDetails) {
        y += 12;
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PAYMENT DETAILS', 25, y);

        y += 7;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(`Method: ${selectedTicket.paymentDetails.method?.toUpperCase() || 'N/A'}`, 25, y);

        if (selectedTicket.paymentDetails.upiId) {
          y += 6;
          pdf.setTextColor(30, 58, 138);
          pdf.text(`UPI ID: ${selectedTicket.paymentDetails.upiId}`, 25, y);
        }

        if (selectedTicket.paymentDetails.utrNumber) {
          y += 6;
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text(`UTR: ${selectedTicket.paymentDetails.utrNumber}`, 25, y);
        }
      }

      // Total Amount - BOLD BOX
      pdf.setFillColor(248, 69, 101);
      pdf.rect(15, 270, 180, 18, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL: ₹${selectedTicket.amount}`, 105, 281, { align: 'center' });

      // QR Code Section - Right side
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicket._id}`;
      try {
        pdf.addImage(qrUrl, 'PNG', 140, 180, 50, 50);

        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SCAN AT', 165, 235, { align: 'center' });
        pdf.text('THEATER', 165, 240, { align: 'center' });
      } catch (err) {
        console.error('QR code error:', err);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for booking with us!', 105, 292, { align: 'center' });

      pdf.setFontSize(7);
      pdf.text(`Booking ID: ${selectedTicket._id}`, 105, 295, { align: 'center' });

      // Save PDF
      pdf.save(`Ticket_${movie?.title || 'Movie'}.pdf`);
      toast.success("Ticket downloaded as PDF successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download: ${error.message}`);
    }
  };


  if (isLoading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-16 pb-8 px-4 md:px-6 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold font-outfit mb-0.5">My Bookings</h1>
        <p className="text-xs text-gray-500 mb-4">Manage your bookings</p>

        {bookings.length > 0 ? (
          <div className="space-y-3">
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
                <div key={index} className="group relative bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-lg flex flex-col md:flex-row">
                  {/* Left: Poster */}
                  <div className="md:w-28 h-28 md:h-auto shrink-0 relative overflow-hidden">
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
                  <div className="p-3 md:p-4 flex-1 flex flex-col justify-center gap-2">
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-white mb-0.5 leading-tight">{movie.title || "Unknown Movie"}</h2>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm font-medium">{theaterName}, {theaterCity}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{movie.language || "N/A"}</span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span>{movie.format || "2D"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
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
                  <div className="bg-white/5 p-3 md:p-4 md:w-48 flex flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 relative overflow-hidden">
                    {/* Payment Status Badge */}
                    <div className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-green-500/20 mb-2">
                      Confirmed
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0">Total Amount</p>
                      <p className="text-lg font-bold text-white">₹{booking.amount}</p>
                    </div>

                    <div className="flex gap-3 w-full mt-6">
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="flex-1 bg-white text-black py-1.5 rounded-md font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleShare(booking)}
                        className="flex-1 bg-white/10 text-white border border-white/10 py-1.5 rounded-md font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-white/20 transition-colors active:scale-95"
                      >
                        <Share2 className="w-3 h-3" />
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
          <div className="w-full max-w-2xl relative flex flex-col items-center" onClick={e => e.stopPropagation()}>

            {/* Ticket Container */}
            <div ref={ticketRef} className="bg-[#121212] text-white rounded-3xl overflow-hidden shadow-2xl relative w-full flex flex-col md:flex-row border border-[#ffffff1a]">

              {/* LEFT: Poster Section */}
              <div className="relative md:w-32 h-40 md:h-auto min-h-[150px] bg-[#111827]">
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
              <div className="flex-1 p-4 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-[#ffffff1a] bg-[#121212]">
                <h2 className="text-xl font-black leading-tight mb-1 font-manrope text-white">{selectedTicket.show?.movie?.title}</h2>
                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-3">
                  <span className="bg-[#ffffff1a] px-2 py-0.5 rounded border border-[#ffffff1a]">{selectedTicket.show?.movie?.language}</span>
                  <span className="bg-[#ffffff1a] px-2 py-0.5 rounded border border-[#ffffff1a]">{selectedTicket.show?.movie?.format || "2D"}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#F84565] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-[#e5e7eb]">{selectedTicket.show?.theater?.name}</p>
                      <p className="text-xs text-[#9ca3af]">{selectedTicket.show?.theater?.location}, {selectedTicket.show?.theater?.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#ffffff0d] px-2.5 py-1.5 rounded-lg border border-[#ffffff0d]">
                      <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-1">Date</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar size={14} className="text-[#F84565]" />
                        {new Date(selectedTicket.show?.showDateTime || selectedTicket.show?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-[#ffffff0d] px-2.5 py-1.5 rounded-lg border border-[#ffffff0d]">
                      <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-1">Time</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock size={14} className="text-[#fb923c]" />
                        {new Date(selectedTicket.show?.showDateTime || selectedTicket.show?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#6b7280] uppercase font-bold mb-2">Seats</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedTicket.bookedSeats || selectedTicket.seats || []).map(seat => (
                        <span key={seat} className="bg-[#ffffff1a] text-white border border-[#ffffff1a] px-2 py-0.5 rounded text-[10px] font-bold font-mono">
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
              <div className="bg-[#161616] p-4 md:w-52 flex flex-col justify-between items-center text-center relative">
                <div>
                  <span className="bg-[#22c55e1a] text-[#22c55e] border border-[#22c55e33] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Confirmed</span>
                </div>

                <div className="my-4">
                  <p className="text-[9px] text-[#6b7280] font-bold uppercase tracking-widest mb-0.5">Total Amount</p>
                  <p className="text-2xl font-black text-white tracking-tighter">₹{selectedTicket.amount}</p>
                </div>

                <div className="w-full space-y-3">
                  <div className="p-1.5 bg-white rounded-lg mb-3 mx-auto w-fit">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket._id}`}
                      className="w-16 h-16 object-contain"
                      alt="QR"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <button
                    onClick={handleDownloadTicket}
                    className="w-full bg-white text-black py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full bg-[#ffffff0d] border border-[#ffffff1a] text-white py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-[#ffffff1a] transition-colors active:scale-95"
                  >
                    <Share2 className="w-3 h-3" /> Share
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
