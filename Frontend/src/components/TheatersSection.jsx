import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

const TheatersSection = () => {
    const { userLocation, axios } = useAppContext();
    const [theaters, setTheaters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (userLocation.city) {
            fetchTheaters();
        }
    }, [userLocation.city]);

    const fetchTheaters = async () => {
        try {
            const { data } = await axios.get(`/api/theater/city/${userLocation.city}`);
            if (data.success) {
                setTheaters(data.theaters);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!theaters || theaters.length === 0) return null;

    return (
        <div className="py-12 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#09090B] to-black">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Theaters in {userLocation.city}</h2>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">Experience the best cinema near you</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-xs animate-pulse hidden md:block">Scroll for more &rarr;</span>
                    <Link to="/theaters" className="text-primary hover:text-white transition-colors text-sm font-semibold flex items-center gap-1">
                        See All
                    </Link>
                </div>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x snap-mandatory">
                {theaters.map((theater) => (
                    <div
                        key={theater._id}
                        onClick={() => navigate('/movies')}
                        className="min-w-[280px] md:min-w-[320px] bg-[#121212] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 snap-start flex-shrink-0"
                    >
                        <div className="h-32 relative overflow-hidden">
                            <img
                                src={theater.image}
                                alt={theater.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-semibold text-white">4.5</span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#121212] to-transparent"></div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-white font-bold text-xl mb-2 line-clamp-1">{theater.name}</h3>
                            <div className="flex items-start gap-2 text-gray-400 text-sm mb-4">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                                <p className="line-clamp-2 leading-relaxed">{theater.location}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {theater.facilities.slice(0, 3).map((fac, idx) => (
                                    <span key={idx} className="text-[10px] uppercase font-bold tracking-wider bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                                        {fac}
                                    </span>
                                ))}
                                {theater.facilities.length > 3 && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                                        +{theater.facilities.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default TheatersSection;
