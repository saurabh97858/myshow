import React, { useEffect, useState } from 'react';
import { MapPin, X, ChevronDown, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LocationSelector = () => {
    const { userLocation, setUserLocation, axios } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    const defaultCities = [
        { city: "New York", state: "New York" },
        { city: "Los Angeles", state: "California" },
        { city: "Chicago", state: "Illinois" },
        { city: "Houston", state: "Texas" },
        { city: "Phoenix", state: "Arizona" },
        { city: "Philadelphia", state: "Pennsylvania" },
        { city: "San Antonio", state: "Texas" },
        { city: "San Diego", state: "California" },
        { city: "Dallas", state: "Texas" },
        { city: "San Jose", state: "California" },
        { city: "Austin", state: "Texas" },
        { city: "Jacksonville", state: "Florida" },
        { city: "San Francisco", state: "California" },
        { city: "Seattle", state: "Washington" },
        { city: "Denver", state: "Colorado" },
        { city: "Washington", state: "District of Columbia" },
        { city: "Boston", state: "Massachusetts" },
        { city: "Las Vegas", state: "Nevada" },
        { city: "Miami", state: "Florida" },
        { city: "Atlanta", state: "Georgia" }
    ];

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/theater/locations');
            console.log("📍 Locations Fetched:", data);

            if (data.success && data.locations.length > 0) {
                setLocations(data.locations);
            } else {
                console.warn("No locations found from API, using defaults.");
                setLocations(defaultCities);
            }
        } catch (error) {
            console.error("Failed to fetch locations", error);
            console.warn("API Error, using default cities.");
            setLocations(defaultCities);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (city, state) => {
        setUserLocation({ city, state });
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition group text-sm md:text-base"
            >
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/20 transition-all">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium truncate max-w-[100px]">{userLocation.city}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Modal */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute top-12 left-0 z-50 w-64 md:w-80 bg-[#121212] border border-white/10 rounded-xl shadow-2xl p-4 animate-fade-in-up origin-top-left">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                            <h3 className="text-white font-bold text-lg">Select City</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                {locations.map((loc) => (
                                    <button
                                        key={loc.city}
                                        onClick={() => handleSelect(loc.city, loc.state)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all
                                            ${userLocation.city === loc.city
                                                ? 'bg-primary/20 text-primary border border-primary/20'
                                                : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{loc.city}</span>
                                            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition">{loc.state}</span>
                                        </div>
                                        {userLocation.city === loc.city && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default LocationSelector;
