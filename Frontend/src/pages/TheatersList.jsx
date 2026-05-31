import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation, Video, Calendar, Star, Compass, Clock, ShieldCheck, ArrowRight, Heart } from 'lucide-react';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';

const TheatersList = () => {
    const { userLocation, axios, user } = useAppContext();
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
        <div className="min-h-screen bg-[#09090B] pt-24 px-4 md:px-16 lg:px-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-primary/10 to-[#09090B] pointer-events-none"></div>
            <BlurCircle position="top-right" color="bg-primary/20" />
            <BlurCircle position="bottom-left" color="bg-purple-600/10" />

            <div className="relative z-10">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Cinematic Venues</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-outfit font-black text-white leading-none">
                            Theaters in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-purple-600">{userLocation.city}</span>
                        </h1>
                        <p className="text-gray-400 mt-3 text-sm md:text-base max-w-xl">
                            Experience movies like never before with high-fidelity visuals, Dolby Atmos acoustics, and luxury recliners near you.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <Loading />
                ) : theaters.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/8 rounded-3xl backdrop-blur-xl">
                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white font-outfit">No Theaters Found</h2>
                        <p className="text-gray-400 mt-2">We couldn't find any theaters in {userLocation.city} currently.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {theaters.map((theater) => (
                            <div
                                key={theater._id}
                                onClick={() => {
                                    if (!user) {
                                        toast.error("Please login to proceed with booking");
                                        navigate("/sign-in");
                                        return;
                                    }
                                    navigate(`/theater/${theater._id}`);
                                }}
                                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/8 hover:border-white/15 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 cursor-pointer relative overflow-hidden flex flex-col justify-between"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/15 transition-all"></div>
                                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-500 rounded-b-3xl"></div>

                                <div>
                                    {/* Card Top */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300 shadow-md">
                                            <Video className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-xl">
                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                            <span className="text-yellow-400 font-black text-xs leading-none">4.5</span>
                                        </div>
                                    </div>

                                    {/* Title and location */}
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors font-outfit line-clamp-1 leading-snug">
                                        {theater.name}
                                    </h3>

                                    <div className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm mb-6 min-h-[40px] leading-relaxed">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                                        <p className="line-clamp-2">{theater.location}</p>
                                    </div>

                                    {/* Facility tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {theater.facilities.slice(0, 3).map((fac, idx) => (
                                            <span key={idx} className="text-[9px] uppercase font-black tracking-wider bg-white/5 px-2.5 py-1 rounded-full text-gray-300 border border-white/5">
                                                {fac}
                                            </span>
                                        ))}
                                        {theater.facilities.length > 3 && (
                                            <span className="text-[9px] uppercase font-black tracking-wider bg-white/5 px-2.5 py-1 rounded-full text-gray-400 border border-white/5">
                                                +{theater.facilities.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Call to action */}
                                <button className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-rose-600 group-hover:text-white transition-all transform duration-300 shadow-md active:scale-95">
                                    <Calendar className="w-3.5 h-3.5" />
                                    View Shows
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
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
