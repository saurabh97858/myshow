import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Star, MessageSquare, Send, User, Quote, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Experiences = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        rating: '',
        comment: ''
    });

    const suggestions = ['Excellent', 'Great', 'Good', 'Average', 'Poor'];

    const fetchExperiences = async () => {
        try {
            const { data } = await axios.get('/api/experience/all');
            if (data.success) {
                setExperiences(data.experiences);
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
            // Fallback dummy data if backend fails or is empty initialy
            if (experiences.length === 0) {
                setExperiences([
                    { _id: '1', name: 'John Doe', rating: 'Excellent', comment: 'Absolutely loved the experience! Booking was seamless.', createdAt: new Date() },
                    { _id: '2', name: 'Jane Smith', rating: 'Great', comment: 'Great service and comfortable seats. Highly recommend.', createdAt: new Date() },
                    { _id: '3', name: 'Mike Ross', rating: 'Good', comment: 'Good movie selection, but popcorn could be better.', createdAt: new Date() }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingSelect = (rating) => {
        setFormData({ ...formData, rating });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.rating) {
            toast.error("Please select a rating!");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/experience/create', formData);
            if (data.success) {
                toast.success('Experience shared successfully!');
                setFormData({ name: '', rating: '', comment: '' });
                fetchExperiences(); // Refresh list
                // Scroll to top to see new review? Or maybe just append it.
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to share experience.');
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 'Excellent': return 'text-yellow-400';
            case 'Great': return 'text-green-400';
            case 'Good': return 'text-blue-400';
            case 'Average': return 'text-orange-400';
            case 'Poor': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute left-0 top-1 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
                        User Experiences
                    </h1>
                    <p className="text-gray-400">See what others are saying and share your own story.</p>
                </div>

                {/* Experiences List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {loading ? (
                        <div className="col-span-full text-center py-10">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : experiences.length > 0 ? (
                        experiences.map((exp) => (
                            <div key={exp._id} className="bg-[#121212] border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all hover:-translate-y-1 relative overflow-hidden group">
                                <Quote className="absolute top-4 right-4 w-10 h-10 text-white/5 rotate-180 group-hover:text-white/10 transition-colors" />
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                        {exp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{exp.name}</h3>
                                        <p className={`text-xs font-medium uppercase tracking-wider ${getRatingColor(exp.rating)}`}>{exp.rating}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed relative z-10">"{exp.comment}"</p>
                                <p className="text-[10px] text-gray-500 mt-4 text-right">
                                    {new Date(exp.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-10">No experiences yet. Be the first to share!</div>
                    )}
                </div>

                {/* Add Your Experience Form - Compact Version */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 md:p-5 max-w-md mx-auto shadow-xl relative mt-8">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    <h2 className="text-lg font-bold mb-3 text-center flex items-center justify-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Share Your Experience
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2 w-3 h-3 text-gray-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="w-full bg-black/50 border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-colors hover:bg-white/5 h-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">How was it?</label>
                                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleRatingSelect(s)}
                                            className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-all ${formData.rating === s ? 'bg-primary text-white border-primary' : 'bg-black/50 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Your Review</label>
                            <textarea
                                name="comment"
                                required
                                rows="2"
                                value={formData.comment}
                                onChange={handleChange}
                                placeholder="Tell us about your experience..."
                                className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none hover:bg-white/5"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dull hover:to-purple-700 text-white font-bold py-2 rounded-md transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 text-xs h-8"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Submit Experience</span>
                                    <Send className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Experiences;
