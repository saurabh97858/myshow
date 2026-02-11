import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const ReviewList = ({ movieId, onUserReviewDelete }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recent');
    const { axios, getToken } = useAppContext();
    const { userId } = useAuth();

    React.useEffect(() => {
        fetchReviews();
    }, [movieId, sortBy]);

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`/api/reviews/${movieId}?sort=${sortBy}`);
            if (data.success) {
                setReviews(data.reviews);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (reviewId, vote) => {
        if (!userId) {
            toast.error('Please login to vote');
            return;
        }

        try {
            const { data } = await axios.patch(`/api/reviews/${reviewId}/vote`, {
                vote
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                // Update local state
                setReviews(reviews.map(r =>
                    r._id === reviewId ? data.review : r
                ));
            }
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Failed to vote');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete your review?')) return;

        try {
            const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success('Review deleted');
                setReviews(reviews.filter(r => r._id !== reviewId));
                if (onUserReviewDelete) onUserReviewDelete();
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete review');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && stats.totalReviews > 0 && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">
                                {stats.avgRating.toFixed(1)}
                            </div>
                            <div className="flex gap-0.5 mt-1">
                                {[...Array(10)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < Math.round(stats.avgRating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1 space-y-1">
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-6 text-gray-400">{star}★</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{
                                                width: `${((stats.distribution[star] || 0) / stats.totalReviews) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="w-8 text-gray-500 text-right">
                                        {stats.distribution[star] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Options */}
            {reviews.length > 0 && (
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Reviews ({reviews.length})</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="rating-high">Highest Rating</option>
                        <option value="rating-low">Lowest Rating</option>
                    </select>
                </div>
            )}

            {/* Reviews */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-5 hover:border-white/20 transition-colors"
                        >
                            <div className="flex gap-4">
                                {/* User Avatar */}
                                <img
                                    src={review.userImage || 'https://via.placeholder.com/40'}
                                    alt={review.userName}
                                    className="w-10 h-10 rounded-full ring-2 ring-white/10"
                                />

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex gap-0.5">
                                                    {[...Array(10)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-600'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-yellow-400">
                                                    {review.rating}/10
                                                </span>
                                                <span className="text-xs text-gray-500">·</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delete button for own review */}
                                        {userId === review.user && (
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                                title="Delete review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Review Text */}
                                    {review.review && (
                                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                                            {review.review}
                                        </p>
                                    )}

                                    {/* Helpful/Not Helpful */}
                                    <div className="flex items-center gap-4 text-xs">
                                        <button
                                            onClick={() => handleVote(review._id, 'helpful')}
                                            disabled={!userId || userId === review.user}
                                            className={`flex items-center gap-1 transition-colors ${review.helpfulUsers?.includes(userId)
                                                    ? 'text-green-500'
                                                    : 'text-gray-500 hover:text-green-500'
                                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            <span>Helpful ({review.helpful})</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(review._id, 'not-helpful')}
                                            disabled={!userId || userId === review.user}
                                            className={`flex items-center gap-1 transition-colors ${review.notHelpfulUsers?.includes(userId)
                                                    ? 'text-red-500'
                                                    : 'text-gray-500 hover:text-red-500'
                                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                            <span>Not Helpful ({review.notHelpful})</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewList;
