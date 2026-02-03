import React, { useEffect, useState } from "react";
import { assets, groupRows } from "../assets/assets";
import cinemaBg from "../assets/cinema-bg.png";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Clock, ShoppingBag, CreditCard, User, ChevronRight, X, Plus, Minus, ArrowRight } from "lucide-react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

const SeatLayout = () => {
  const { showId } = useParams();
  const { user, axios, getToken } = useAppContext(); // removed 'shows' dependency for direct fetch reliability
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Contact, 2: Snacks, 3: Payment

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
        // 1. Get Show Details
        const showRes = await axios.get(`/api/show/single/${showId}`);
        if (showRes.data.success) {
          setShow(showRes.data.show);
        } else {
          toast.error("Show not found");
          navigate("/movies");
          return;
        }

        // 2. Get Occupied Seats
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
    return "Balcony"; // Previously VIP
  };

  const getPrice = (category) => {
    if (!show) return 0;
    if (category === "Standard") return show.priceStandard || 150;
    if (category === "Premium") return show.pricePremium || 250;
    return show.priceVIP || 400; // Map Balcony to VIP price in backend
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
    // Validation
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
        foodItems: foodItems.filter(f => f.quantity > 0).map(f => ({ name: f.name, price: f.price, quantity: f.quantity }))
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
    <div
      className="min-h-screen relative text-white bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${cinemaBg})` }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] z-0"></div>
      <div className="relative z-10">

        {/* --- HEADER --- */}
        <div className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-40 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-lg font-bold leading-tight">{show.movie?.title}</h1>
              <p className="text-xs text-gray-400">
                {show.theater?.name}, {show.theater?.location} • {new Date(show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-sm border border-white/20 px-3 py-1 rounded-full">{selectedSeats.length} Seats Selected</span>
          </div>
        </div>

        <div className="pt-24 pb-32 px-4 md:px-0 flex flex-col items-center">

          {/* Screen Visual */}
          <div className="w-full max-w-4xl mb-12 relative flex flex-col items-center">
            <div className="w-[80%] h-4 bg-gradient-to-b from-primary/50 to-transparent blur-md rounded-[50%]"></div>
            <div className="w-[90%] h-8 border-t-4 border-white/10 rounded-t-[50%] mt-[-10px]"></div>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mt-4">Screen This Way</p>
          </div>

          {/* --- SEAT GRID --- */}
          <div className="w-full max-w-3xl overflow-x-auto pb-10">
            <div className="flex flex-col gap-8 min-w-[300px] px-4">
              {groupRows.map((rowGroup, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-2 items-center">
                  {rowGroup.map(rowLabel => (
                    <div key={rowLabel} className="flex items-center gap-3">
                      <span className="w-6 text-right text-gray-500 text-xs font-bold">{rowLabel}</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(seatNum => {
                          const seatId = `${rowLabel}${seatNum}`;
                          const isOccupied = occupiedSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          const category = getCategory(rowLabel);

                          // Categories GAP (Space between 3-4 and 7-8 for aisle)
                          const isAisle = seatNum === 3 || seatNum === 7;

                          return (
                            <React.Fragment key={seatId}>
                              <button
                                onClick={() => handleSeatClick(seatId)}
                                disabled={isOccupied}
                                className={`
                                                    w-7 h-7 md:w-9 md:h-9 rounded-t-lg md:rounded-lg text-[10px] md:text-xs font-medium transition-all
                                                    ${isOccupied ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5' :
                                    isSelected ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-110' :
                                      category === 'Standard' ? 'bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/40' :
                                        category === 'Premium' ? 'bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40' :
                                          'bg-amber-900/20 border border-amber-500/30 hover:bg-amber-900/40'}
                                                `}
                              >
                                {seatNum}
                              </button>
                              {isAisle && <div className="w-4 md:w-8"></div>}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white/10 rounded border border-white/20"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded shadow-lg"></div> Selected</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 rounded border border-white/5"></div> Sold</div>
          </div>

        </div>

        {/* --- FOOTER BUTTON --- */}
        {selectedSeats.length > 0 && !showCheckout && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 animate-slide-up">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-between ring-1 ring-white/5">
              <div className="pl-2">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Total Amount</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white tracking-tight">₹{selectedSeatsPrice}</span>
                  <span className="text-xs text-gray-500 font-medium">{selectedSeats.length} Seats</span>
                </div>
              </div>
              <button
                onClick={() => { setCheckoutStep(1); setShowCheckout(true); }}
                className="bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
              >
                Book Tickets <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* --- CHECKOUT MODAL --- */}
        {/* --- CHECKOUT MODAL --- */}
        {showCheckout && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[8px] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-300">
            <div className="bg-[#0c0c0c]/90 backdrop-blur-xl w-full md:max-w-2xl md:rounded-3xl border-t md:border border-white/10 max-h-[90vh] flex flex-col shadow-2xl animate-slide-up ring-1 ring-white/5">

              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {checkoutStep === 1 ? "Contact Details" : checkoutStep === 2 ? "Add Snacks" : "Payment"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 font-medium">Step {checkoutStep} of 3</p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                {/* STEP 1: Contact */}
                {checkoutStep === 1 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <User className="text-blue-400 shrink-0" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-100 text-sm tracking-wide">CONFIRMATION DETAILS</h4>
                        <p className="text-sm text-blue-200/60 mt-1 leading-relaxed">We'll send your tickets and booking confirmation to these details.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">Full Name</label>
                        <input
                          type="text"
                          value={contactDetails.name}
                          onChange={e => setContactDetails({ ...contactDetails, name: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-600 font-medium"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">Email Address</label>
                        <input
                          type="email"
                          value={contactDetails.email}
                          onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-600 font-medium"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">Phone Number</label>
                        <input
                          type="tel"
                          value={contactDetails.mobile}
                          onChange={e => setContactDetails({ ...contactDetails, mobile: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-600 font-medium"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Snacks */}
                {checkoutStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Select Refreshments</h3>
                    <div className="grid gap-4">
                      {foodItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                            <div>
                              <p className="font-bold text-white text-base">{item.name}</p>
                              <p className="text-sm text-gray-400 font-medium mt-0.5">₹{item.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1.5 border border-white/10 shadow-sm">
                            <button onClick={() => updateSnack(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Minus size={16} /></button>
                            <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                            <button onClick={() => updateSnack(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg text-white bg-white/10 transition-all"><Plus size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment */}
                {checkoutStep === 3 && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Summary */}
                    <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6 rounded-2xl border border-white/10 space-y-3 shadow-lg">
                      <div className="flex justify-between text-gray-400 text-sm font-medium"><span>Seats ({selectedSeats.join(', ')})</span> <span>₹{selectedSeatsPrice}</span></div>
                      {selectedFoodPrice > 0 && <div className="flex justify-between text-gray-400 text-sm font-medium"><span>Food & Beverages</span> <span>₹{selectedFoodPrice}</span></div>}
                      <div className="border-t border-white/10 pt-4 flex justify-between items-baseline mt-4">
                        <span className="text-gray-300 font-medium">Total Payable</span>
                        <span className="text-3xl font-bold text-primary tracking-tight">₹{totalAmount}</span>
                      </div>
                    </div>

                    {/* Method Selection */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Payment Method</label>
                      <div className="flex gap-4">
                        <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-4 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 relative overflow-hidden active:scale-95 hover:scale-[1.02] ${paymentMethod === 'upi' ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/10' : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] text-gray-400'}`}>
                          <span className="text-sm font-bold tracking-wide">UPI</span>
                        </button>
                        <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-4 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 relative overflow-hidden active:scale-95 hover:scale-[1.02] ${paymentMethod === 'card' ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/10' : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] text-gray-400'}`}>
                          <span className="text-sm font-bold tracking-wide">CARD</span>
                        </button>
                      </div>
                    </div>

                    {/* Method Inputs */}
                    <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 animate-scale-in">
                      {paymentMethod === 'upi' ? (
                        <div className="group">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-white transition-colors">UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700 font-mono"
                            placeholder="username@bank"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={cardDetails.number}
                            onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700 font-mono"
                            placeholder="0000 0000 0000 0000"
                          />
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700 font-mono"
                              placeholder="MM/YY"
                            />
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              className="w-28 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700 font-mono"
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
              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4 backdrop-blur-md rounded-b-3xl">
                {checkoutStep > 1 && (
                  <button
                    onClick={() => setCheckoutStep(prev => prev - 1)}
                    className="px-8 py-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all font-bold text-sm tracking-wide"
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
                  className="flex-1 bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] tracking-wide text-sm"
                >
                  {checkoutStep === 3 ? `PAY ₹${totalAmount}` : "CONTINUE"} <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SeatLayout;
