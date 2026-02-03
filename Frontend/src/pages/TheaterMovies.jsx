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
        <div className="min-h-screen bg-[#09090B] pt-24 px-4 md:px-16 lg:px-36 pb-12">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
            </button>

            {/* Theater Header */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{theater.name}</h1>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <p>{theater.location}</p>
                </div>
                <div className="flex gap-2">
                    {theater.facilities.map((fac, idx) => (
                        <span key={idx} className="text-xs uppercase font-bold bg-white/5 px-2 py-1 rounded text-primary border border-primary/20">
                            {fac}
                        </span>
                    ))}
                </div>
            </div>

            {/* Movies List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Now Showing</h2>
                {movies.length === 0 ? (
                    <p className="text-gray-400">No shows available currently.</p>
                ) : (
                    movies.map((movie) => (
                        <div key={movie._id} className="bg-[#121212] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors group">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-24 md:w-32 rounded-lg object-cover shadow-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">{movie.language} • {movie.genres.join(", ")} • {movie.duration}m</p>

                                <div className="flex flex-wrap gap-3">
                                    {movie.shows.map((show) => (
                                        <button
                                            key={show.showId}
                                            onClick={() => navigate(`/movies/${movie._id}/${show.showId}`)}
                                            className="px-4 py-2 rounded-lg border border-white/20 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-center bg-[#09090B]"
                                        >
                                            <span className="text-green-400 font-bold text-sm">{formatTime(show.time)}</span>
                                            <span className="text-[10px] text-gray-500 uppercase mt-0.5">₹{show.price.standard}-{show.price.vip}</span>
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
