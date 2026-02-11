import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, Clock, Calendar, ChevronLeft } from 'lucide-react';
import Loading from '../components/Loading';

const TheaterMovies = () => {
    const { theaterId } = useParams();
    const { axios } = useAppContext();
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

    if (loading) return <Loading />;
    if (!theater) return <div className="text-white text-center py-20">Theater not found</div>;

    return (
        <div className="min-h-screen bg-[#09090B] pt-14 sm:pt-16 px-3 sm:px-4 md:px-10 lg:px-20 pb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-2 flex items-center gap-1 text-[10px] sm:text-[11px]">
                <ChevronLeft className="w-3 h-3" /> Back
            </button>

            {/* Theater Header - MOBILE OPTIMIZED */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-2 sm:p-2.5 mb-2.5 sm:mb-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white mb-0.5">{theater.name}</h1>
                <div className="flex items-center gap-0.5 text-gray-400 mb-1 sm:mb-1.5 text-[10px] sm:text-[11px]">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <p className="truncate">{theater.location}</p>
                </div>
                <div className="flex gap-0.5 sm:gap-1 flex-wrap">
                    {theater.facilities.map((fac, idx) => (
                        <span key={idx} className="text-[7px] sm:text-[8px] uppercase font-bold bg-white/5 px-1 sm:px-1.5 py-0.5 rounded text-primary border border-primary/20">
                            {fac}
                        </span>
                    ))}
                </div>
            </div>

            {/* Movies List - MOBILE OPTIMIZED */}
            <div className="space-y-2">
                <h2 className="text-xs sm:text-sm font-bold text-white mb-1.5">Now Showing</h2>
                {movies.length === 0 ? (
                    <p className="text-gray-400 text-[9px] sm:text-[10px]">No shows available currently.</p>
                ) : (
                    movies.map((movie) => (
                        <div key={movie._id} className="bg-[#121212] border border-white/10 rounded-lg p-2 sm:p-2.5 flex gap-2 sm:gap-2.5 hover:bg-white/5 transition-colors group">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-12 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded object-cover shadow-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[11px] sm:text-xs font-bold text-white mb-0.5 group-hover:text-primary transition-colors truncate">{movie.title}</h3>
                                <p className="text-[8px] sm:text-[9px] text-gray-400 mb-1 sm:mb-1.5 truncate">{movie.language} • {movie.genres.join(", ")} • {movie.duration}m</p>

                                <div className="flex flex-wrap gap-0.5 sm:gap-1">
                                    {movie.shows.map((show) => (
                                        <button
                                            key={show.showId}
                                            onClick={() => navigate(`/movies/${movie._id}/${show.showId}`)}
                                            className="px-1.5 sm:px-2 py-0.5 rounded border border-white/20 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-center bg-[#09090B] min-w-[45px] sm:min-w-[50px]"
                                        >
                                            <span className="text-green-400 font-bold text-[9px] sm:text-[10px] whitespace-nowrap">{formatTime(show.time)}</span>
                                            <span className="text-[6px] sm:text-[7px] text-gray-500 uppercase whitespace-nowrap">₹{show.price.standard}-{show.price.vip}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TheaterMovies;
