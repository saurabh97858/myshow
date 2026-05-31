import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Info, MapPin, Star, Ticket, Coffee, Volume2, MonitorPlay, Zap, ChevronLeft } from "lucide-react";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Theaters = () => {
    const navigate = useNavigate();
    const { movieId } = useParams();
    const { axios, user } = useAppContext();

    const [movie, setMovie] = useState(null);
    const [dateTime, setDateTime] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    // Fetch movie and show details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`/api/show/${movieId}`);
                if (data.success) {
                    setMovie(data.movie);
                    setDateTime(data.dateTime || {});

                    // Auto-select first date
                    const dates = Object.keys(data.dateTime || {}).sort();
                    if (dates.length > 0) {
                        setSelectedDate(dates[0]);
                    }
                } else {
                    toast.error(data.message || "Movie not found");
                    navigate("/movies");
                }
            } catch (err) {
                toast.error("Failed to load details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [movieId]);

    const handleTimeClick = (showId) => {
        if (!user) {
            toast.error("Please login to continue");
            return;
        }
        navigate(`/movies/${movieId}/${showId}`);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
        return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    };

    if (loading) return <Loading />;
    if (!movie) return <p className="text-center mt-10 text-gray-400">Movie not found</p>;

    return (
        <div className="min-h-screen bg-[#09090B] text-white">
            {/* ── CINEMATIC HEADER ── */}
            <div className="relative overflow-hidden">
                {/* Background Banner with Movie Backdrop Blur */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl pointer-events-none scale-110"
                    style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl || '/default-poster.jpg'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-purple-600/0 to-[#09090B] pointer-events-none" />

                <div className="relative z-10 px-4 sm:px-6 lg:px-16 pt-24 pb-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-6 text-sm font-medium"
                    >
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </span>
                        Back to Movie
                    </button>

                    {/* Movie Info Header Card */}
                    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                        {/* Movie Poster Thumbnail */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={movie.posterUrl || "/default-poster.jpg"}
                                onError={(e) => { e.target.src = "/default-poster.jpg" }}
                                alt={movie.title}
                                className="w-20 sm:w-24 h-28 sm:h-36 object-cover rounded-xl shadow-lg border border-white/10"
                            />
                        </div>

                        {/* Text info */}
                        <div className="flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                                <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    UA
                                </span>
                                <span className="text-[11px] text-gray-400 uppercase font-black tracking-wider bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    {movie.language || "Hindi"}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-outfit tracking-tight mb-2">
                                {movie.title}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 leading-relaxed">
                                {movie.genres?.join(" • ")}
                                {movie.duration && ` • ${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`}
                            </p>

                            {/* Info highlights */}
                            <div className="flex justify-center sm:justify-start gap-4">
                                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-xl text-yellow-400 font-bold text-xs">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                    <span>{movie.rating > 0 ? movie.rating.toFixed(1) : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DATE SLIDER ── */}
            <div className="px-4 sm:px-6 lg:px-16 mb-8">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Select Date</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x no-scrollbar">
                    {Object.keys(dateTime).sort().map((date) => {
                        const dateObj = new Date(date);
                        const isSelected = selectedDate === date;
                        return (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 rounded-2xl transition-all border snap-start duration-200
                                    ${isSelected
                                        ? "bg-gradient-to-b from-primary to-rose-600 text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                        : "bg-white/[0.03] text-gray-400 border-white/10 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-0.5">
                                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-xl sm:text-2xl font-black leading-none mb-0.5">
                                    {dateObj.getDate()}
                                </span>
                                <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">
                                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── THEATERS & SHOWTIMES LIST ── */}
            <div className="px-4 sm:px-6 lg:px-16 pb-20">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Available Theaters</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="space-y-4">
                    {/* Primary Theater Container */}
                    <div className="group bg-white/[0.02] border border-white/8 hover:border-white/12 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden">
                        {/* Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] pointer-events-none rounded-2xl" />

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                            {/* Theater Details */}
                            <div className="w-full md:w-1/3">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                                    Inox: Worldmark, Gurugram
                                    <span className="p-1 bg-white/5 rounded-lg border border-white/10 text-gray-500 hover:text-white transition-all">
                                        <Info className="w-3.5 h-3.5" />
                                    </span>
                                </h3>
                                <div className="flex items-center gap-1 text-gray-400 mt-2">
                                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span className="text-xs">Sector 65, Worldmark, Gurugram</span>
                                </div>

                                {/* Modern Labels */}
                                <div className="flex flex-wrap gap-2.5 mt-4">
                                    <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                        <Ticket className="w-3 h-3" />
                                        M-Ticket
                                    </span>
                                    <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                                        <Coffee className="w-3 h-3" />
                                        Food &amp; Bev
                                    </span>
                                </div>
                            </div>

                            {/* Showtimes grid */}
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2.5">
                                    {selectedDate && dateTime[selectedDate]?.map((show) => (
                                        <button
                                            key={show.showId}
                                            onClick={() => handleTimeClick(show.showId)}
                                            className="group/btn relative flex flex-col items-center px-4 py-2.5 rounded-xl border border-white/12 hover:border-primary/60 bg-white/[0.03] hover:bg-primary/10 transition-all duration-200 min-w-[90px] overflow-hidden"
                                        >
                                            {/* Pulse Dot */}
                                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shadow-md shadow-green-400/50 animate-pulse" />

                                            <span className="text-white font-bold text-xs sm:text-sm group-hover/btn:text-primary transition-colors">
                                                {(() => {
                                                    const [h, m] = show.time.split(':');
                                                    const hour = parseInt(h);
                                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                                    const displayHour = hour % 12 || 12;
                                                    return `${displayHour}:${m} ${ampm}`;
                                                })()}
                                            </span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold group-hover/btn:text-gray-300">
                                                4K DOLBY
                                            </span>
                                        </button>
                                    ))}

                                    {(!selectedDate || !dateTime[selectedDate] || dateTime[selectedDate].length === 0) && (
                                        <p className="text-gray-500 text-sm italic">No shows available for this date.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Theaters;
