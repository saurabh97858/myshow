import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Mail, Lock, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
    const { adminLogin, loading } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await adminLogin(email, password);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 mb-4 shadow-xl shadow-primary/5">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Login with your theater admin credentials</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 py-1.5 px-4 bg-primary/20 text-primary text-[10px] font-bold rounded-bl-xl border-b border-l border-primary/20">
                        SECURE ACCESS
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
