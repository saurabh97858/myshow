import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, Clock, Calendar, ChevronLeft, Star, Wifi, Coffee, Accessibility, Volume2, MonitorPlay, Ticket, Zap } from 'lucide-react';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TheaterMovies = () => {
    const { theaterId } = useParams();
    const { axios, user } = useAppContext();
    const [theater, setTheater] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheaterDetails = async () => {
            try {
                const { data } = await axios.get(`/api/theater/details/${theaterId}`);
                if (data.success) {
                    setTheater(data.theater);
                    setMovies(data.movies);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTheaterDetails();
    }, [theaterId]);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const facilityIcon = (fac) => {
        const f = fac.toLowerCase();
        if (f.includes('wifi')) return <Wifi className="w-3 h-3" />;
        if (f.includes('food') || f.includes('bev')) return <Coffee className="w-3 h-3" />;
        if (f.includes('access')) return <Accessibility className="w-3 h-3" />;
        if (f.includes('dolby') || f.includes('audio') || f.includes('imax')) return <Volume2 className="w-3 h-3" />;
        if (f.includes('4k') || f.includes('screen') || f.includes('premium')) return <MonitorPlay className="w-3 h-3" />;
        return <Zap className="w-3 h-3" />;
    };

    if (loading) return <Loading />;
    if (!theater) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-gray-400 text-xl">Theater not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-primary rounded-full text-white font-semibold hover:bg-primary-dull transition">Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090B] text-white">

            {/* ── CINEMATIC HERO HEADER ── */}
            <div className="relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-600/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 px-4 sm:px-6 lg:px-16 pt-20 pb-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-8 text-sm font-medium"
                    >
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </span>
                        Back to Movies
                    </button>

                    {/* Theater Card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50 relative overflow-hidden">
                        {/* Decorative corner glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                                        <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Now Showing</span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-1">
                                        {theater.name}
                                    </h1>
                                    <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                        <p className="text-sm">{theater.location}</p>
                                    </div>
                                </div>

                                {/* Rating Badge */}
                                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2.5 rounded-2xl">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <div>
                                        <p className="text-yellow-400 font-black text-lg leading-none">4.5</p>
                                        <p className="text-yellow-400/60 text-[10px] font-medium">Rating</p>
                                    </div>
                                </div>
                            </div>

                            {/* Facility Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {theater.facilities.map((fac, idx) => (
                                    <span
                                        key={idx}
                                        className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all px-3 py-1.5 rounded-full text-gray-300"
                                    >
                                        {facilityIcon(fac)}
                                        {fac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOVIES LIST ── */}
            <div className="px-4 sm:px-6 lg:px-16 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-white">Movies &amp; Showtimes</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-xs text-gray-500 font-medium">{movies.length} movies</span>
                </div>

                {movies.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🎬</div>
                        <p className="text-gray-400">No shows available currently.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {movies.map((movie) => (
                            <div
                                key={movie._id}
                                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/8 hover:border-white/15 rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-6 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                                {/* Poster */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-20 sm:w-24 md:w-28 h-28 sm:h-36 md:h-40 rounded-xl object-cover shadow-xl shadow-black/50 border border-white/10 group-hover:border-white/20 transition-all"
                                    />
                                    {/* Language Badge */}
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg shadow-primary/40">
                                        {movie.language || 'EN'}
                                    </div>
                                </div>

                                {/* Movie Info */}
                                <div className="flex-1 min-w-0 relative z-10">
                                    <h3 className="text-base sm:text-lg md:text-xl font-black text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-2 flex-wrap">
                                        {movie.genres?.slice(0, 3).join(' • ')}
                                        {movie.duration && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                                                </span>
                                            </>
                                        )}
                                    </p>

                                    {/* Showtime Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {movie.shows.map((show) => (
                                            <button
                                                key={show.showId}
                                                onClick={() => {
                                                    if (!user) {
                                                        toast.error("Please login to book tickets");
                                                        navigate("/sign-in");
                                                        return;
                                                    }
                                                    navigate(`/movies/${movie._id}/${show.showId}`);
                                                }}
                                                className="group/btn relative flex flex-col items-center px-3 py-2 rounded-xl border border-white/15 hover:border-primary/60 bg-white/[0.03] hover:bg-primary/10 transition-all duration-200 min-w-[70px] overflow-hidden"
                                            >
                                                {/* Available dot */}
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />

                                                <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap group-hover/btn:text-primary transition-colors">
                                                    {formatTime(show.time)}
                                                </span>
                                                <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5 font-bold whitespace-nowrap">
                                                    {show.format || '4K DOLBY'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* M-Ticket / Food Labels */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-1">
                                            <Ticket className="w-3 h-3" />
                                            M-Ticket Available
                                        </span>
                                        <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-1">
                                            <Coffee className="w-3 h-3" />
                                            Food &amp; Beverage
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheaterMovies;
