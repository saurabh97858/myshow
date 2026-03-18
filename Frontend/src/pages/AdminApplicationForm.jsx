import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Building2, Mail, Phone, MapPin, Map, FileText, CheckCircle, Clock, XCircle, ChevronLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminApplicationForm = () => {
    const { user, axios, adminApplicationStatus, fetchAdminApplicationStatus } = useAppContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        contactNumber: '',
        address: '',
        city: '',
        state: '',
        registrationNumber: '',
        theaterName: '',
        theaterAddress: '',
        additionalInfo: ''
    });

    useEffect(() => {
        // Fetch status initially
        fetchAdminApplicationStatus();
    }, []);

    // Sync user data once loaded
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.fullName || '',
                email: prev.email || user.primaryEmailAddress?.emailAddress || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submission started. Current Data:", formData);
        
        // Manual validation
        const requiredFields = [
            'name', 'email', 'contactNumber', 'registrationNumber', 
            'address', 'theaterName', 'theaterAddress', 'city', 'state'
        ];
        
        for (const field of requiredFields) {
            if (!formData[field]) {
                const formattedName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                console.warn(`Validation failed: ${formattedName} is missing.`);
                toast.error(`Please fill out the ${formattedName} field.`);
                return;
            }
        }
        
        console.log("Validation passed. Sending request to backend...");
        setLoading(true);

        try {
            const { data } = await axios.post('/api/admin-application/submit', formData);
            console.log("Backend response received:", data);

            if (data.success) {
                toast.success('Application submitted successfully!');
                fetchAdminApplicationStatus(); // Refresh status
            } else {
                console.error("Submission failed with success: false", data);
                toast.error(data.message || 'Server returned an error without a message');
            }
        } catch (error) {
            console.error('Submit error:', error);
            const errorMessage = typeof error.response?.data === 'string' ? error.response.data : (error.response?.data?.message || error.message || 'Failed to submit application');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Render Status View if application exists
    if (adminApplicationStatus) {
        console.log("Rendering status view. Status:", adminApplicationStatus);
        return (
            <div className="min-h-screen bg-[#09090B] pt-24 pb-12 px-6 flex items-center justify-center">
                <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl text-center">
                    
                    {adminApplicationStatus === 'pending' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <Clock className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Application Pending</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Your application to become a theater admin is currently under review by our super admins. We will notify you once a decision is made.
                            </p>
                        </>
                    )}

                    {adminApplicationStatus === 'approved' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Application Approved!</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Congratulations! Your application has been approved. Please check your email for the <span className="text-emerald-500 font-bold">Admin Login Credentials</span> assigned by the Super Admin.
                            </p>
                            <button
                                onClick={() => navigate('/admin-login')}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-5 h-5" /> Go to Admin Login
                            </button>
                        </>
                    )}

                    {adminApplicationStatus === 'rejected' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                <XCircle className="w-10 h-10 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Application Not Approved</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Unfortunately, your application was not approved at this time.
                            </p>
                        </>
                    )}

                    {adminApplicationStatus !== 'approved' && (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 justify-center w-full"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Home
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Render Form View
    return (
        <div className="min-h-screen bg-[#09090B] pt-16 pb-8 px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute -top-[200px] right-[-100px] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">Partner With Us</h1>
                    <p className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto">
                        Become a theater admin to manage your screens, list movies, and sell tickets directly to users.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl backdrop-blur-xl p-5 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Section 1: Personal Info */}
                        <div>
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-1.5">
                                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">1</span>
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Building2 className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Contact Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Registration Code</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="registrationNumber"
                                            value={formData.registrationNumber}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="GSTIN / LLC No."
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Home/Office Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-y min-h-[44px]"
                                        placeholder="Full residential or office address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Theater Details */}
                        <div>
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-1.5 mt-4">
                                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">2</span>
                                Theater Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Theater Name</label>
                                    <input
                                        type="text"
                                        name="theaterName"
                                        value={formData.theaterName}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="e.g. Orion Cinemas"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Theater Address</label>
                                    <input
                                        type="text"
                                        name="theaterAddress"
                                        value={formData.theaterAddress}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors block"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">City</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">State</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Map className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Additional Info</label>
                                    <textarea
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleChange}
                                        rows={1}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors min-h-[38px] resize-y"
                                        placeholder="Number of screens, capacity, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 border-t border-white/5 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-rose-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationForm;
