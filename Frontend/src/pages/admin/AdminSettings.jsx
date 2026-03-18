import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const { axios, adminToken, adminLogout } = useAppContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };
            const { data } = await axios.put('/api/admin/auth/change-password', 
                { currentPassword, newPassword },
                config
            );

            if (data.success) {
                toast.success("Password changed successfully! Please login again.");
                adminLogout(); // Logout after password change for security
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
                <p className="text-gray-400">Manage your theater admin account and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Security Tips */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 text-emerald-500 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                            <h3 className="font-bold">Security Tip</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Use a strong password with a mix of letters, numbers, and symbols to keep your account secure.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="font-bold">Important</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            After changing your password, you will be automatically logged out and asked to sign in again.
                        </p>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 text-white mb-8 border-b border-white/5 pb-4">
                            <KeyRound className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold">Change Password</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Current Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
