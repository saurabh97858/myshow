import React, { useState } from "react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { CalendarIcon, ClockIcon, IndianRupeeIcon, LanguagesIcon, StarIcon } from "lucide-react";

const AddMovie = () => {
    const { axios, getToken, fetchMovies } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        posterUrl: "",
        backdropUrl: "",
        duration: "",
        language: "Hindi",
        genres: "",
        ticketPrice: "",
        rating: "",
        casts: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.posterUrl || !formData.duration || !formData.ticketPrice) {
            return toast.error("Please fill all required fields");
        }

        try {
            setLoading(true);
            const token = await getToken();

            // Prepare data - Default Release Date to Today for immediate availability
            const movieData = {
                title: formData.title,
                description: formData.description,
                posterUrl: formData.posterUrl,
                backdropUrl: formData.backdropUrl || formData.posterUrl,
                duration: Number(formData.duration),
                language: formData.language,
                genres: formData.genres ? formData.genres.split(",").map(g => g.trim()) : [],
                releaseDate: new Date().toISOString().split('T')[0], // Default to Today
                ticketPrice: Number(formData.ticketPrice),
                rating: formData.rating ? Number(formData.rating) : 0,
                casts: formData.casts ? formData.casts.split(",").map(c => c.trim()) : []
            };

            const { data } = await axios.post("/api/movie/add", movieData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);

                // Refresh movies list globally
                await fetchMovies();

                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    posterUrl: "",
                    backdropUrl: "",
                    duration: "",
                    language: "Hindi",
                    genres: "",
                    ticketPrice: "",
                    rating: "",
                    casts: ""
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add movie");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDummyMovies = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            const { data } = await axios.post("/api/movie/add-dummy", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add dummy movies");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Title text1="Add" text2="Movie" />

            {/* Quick Action */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300 mb-2">
                    Quick start: Add sample movies to get started
                </p>
                <button
                    onClick={handleAddDummyMovies}
                    disabled={loading}
                    className="bg-primary/80 text-white px-4 py-2 text-sm rounded hover:bg-primary transition-all disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Dummy Movies"}
                </button>
            </div>

            {/* Add Movie Form */}
            <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Movie Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter movie title"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter movie description"
                        rows="4"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all resize-none"
                        required
                    />
                </div>

                {/* Poster URL */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Poster Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        name="posterUrl"
                        value={formData.posterUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/poster.jpg"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Use Unsplash or any image URL</p>
                </div>

                {/* Backdrop URL */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Backdrop Image URL (Optional)
                    </label>
                    <input
                        type="url"
                        name="backdropUrl"
                        value={formData.backdropUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/backdrop.jpg"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Duration and Rating Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <ClockIcon className="inline w-4 h-4 mr-1" />
                            Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="150"
                            min="1"
                            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <StarIcon className="inline w-4 h-4 mr-1" />
                            Rating (0-10)
                        </label>
                        <input
                            type="number"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            placeholder="7.5"
                            min="0"
                            max="10"
                            step="0.1"
                            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Language (Full Width) */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        <LanguagesIcon className="inline w-4 h-4 mr-1" />
                        Language
                    </label>
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                    >
                        <option value="Hindi" className="bg-gray-900">Hindi</option>
                        <option value="English" className="bg-gray-900">English</option>
                        <option value="Tamil" className="bg-gray-900">Tamil</option>
                        <option value="Telugu" className="bg-gray-900">Telugu</option>
                        <option value="Malayalam" className="bg-gray-900">Malayalam</option>
                        <option value="Kannada" className="bg-gray-900">Kannada</option>
                    </select>
                </div>

                {/* Ticket Price */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        <IndianRupeeIcon className="inline w-4 h-4 mr-1" />
                        Ticket Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        placeholder="250"
                        min="1"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                        required
                    />
                </div>

                {/* Genres */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Genres (comma separated)
                    </label>
                    <input
                        type="text"
                        name="genres"
                        value={formData.genres}
                        onChange={handleChange}
                        placeholder="Action, Thriller, Drama"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Casts */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Cast (comma separated)
                    </label>
                    <input
                        type="text"
                        name="casts"
                        value={formData.casts}
                        onChange={handleChange}
                        placeholder="Actor 1, Actor 2, Actor 3"
                        className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-2 outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 font-medium"
                >
                    {loading ? "Adding Movie..." : "Add Movie"}
                </button>
            </form>
        </>
    );
};

export default AddMovie;
