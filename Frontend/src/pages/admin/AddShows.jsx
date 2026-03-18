import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Calendar, Clock, Film, MapPin, DollarSign } from 'lucide-react';

const AddShows = () => {
    const { getToken, axios } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);

    const [formData, setFormData] = useState({
        movieId: '',
        theaterId: '',
        priceStandard: 150,
        pricePremium: 250,
        priceVIP: 400,
    });

    const [showsInput, setShowsInput] = useState([
        { date: '', time: '' }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Get all movies
            const { data: moviesData } = await axios.get('/api/movie/all');
            if (moviesData.success) {
                setMovies(moviesData.movies);
            }

            // Get admin's theaters
            const { data: theatersData } = await axios.get('/api/theater/my-theaters', config);
            if (theatersData.success) {
                setTheaters(theatersData.theaters);
            }
        } catch (error) {
            console.error('Error fetching data for shows:', error);
            toast.error('Failed to load movies or theaters');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleShowInputChange = (index, field, value) => {
        const newShowsInput = [...showsInput];
        newShowsInput[index][field] = value;
        setShowsInput(newShowsInput);
    };

    const addShowTime = () => {
        setShowsInput([...showsInput, { date: '', time: '' }]);
    };

    const removeShowTime = (index) => {
        const newShowsInput = showsInput.filter((_, i) => i !== index);
        setShowsInput(newShowsInput);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.movieId || !formData.theaterId) {
            return toast.error('Please select both a movie and a theater.');
        }

        // Validate show inputs
        const isValid = showsInput.every(s => s.date && s.time);
        if (!isValid || showsInput.length === 0) {
            return toast.error('Please provide valid date and time for all shows.');
        }

        setLoading(true);

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/show/add',
                {
                    ...formData,
                    showsInput
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Shows added successfully!');
                // Reset form but keep selected movie/theater and prices
                setShowsInput([{ date: '', time: '' }]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add shows');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="text-white w-full max-w-4xl mx-auto pb-10">
            <h1 className="text-3xl font-bold mb-8">Schedule Shows</h1>

            <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-xl border border-white/5 shadow-2xl">
                
                {theaters.length === 0 ? (
                    <div className="text-center py-10">
                        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Theaters Found</h3>
                        <p className="text-gray-400 mb-6">You must add a theater first before scheduling shows.</p>
                        <a href="/admin/add-theater" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium inline-block hover:bg-primary-dark transition">
                            Add New Theater
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Core Selections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
                                    <Film className="w-4 h-4" /> Select Movie
                                </label>
                                <select
                                    name="movieId"
                                    value={formData.movieId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="" disabled>-- Select a Movie --</option>
                                    {movies.map(movie => (
                                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Select Theater
                                </label>
                                <select
                                    name="theaterId"
                                    value={formData.theaterId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="" disabled>-- Select Your Theater --</option>
                                    {theaters.map(theater => (
                                        <option key={theater._id} value={theater._id}>{theater.name} - {theater.city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pricing Configuration */}
                        <div className="bg-[#121212] p-5 rounded-lg border border-white/5">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" /> Ticket Pricing (₹)
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-500 mb-1 text-xs">Standard</label>
                                    <input
                                        type="number"
                                        name="priceStandard"
                                        value={formData.priceStandard}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1 text-xs">Premium</label>
                                    <input
                                        type="number"
                                        name="pricePremium"
                                        value={formData.pricePremium}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1 text-xs">VIP</label>
                                    <input
                                        type="number"
                                        name="priceVIP"
                                        value={formData.priceVIP}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Show Timings */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" /> Timings
                                </h3>
                                <button
                                    type="button"
                                    onClick={addShowTime}
                                    className="text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Slot
                                </button>
                            </div>

                            <div className="space-y-3">
                                {showsInput.map((show, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-[#121212] p-4 rounded-lg border border-white/5 relative group">
                                        <div className="flex-1 w-full">
                                            <label className="block text-gray-500 mb-1 text-xs">Date</label>
                                            <input
                                                type="date"
                                                min={today}
                                                required
                                                value={show.date}
                                                onChange={(e) => handleShowInputChange(index, 'date', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary transition text-sm appearance-none"
                                            />
                                        </div>
                                        <div className="flex-1 w-full relative">
                                            <label className="block text-gray-500 mb-1 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Time
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={show.time}
                                                onChange={(e) => handleShowInputChange(index, 'time', e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary transition text-sm appearance-none"
                                            />
                                        </div>
                                        {showsInput.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeShowTime(index)}
                                                className="md:absolute right-4 top-1/2 md:-translate-y-1/2 p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors mt-2 md:mt-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={loading || showsInput.length === 0}
                                className="w-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dull hover:to-rose-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                {loading ? 'Scheduling...' : 'Schedule Shows'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddShows;
