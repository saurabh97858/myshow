import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation, Video, Calendar, Star } from 'lucide-react';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import BlurCircle from '../components/BlurCircle';

const TheatersList = () => {
    const { userLocation, axios } = useAppContext();
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTheaters();
    }, [userLocation.city]);

    const fetchTheaters = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/theater/city/${userLocation.city}`);
            if (data.success) {
                setTheaters(data.theaters);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] pt-24 px-4 md:px-16 lg:px-36 pb-12 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/10 to-[#09090B] pointer-events-none"></div>
            <BlurCircle position="top-right" color="bg-primary/20" />

            <div className="relative z-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-outfit font-bold text-white mb-2">
                            Theaters in <span className="text-primary">{userLocation.city}</span>
                        </h1>
                        <p className="text-gray-400">Experience the best cinema at these locations</p>
                    </div>
                    {/* Filter or Search could go here */}
                </div>

                {loading ? (
                    <Loading />
                ) : theaters.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">No Theaters Found</h2>
                        <p className="text-gray-400 mt-2">We couldn't find any theaters in {userLocation.city}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {theaters.map((theater) => (
                            <div
                                key={theater._id}
                                className="group bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-primary/50 hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--color-primary),0.1)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                            >
                                {/* Decorative circle */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                                        <Video className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex gap-2">
                                        {theater.facilities.slice(0, 2).map((fac, idx) => (
                                            <span key={idx} className="text-[10px] uppercase font-bold bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                                                {fac}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{theater.name}</h3>

                                <div className="flex items-start gap-2 text-gray-400 text-sm mb-6 min-h-[40px]">
                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p className="line-clamp-2">{theater.location}</p>
                                </div>

                                <button
                                    onClick={() => navigate(`/theater/${theater._id}`)}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all transform active:scale-95">
                                    <Calendar className="w-4 h-4" />
                                    View Shows
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheatersList;
