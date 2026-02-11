import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Upload, CheckCircle, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
    const { axios } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        attachment: null
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, attachment: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('message', formData.message);
        if (formData.attachment) {
            data.append('attachment', formData.attachment);
        }

        try {
            const response = await axios.post('/api/support/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: 'Your ticket has been submitted successfully! We will contact you soon.' });
                setFormData({ name: '', email: '', phone: '', message: '', attachment: null });
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-12 px-4 md:px-6 pb-4 flex items-center justify-center font-sans">
            <div className="max-w-lg w-full mx-auto">
                <div className="text-center mb-3 relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute left-0 top-1 text-gray-400 hover:text-white transition-colors"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-0.5">
                        Help Center
                    </h1>
                    <p className="text-[10px] text-gray-400">
                        Fill out the form below for support.
                    </p>
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-lg p-4 md:p-5 shadow-lg">
                    {status.message && (
                        <div className={`mb-3 p-1.5 rounded flex items-center gap-1.5 text-[10px] ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {status.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <p>{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-primary transition-colors h-7"
                                    placeholder="Name"
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-primary transition-colors h-7"
                                    placeholder="Email"
                                />
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-primary transition-colors h-7"
                                placeholder="Phone"
                            />
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Issue</label>
                            <textarea
                                name="message"
                                required
                                rows="2"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="Describe..."
                            ></textarea>
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Attachment</label>
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="w-full flex items-center justify-center gap-1.5 bg-black/50 border border-dashed border-white/20 rounded px-2 py-2 cursor-pointer hover:bg-white/5 transition-colors group h-8"
                                >
                                    <Upload className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors" />
                                    <p className="text-[10px] font-medium text-gray-400 truncate max-w-[150px]">
                                        {formData.attachment ? formData.attachment.name : "Upload File"}
                                    </p>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dull text-white font-bold py-2 rounded transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider h-8 mt-1"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Submit Request</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
