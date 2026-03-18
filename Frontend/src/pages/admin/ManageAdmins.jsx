import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, XCircle, Clock, ShieldAlert, Trash2, Building2, UserCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageAdmins = () => {
    const { axios, getToken } = useAppContext();
    const [applications, setApplications] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewNotes, setReviewNotes] = useState({}); // Map of appId -> note
    const [adminCredentials, setAdminCredentials] = useState({}); // Map of appId -> {email, password}
    const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'admins'

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [appRes, adminRes] = await Promise.all([
                axios.get('/api/admin-application/all', config),
                axios.get('/api/admin/admins/list', config)
            ]);

            if (appRes.data.success) {
                setApplications(appRes.data.applications);
            }
            if (adminRes.data.success) {
                setAdmins(adminRes.data.admins);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id, applicantEmail) => {
        const creds = adminCredentials[id] || {};
        const email = creds.email || applicantEmail;
        const password = creds.password;

        if (!password) {
            toast.error("Please set a temporary password for the admin account");
            return;
        }

        if (!window.confirm(`Approve this application? Admin will login with:\nEmail: ${email}\nPassword: ${password}`)) return;
        
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin-application/approve/${id}`, 
                { 
                    reviewNote: reviewNotes[id] || '', 
                    adminEmail: email, 
                    adminPassword: password 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Application approved and account created!');
                setReviewNotes(prev => { const next = {...prev}; delete next[id]; return next; });
                setAdminCredentials(prev => { const next = {...prev}; delete next[id]; return next; });
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error approving application');
        }
    };

    const handleReject = async (id) => {
        const note = reviewNotes[id];
        if (!window.confirm("Are you sure you want to reject this application?")) return;
        if (!note) {
            toast.error("Please provide a reason for rejection in the review note");
            return;
        }

        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin-application/reject/${id}`, 
                { reviewNote: note },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Application rejected');
                setReviewNotes(prev => { const next = {...prev}; delete next[id]; return next; });
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error rejecting application');
        }
    };

    const handleRemoveAdmin = async (id) => {
        if (!window.confirm("WARNING: Are you sure you want to revoke admin access for this user? They will lose access to their dashboard and theaters.")) return;

        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/admin/admins/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Admin access revoked successfully');
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error removing admin');
        }
    };

    // Filter applications
    const pendingApps = applications.filter(app => app.status === 'pending');
    const pastApps = applications.filter(app => app.status !== 'pending');

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
            
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Manage Admins</h1>
                    <p className="text-gray-400">Review applications and manage active theater admins.</p>
                </div>
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'applications' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Applications <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{pendingApps.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'admins' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-white'}`}
                    >
                        Active Admins <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{admins.length}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : activeTab === 'applications' ? (
                /* Tab 1: Applications */
                <div className="space-y-8">
                    {/* Pending Applications */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Pending Review ({pendingApps.length})
                        </h2>
                        
                        {pendingApps.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                                No pending admin applications.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {pendingApps.map(app => (
                                    <div key={app._id} className="bg-white/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 py-1.5 px-4 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-bl-xl border-b border-l border-amber-500/20">
                                            PENDING
                                        </div>
                                        
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-amber-500/30 shrink-0">
                                                <UserCircle className="w-8 h-8 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{app.name}</h3>
                                                <p className="text-sm text-gray-400">{app.email}</p>
                                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {app.city}, {app.state}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-black/40 rounded-xl p-4 mb-6 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Theater Name</span>
                                                <span className="text-white font-medium">{app.theaterName}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Reg. Number</span>
                                                <span className="text-white font-medium uppercase tracking-wider">{app.registrationNumber}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Contact</span>
                                                <span className="text-white font-medium">{app.contactNumber}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] bg-emerald-500/10 text-emerald-500 w-fit px-1.5 py-0.5 rounded-sm uppercase mb-1 ml-1 font-bold">Admin Login Email</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Admin Email"
                                                        value={adminCredentials[app._id]?.email || app.email}
                                                        onChange={(e) => setAdminCredentials(prev => ({
                                                            ...prev,
                                                            [app._id]: { ...(prev[app._id] || {}), email: e.target.value }
                                                        }))}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-emerald-500/50 outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] bg-emerald-500/10 text-emerald-500 w-fit px-1.5 py-0.5 rounded-sm uppercase mb-1 ml-1 font-bold">Temp Password</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Set Temp Password"
                                                        value={adminCredentials[app._id]?.password || ''}
                                                        onChange={(e) => setAdminCredentials(prev => ({
                                                            ...prev,
                                                            [app._id]: { ...(prev[app._id] || {}), password: e.target.value }
                                                        }))}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-emerald-500/50 outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Add a review note (optional for approval, req. for rejection)..."
                                                value={reviewNotes[app._id] || ''}
                                                onChange={(e) => setReviewNotes(prev => ({ ...prev, [app._id]: e.target.value }))}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary/50 outline-none transition-colors"
                                            />
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleApprove(app._id, app.email)}
                                                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/50 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve & Create Account
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(app._id)}
                                                    className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/50 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past Applications */}
                    {pastApps.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 mt-12 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" /> Past Applications
                            </h2>
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Applicant</th>
                                            <th className="px-6 py-4 font-medium">Theater</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Date Reviewed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pastApps.map(app => (
                                            <tr key={app._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{app.name}</div>
                                                    <div className="text-gray-500 text-xs">{app.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{app.theaterName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                        {app.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(app.reviewedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Tab 2: Active Admins */
                <div>
                    {admins.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                            No active theater admins found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {admins.map(admin => (
                                <div key={admin._id} className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 relative group overflow-hidden">
                                    {/* Background glow effect */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                                    
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <img 
                                            src={admin.image || 'https://via.placeholder.com/150'} 
                                            alt={admin.name} 
                                            className="w-16 h-16 rounded-full border-2 border-emerald-500/30 object-cover"
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{admin.name}</h3>
                                            <p className="text-sm text-gray-400">{admin.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between mb-6 relative z-10 border border-white/5">
                                        <div className="flex items-center gap-3 text-emerald-400">
                                            <Building2 className="w-5 h-5" />
                                            <span className="font-medium text-sm">Managed Theaters</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
                                            {admin.theaterCount || 0}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleRemoveAdmin(admin._id)}
                                        className="w-full py-2.5 rounded-lg text-sm font-medium border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-rose-500"
                                    >
                                        <Trash2 className="w-4 h-4" /> Revoke Access
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;
