import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Info } from "lucide-react";
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

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-20 px-4 md:px-16 lg:px-28">

            {/* Movie Header */}
            <div className="border-b border-white/10 pb-6 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold font-outfit">{movie?.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-400 text-sm">
                    <span className="border border-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider">UA</span>
                    <span>{movie?.language}</span>
                    <span>•</span>
                    <span>{movie?.genres?.join(", ")}</span>
                    <span>•</span>
                    <span>{movie?.duration}m</span>
                </div>
            </div>

            {/* Date Slider */}
            <div className="flex gap-4 overflow-x-auto pb-6 border-b border-white/10 custom-scrollbar mb-8">
                {Object.keys(dateTime).sort().map((date) => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all border ${selectedDate === date
                                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(229,9,20,0.5)]"
                                : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:border-white/20"
                            }`}
                    >
                        <span className="text-xs uppercase font-bold">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-xl md:text-2xl font-bold">{new Date(date).getDate()}</span>
                        <span className="text-[10px] uppercase font-bold">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </button>
                ))}
            </div>

            {/* Theaters List */}
            <div className="space-y-6 bg-white/5 rounded-2xl p-6 md:p-8 border border-white/5">

                {/* Note about "Fake" multiple theaters since we only have one defaults */}
                {/* We will just list the shows directly under a generic 'Available Theaters' header for now, 
            or simulate a theater name if the backend doesn't give one easily. 
            Actually, the fetched shows HAVE a theater ID. `getShows` returns uniqueShowsMap which is weird.
            Wait, the endpoint `/api/show/${movieId}` returns 'dateTime' object: { date: [{ time, showId }] }
            It doesn't group by Theater. This is a limitation of the current backend structure.
            For now, we will render "PVR Cinemas (Standard)" as a static header since we assigned a default theater.
        */}

                <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-white/5 pb-6 last:border-0">
                    <div className="w-full md:w-1/3">
                        <h3 className="text-lg font-bold hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                            Inox: Worldmark, Gurugram <Info size={14} className="text-gray-500" />
                        </h3>
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            ● M-Ticket Available
                        </p>
                        <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                            ● Food & Beverage
                        </p>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-4">
                        {selectedDate && dateTime[selectedDate]?.map((show) => (
                            <button
                                key={show.showId}
                                onClick={() => handleTimeClick(show.showId)}
                                className="group relative px-6 py-3 rounded-lg border border-white/20 hover:border-green-500 bg-black hover:bg-black/50 transition-all flex flex-col items-center min-w-[100px]"
                            >
                                <span className="text-green-500 font-bold text-sm group-hover:text-white transition-colors">
                                    {(() => {
                                        const [h, m] = show.time.split(':');
                                        const hour = parseInt(h);
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        const displayHour = hour % 12 || 12;
                                        return `${displayHour}:${m} ${ampm}`;
                                    })()}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider group-hover:text-gray-300">
                                    4K Dolby
                                </span>
                                {/* Tooltip-ish visual */}
                                <div className="absolute -top-2 -right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </button>
                        ))}

                        {(!selectedDate || !dateTime[selectedDate]) && (
                            <p className="text-gray-500 text-sm italic">No shows available for this date.</p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate('/movies')}
                className="mt-8 px-6 py-2 rounded-full border border-white/20 text-gray-400 hover:text-white hover:border-white transition flex items-center gap-2 text-sm"
            >
                <ArrowLeft size={16} /> Back to Movies
            </button>

        </div>
    );
};

export default Theaters;
