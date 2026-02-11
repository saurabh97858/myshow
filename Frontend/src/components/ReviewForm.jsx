import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const ReviewForm = ({ movieId, existingReview, onSuccess }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState(existingReview?.review || '');
    const [submitting, setSubmitting] = useState(false);
    const { axios, getToken } = useAppContext();
    const { userId } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating) {
            toast.error('Please select a rating');
            return;
        }

        if (!userId) {
            toast.error('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/reviews/create', {
                movieId,
                rating,
                review: review.trim()
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = () => (
        <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`w-6 h-6 ${star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm font-medium">
                {rating > 0 && `${rating}/10`}
            </span>
        </div>
    );

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Your Rating <span className="text-red-500">*</span>
                    </label>
                    <StarRating />
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Your Review <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this movie..."
                        maxLength={1000}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {review.length}/1000 characters
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || !rating}
                    className="w-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dull hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg py-3 font-semibold transition-all disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
