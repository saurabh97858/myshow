import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AddTheater = () => {
    const { getToken, image_base_url } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        state: '',
        location: '',
        image: '',
        facilities: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getToken();
            const facilitiesArray = formData.facilities.split(',').map(f => f.trim()).filter(f => f);

            const { data } = await axios.post('/api/theater/add',
                { ...formData, facilities: facilitiesArray },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Theater added successfully');
                setFormData({
                    name: '',
                    city: '',
                    state: '',
                    location: '',
                    image: '',
                    facilities: ''
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to add theater');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-white w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Add New Theater</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#1a1a1a] p-8 rounded-xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Theater Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. PVR Cinemas"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Location (Address)</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Phoenix Mall, Lower Parel"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Mumbai"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Maharashtra"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 mb-2 text-sm">Image URL</label>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://example.com/theater-image.jpg"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2 text-sm">Facilities (Comma separated)</label>
                    <input
                        type="text"
                        name="facilities"
                        value={formData.facilities}
                        onChange={handleChange}
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Dolby Atmos, Recliner Seats, Food Court"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Adding...' : 'Add Theater'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTheater;
