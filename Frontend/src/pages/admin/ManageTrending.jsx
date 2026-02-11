import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { Star, Flame } from 'lucide-react';

const ManageTrending = () => {
    const { movies, fetchMovies, getToken, axios } = useAppContext();
    const [loading, setLoading] = useState({});

    // Toggle trending status
    const toggleTrending = async (movie) => {
        const newStatus = !movie.isTrending;
        setLoading(prev => ({ ...prev, [movie._id]: true }));

        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/movie/update/${movie._id}`,
                { isTrending: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(`${movie.title} is ${newStatus ? 'now trending' : 'no longer trending'}`);
                fetchMovies(); // Refresh list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setLoading(prev => ({ ...prev, [movie._id]: false }));
        }
    };

    return (
        <div className="text-white w-full">
            <div className="flex items-center gap-3 mb-8">
                <Flame className="w-8 h-8 text-orange-500" />
                <h1 className="text-3xl font-bold">Manage Trending Movies</h1>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#121212] text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 border-b border-white/10">Poster</th>
                            <th className="p-4 border-b border-white/10">Title</th>
                            <th className="p-4 border-b border-white/10">Rating</th>
                            <th className="p-4 border-b border-white/10 text-center">Trending Status</th>
                            <th className="p-4 border-b border-white/10 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {movies.map((movie) => (
                            <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <img src={movie.posterUrl} alt={movie.title} className="h-16 w-12 object-cover rounded" />
                                </td>
                                <td className="p-4 font-medium text-white">{movie.title}</td>
                                <td className="p-4 text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        {movie.rating}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {movie.isTrending ? (
                                        <span className="inline-block px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full border border-green-500/20 font-bold">
                                            Trending
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-1 bg-gray-500/10 text-gray-500 text-xs rounded-full border border-gray-500/20">
                                            Normal
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => toggleTrending(movie)}
                                        disabled={loading[movie._id]}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${movie.isTrending
                                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                                : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                                            } ${loading[movie._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading[movie._id] ? 'Updating...' : movie.isTrending ? 'Remove from Trending' : 'Add to Trending'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageTrending;
