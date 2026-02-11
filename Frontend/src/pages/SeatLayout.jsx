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

      {/* ULTRA COMPACT HEADER */}
      <div className="relative z-10 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-2 flex justify-between items-center shrink-0 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {show.movie?.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9px] text-gray-500 flex items-center gap-1">
                <MapPin size={8} className="text-primary" />
                {show.theater?.name}
              </p>
              <span className="text-gray-700">•</span>
              <p className="text-[9px] text-gray-500 flex items-center gap-1">
                <Clock size={8} className="text-primary" />
                {new Date(show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Category Pills - Horizontal */}
          <div className="hidden lg:flex gap-2 text-[9px]">
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span className="text-gray-500">₹{show.priceStandard}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <span className="text-gray-500">₹{show.pricePremium}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
              <span className="text-gray-500">₹{show.priceVIP}</span>
            </div>
          </div>
          <span className="text-[11px] bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 px-3 py-1 rounded-full font-medium">
            <span className="text-primary font-bold">{selectedSeats.length}</span> Selected
          </span>
        </div>
      </div>

      {/* MAIN CONTENT - WIDER & SHORTER */}
      <div className="relative z-10 flex-1 overflow-hidden flex items-center justify-center px-8 pb-20">

        <div className="w-full max-w-7xl">

          {/* SCREEN - COMPACT */}
          <div className="w-full mb-3">
            <div className="relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="w-[50%] h-4 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-xl"></div>
              </div>
              <div className="relative w-[60%] mx-auto">
                <div className="h-3 border-t-[2px] border-gradient-to-r from-transparent via-primary/50 to-transparent rounded-t-[80px]"
                  style={{ borderImage: 'linear-gradient(90deg, transparent, rgb(236 72 153 / 0.5), transparent) 1' }}></div>
              </div>
              <p className="text-gray-600 text-[8px] uppercase tracking-[0.3em] mt-1.5 text-center font-bold">
                ✦ Screen ✦
              </p>
            </div>
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

            <div className="flex flex-col gap-1 items-center">
              {groupRows.map((rowGroup, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-0.5 items-center">
                  {rowGroup.map(rowLabel => {
                    const category = getCategory(rowLabel);
                    const categoryGradient = getCategoryColor(category);

                    return (
                      <div key={rowLabel} className="flex items-center gap-2">
                        <span className="w-4 text-right text-gray-600 text-[10px] font-bold">{rowLabel}</span>
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
                                  className={`
                                    relative w-8 h-5 rounded text-[9px] font-bold transition-all duration-200
                                    ${isOccupied
                                      ? 'bg-gray-900/50 text-gray-700 cursor-not-allowed border border-gray-800'
                                      : isSelected
                                        ? `bg-gradient-to-br ${categoryGradient} text-white scale-110 shadow-xl shadow-primary/50 animate-pulse-slow border-2 border-white/30`
                                        : `bg-white/5 border border-white/20 hover:bg-gradient-to-br hover:${categoryGradient} hover:scale-105 hover:shadow-lg hover:border-white/50 active:scale-95`
                                    }
                                    ${hoveredSeat === seatId && !isOccupied && !isSelected ? 'ring-2 ring-primary/50' : ''}
                                  `}
                                >
                                  {seatNum}
                                  {isSelected && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                  )}
                                </button>
                                {isAisle && <div className="w-3"></div>}
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

          {/* LEGEND - INLINE */}
          <div className="flex justify-center gap-4 mt-3 text-[9px] text-gray-500">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 bg-white/10 rounded border border-white/30"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-purple-500 rounded shadow-lg"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 bg-gray-900/50 rounded border border-gray-800"></div>
              <span>Sold</span>
            </div>
          </div>

        </div>

      </div>

      {/* PREMIUM BOTTOM BAR - COMPACT */}
      {selectedSeats.length > 0 && !showCheckout && (
        <div className="relative z-20 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-2xl border-t border-white/10 p-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[8px] text-gray-600 uppercase tracking-wider mb-0.5 font-bold">Total Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    ₹{selectedSeatsPrice}
                  </span>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-700 hidden lg:block">
                {selectedSeats.join(' • ')}
              </p>
            </div>
            <button
              onClick={() => { setCheckoutStep(1); setShowCheckout(true); }}
              className="group relative bg-gradient-to-r from-primary via-pink-500 to-purple-500 hover:from-purple-500 hover:to-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Sparkles size={14} className="animate-spin-slow" />
              <span className="relative">Book Tickets</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-gradient-to-br from-[#0c0c0c]/95 to-[#0a0a0a]/95 backdrop-blur-2xl w-full md:max-w-md md:rounded-3xl border-t md:border border-white/10 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.02] to-transparent shrink-0">
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {checkoutStep === 1 ? "Contact Details" : checkoutStep === 2 ? "Add Snacks" : "Payment"}
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Step {checkoutStep} of 3</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white hover:rotate-90 duration-300"
              >
                <X size={16} />
              </button>
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
