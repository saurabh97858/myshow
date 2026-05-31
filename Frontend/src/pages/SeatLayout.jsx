import React, { useEffect, useState } from "react";
import { assets, groupRows } from "../assets/assets";
import cinemaBg from "../assets/cinema-bg.png";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, MapPin, Clock, ShoppingBag, CreditCard, User, ChevronRight, X, Plus, Minus, ArrowRight, Sparkles } from "lucide-react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

const SeatLayout = () => {
  const { showId } = useParams();
  const { user, axios, getToken } = useAppContext();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Data for Booking
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    mobile: ""
  });

  const [foodItems, setFoodItems] = useState([
    { id: 1, name: "Large Popcorn", price: 350, quantity: 0, icon: "🍿" },
    { id: 2, name: "Regular Popcorn", price: 250, quantity: 0, icon: "🍿" },
    { id: 3, name: "Coke (Large)", price: 200, quantity: 0, icon: "🥤" },
    { id: 4, name: "Coke (Regular)", price: 150, quantity: 0, icon: "🥤" },
    { id: 5, name: "Nachos with Dip", price: 300, quantity: 0, icon: "🧀" },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

  // Fetch Show Details & Occupied Seats
  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setLoading(true);
        const showRes = await axios.get(`/api/show/single/${showId}`);
        if (showRes.data.success) {
          setShow(showRes.data.show);
        } else {
          toast.error("Show not found");
          navigate("/movies");
          return;
        }

        const seatsRes = await axios.get(`/api/booking/seats/${showId}`);
        if (seatsRes.data.success) {
          setOccupiedSeats(seatsRes.data.occupiedSeats || []);
        }

      } catch (error) {
        console.error("Error loading show:", error);
        toast.error("Failed to load show details");
      } finally {
        setLoading(false);
      }
    };

    if (showId) fetchShowData();
  }, [showId, axios, navigate]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setContactDetails(prev => ({
        ...prev,
        name: user.fullName || user.firstName || "",
        email: user.primaryEmailAddress?.emailAddress || ""
      }));
    }
  }, [user]);

  // Seat Logic
  const getCategory = (row) => {
    if (["A", "B", "C", "D"].includes(row)) return "Standard";
    if (["E", "F"].includes(row)) return "Premium";
    return "Balcony";
  };

  const getPrice = (category) => {
    if (!show) return 0;
    if (category === "Standard") return show.priceStandard || 150;
    if (category === "Premium") return show.pricePremium || 250;
    return show.priceVIP || 400;
  };

  const getCategoryColor = (category) => {
    if (category === "Standard") return "from-blue-500 to-cyan-500";
    if (category === "Premium") return "from-purple-500 to-pink-500";
    return "from-amber-500 to-yellow-500";
  };

  const selectedSeatsPrice = selectedSeats.reduce((total, seatId) => {
    const row = seatId.charAt(0);
    const category = getCategory(row);
    return total + getPrice(category);
  }, 0);

  const selectedFoodPrice = foodItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalAmount = selectedSeatsPrice + selectedFoodPrice;

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) return prev.filter(id => id !== seatId);
      if (prev.length >= 8) {
        toast.error("You can only select up to 8 seats");
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleAutoSuggest = () => {
    // Flatten rows
    const allRows = groupRows.flat();
    const targetRows = ["F", "E", "D", "G", "C", "H", "B", "A"]; // Priority order
    const requiredSeats = 2; // Suggesting a pair 

    let bestPair = null;

    for (const row of targetRows) {
        if (!allRows.includes(row)) continue;
        
        // Find available seats in this row
        const centerSeats = [4, 5, 6, 7];
        let availableInRow = [];
        for (let i = 1; i <= 10; i++) {
            if (!occupiedSeats.includes(`${row}${i}`)) {
                availableInRow.push(i);
            }
        }

        // Find best pair
        let bestScore = -1;
        for (let i = 0; i <= availableInRow.length - requiredSeats; i++) {
            const current = availableInRow[i];
            const next = availableInRow[i+1];
            
            // Check if contiguous
            if (next === current + 1) {
                // Score based on how many center seats are included
                let score = 0;
                if (centerSeats.includes(current)) score++;
                if (centerSeats.includes(next)) score++;

                if (score > bestScore) {
                    bestScore = score;
                    bestPair = [`${row}${current}`, `${row}${next}`];
                }
            }
        }
        
        if (bestPair) break; // Found a pair in the highest priority row
    }

    if (bestPair) {
        setSelectedSeats(bestPair);
        toast.success("AI Auto-Suggested the Best Seats!");
    } else {
        toast.error("Couldn't find an ideal pair of seats.");
    }
  };

  // Snacks Logic
  const updateSnack = (id, delta) => {
    setFoodItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }));
  };

  // Booking Logic
  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/sign-in");
      return;
    }

    if (!contactDetails.name || !contactDetails.email || !contactDetails.mobile) {
      toast.error("Please fill in all contact details");
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      toast.error("Please enter UPI ID");
      return;
    }
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast.error("Please enter Card details");
      return;
    }

    const toastId = toast.loading("Processing Payment...");

    try {
      const token = await getToken();

      const payload = {
        showId,
        selectedSeats,
        amount: totalAmount,
        contactDetails,
        foodItems: foodItems.filter(f => f.quantity > 0).map(f => ({ name: f.name, price: f.price, quantity: f.quantity })),
        paymentDetails: {
          method: paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId : undefined,
          utrNumber: paymentMethod === 'upi' ? `UTR${Date.now()}` : undefined,
          cardLast4: paymentMethod === 'card' ? cardDetails.number.slice(-4) : undefined
        }
      };

      const { data } = await axios.post("/api/booking/create", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success("Booking Confirmed!", { id: toastId });
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Booking failed", { id: toastId });
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  // ---------------- UI RENDER ----------------

  if (loading) return <Loading />;

  if (!show) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl text-gray-400">Show details not found.</h2>
      <button onClick={() => navigate('/movies')} className="bg-primary px-6 py-2 rounded-full">Back to Movies</button>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative">

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      {/* COMPACT HEADER */}
      <div className="relative z-10 bg-black/70 backdrop-blur-2xl border-b border-white/8 px-4 sm:px-6 py-3 flex justify-between items-center shrink-0 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-white/10"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-sm font-bold leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent max-w-[200px] truncate">
              {show.movie?.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <MapPin size={9} className="text-primary" />
                {show.theater?.name}
              </p>
              <span className="text-gray-700 text-[10px]">•</span>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Clock size={9} className="text-primary" />
                {new Date(show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Category Price Pills */}
          <div className="hidden lg:flex gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1.5 rounded-full border border-blue-500/30">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <span className="text-blue-300 font-semibold">₹{show.priceStandard}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1.5 rounded-full border border-purple-500/30">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <span className="text-purple-300 font-semibold">₹{show.pricePremium}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-full border border-amber-500/30">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"></div>
              <span className="text-amber-300 font-semibold">₹{show.priceVIP}</span>
            </div>
          </div>
          {show.dynamicPricingApplied && (
            <div className="hidden md:flex items-center gap-1 text-[10px] bg-red-500/15 text-red-400 border border-red-500/40 px-2.5 py-1.5 rounded-full font-bold">
              🔥 Surge
            </div>
          )}
          <button
              onClick={handleAutoSuggest}
              className="hidden md:flex items-center gap-1.5 text-[10px] bg-primary/15 text-primary border border-primary/40 px-3 py-1.5 rounded-full hover:bg-primary/25 transition-all font-bold"
          >
              <Sparkles size={11} />
              Auto-Suggest
          </button>
          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 px-3 py-1.5 rounded-full">
            <span className="text-primary font-black text-sm">{selectedSeats.length}</span>
            <span className="text-gray-400 text-[10px] font-medium ml-1">Selected</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 overflow-hidden flex items-center justify-center px-4 sm:px-8 pb-20">

        <div className="w-full max-w-7xl">

          {/* SCREEN - CINEMATIC */}
          <div className="w-full mb-6 relative select-none">
            <div className="relative w-[70%] mx-auto">
              {/* Projection beams */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[90%] h-16">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/25 via-primary/8 to-transparent blur-xl rounded-full" />
              </div>
              {/* Screen bar */}
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 shadow-[0_0_30px_8px_rgba(248,69,101,0.4)] rounded-full" />
              {/* Shine overlay */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse-slow" />
            </div>
            <p className="text-gray-600 text-[9px] uppercase tracking-[0.5em] font-black text-center mt-3">
              Screen · This Way Up
            </p>
          </div>

          {/* SEATS GRID - WIDE LAYOUT */}
          <div className="w-full relative flex justify-center">
            {/* Hover tooltip */}
            {hoveredSeat && !occupiedSeats.includes(hoveredSeat) && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-primary/30 px-3 py-1.5 rounded-lg shadow-2xl z-50 animate-fade-in">
                <p className="text-[10px] font-bold text-white">{hoveredSeat}</p>
                <p className="text-[8px] text-primary">₹{getPrice(getCategory(hoveredSeat.charAt(0)))}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 items-center">
              {groupRows.map((rowGroup, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-1 items-center">
                  {rowGroup.map(rowLabel => {
                    const category = getCategory(rowLabel);
                    const categoryGradient = getCategoryColor(category);

                    return (
                      <div key={rowLabel} className="flex items-center gap-2.5">
                        <span className="w-4 text-right text-gray-600 text-[10px] font-black">{rowLabel}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(seatNum => {
                            const seatId = `${rowLabel}${seatNum}`;
                            const isOccupied = occupiedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const isAisle = seatNum === 3 || seatNum === 7;

                            return (
                              <React.Fragment key={seatId}>
                                <button
                                  onClick={() => handleSeatClick(seatId)}
                                  onMouseEnter={() => setHoveredSeat(seatId)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={isOccupied}
                                  title={isOccupied ? 'Sold' : `${seatId} - ₹${getPrice(category)}`}
                                  className={`
                                    relative w-7 h-6 rounded-t-lg text-[9px] font-bold transition-all duration-150
                                    ${isOccupied
                                      ? 'bg-gray-900/60 text-gray-700 cursor-not-allowed border border-gray-800/80'
                                      : isSelected
                                        ? `bg-gradient-to-br ${categoryGradient} text-white shadow-lg shadow-primary/40 border border-white/30 scale-110`
                                        : `bg-white/[0.06] border border-white/20 hover:scale-110 hover:border-white/50 active:scale-95 text-gray-400 hover:text-white`
                                    }
                                    ${hoveredSeat === seatId && !isOccupied && !isSelected ? 'ring-1 ring-primary/60 border-primary/40' : ''}
                                  `}
                                >
                                  {seatNum}
                                  {isSelected && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-80"></div>
                                  )}
                                </button>
                                {isAisle && <div className="w-2.5" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* LEGEND */}
          <div className="flex justify-center gap-3 mt-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-3 h-3 bg-white/[0.06] rounded-t border border-white/20"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30">
              <div className="w-3 h-3 bg-gradient-to-br from-primary to-purple-500 rounded-t"></div>
              <span className="text-primary">Selected</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-3 h-3 bg-gray-900/60 rounded-t border border-gray-800"></div>
              <span className="text-gray-600">Sold</span>
            </div>
          </div>

        </div>

      </div>

      {/* PREMIUM BOTTOM BAR */}
      {selectedSeats.length > 0 && !showCheckout && (
        <div className="relative z-20 fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t border-white/10 shadow-2xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.98) 60%, rgba(0,0,0,0.6) 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-8">
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 font-bold">Total Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    ₹{selectedSeatsPrice}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex flex-wrap gap-1.5">
                {selectedSeats.map(s => (
                  <span key={s} className="text-[10px] font-bold bg-white/5 border border-white/15 px-2 py-0.5 rounded-full text-gray-300">{s}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setCheckoutStep(1); setShowCheckout(true); }}
              className="group relative bg-gradient-to-r from-primary via-pink-500 to-purple-500 hover:from-purple-500 hover:to-primary px-6 sm:px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 overflow-hidden shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Sparkles size={14} className="animate-spin-slow relative z-10" />
              <span className="relative z-10">Book Tickets</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="w-full md:max-w-md md:rounded-3xl border-t md:border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)]" style={{ background: 'linear-gradient(145deg, #0e0e12, #0a0a0e)' }}>

            {/* Modal Header + Stepper */}
            <div className="px-5 pt-5 pb-4 border-b border-white/8 bg-gradient-to-r from-white/[0.02] to-transparent shrink-0">
              {/* Step Progress */}
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3].map(step => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black transition-all duration-300 ${
                      step < checkoutStep ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                      step === checkoutStep ? 'bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg shadow-primary/40 scale-110' :
                      'bg-white/[0.06] border border-white/15 text-gray-500'
                    }`}>
                      {step < checkoutStep ? '✓' : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                        step < checkoutStep ? 'bg-green-500' : 'bg-white/10'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {checkoutStep === 1 ? 'Contact Details' : checkoutStep === 2 ? 'Add Snacks 🍿' : 'Payment 💳'}
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Step {checkoutStep} of 3</p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white hover:rotate-90 duration-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-5 overflow-y-auto flex-1">

              {/* STEP 1: Contact */}
              {checkoutStep === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <input
                        type="text"
                        value={contactDetails.name}
                        onChange={e => setContactDetails({ ...contactDetails, name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-700"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={contactDetails.email}
                        onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-700"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                      <input
                        type="tel"
                        value={contactDetails.mobile}
                        onChange={e => setContactDetails({ ...contactDetails, mobile: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-700"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Snacks */}
              {checkoutStep === 2 && (
                <div className="space-y-2.5 animate-fade-in">
                  {foodItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/10">
                        <button
                          onClick={() => updateSnack(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-all active:scale-90"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateSnack(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-primary/20 rounded-md text-white bg-primary/10 transition-all active:scale-90 border border-primary/30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Payment */}
              {checkoutStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 rounded-xl border border-white/10 space-y-2 shadow-lg">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Seats ({selectedSeats.join(', ')})</span>
                      <span className="font-bold text-white">₹{selectedSeatsPrice}</span>
                    </div>
                    {selectedFoodPrice > 0 && (
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Food & Beverages</span>
                        <span className="font-bold text-white">₹{selectedFoodPrice}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2.5 flex justify-between items-baseline mt-2">
                      <span className="text-gray-300 font-medium text-xs">Total Payable</span>
                      <span className="text-2xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Payment Method</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'upi' ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/[0.02] border border-white/10 text-gray-500 hover:bg-white/[0.05]'}`}
                      >
                        UPI
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/[0.02] border border-white/10 text-gray-500 hover:bg-white/[0.05]'}`}
                      >
                        CARD
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {paymentMethod === 'upi' ? (
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="username@bank"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="0000 0000 0000 0000"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="MM/YY"
                          />
                          <input
                            type="text"
                            value={cardDetails.cvv}
                            onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="CVV"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex gap-3 shrink-0">
              {checkoutStep > 1 && (
                <button
                  onClick={() => setCheckoutStep(prev => prev - 1)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all text-xs font-bold"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (checkoutStep === 1) {
                    if (!contactDetails.name?.trim() || !contactDetails.email?.trim() || !contactDetails.mobile?.trim()) {
                      return toast.error("Please fill in all contact details");
                    }
                  }
                  if (checkoutStep < 3) setCheckoutStep(prev => prev + 1);
                  else handleBooking();
                }}
                className="flex-1 bg-gradient-to-r from-primary via-pink-500 to-purple-500 hover:from-purple-500 hover:to-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30"
              >
                {checkoutStep === 3 ? `PAY ₹${totalAmount}` : "CONTINUE"}
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SeatLayout;
