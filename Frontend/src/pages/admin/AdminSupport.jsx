import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, ExternalLink, Mail, Phone, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const AdminSupport = () => {
    const { axios, backendUrl } = useAppContext();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');
    const [updatingTicket, setUpdatingTicket] = useState(null);

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get('/api/support/all');
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const updateStatus = async (ticketId, newStatus) => {
        setUpdatingTicket(ticketId);
        try {
            const { data } = await axios.patch(`/api/support/${ticketId}/status`, {
                status: newStatus
            });

            if (data.success) {
                // Update the ticket in the local state
                setTickets(tickets.map(ticket =>
                    ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingTicket(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Filter tickets by status
    const pendingTickets = tickets.filter(t => t.status === 'Open');
    const processingTickets = tickets.filter(t => t.status === 'In Progress');
    const solvedTickets = tickets.filter(t => t.status === 'Resolved');

    // Get current tab tickets
    const getCurrentTabTickets = () => {
        switch (activeTab) {
            case 'Pending':
                return pendingTickets;
            case 'In Processing':
                return processingTickets;
            case 'Solved':
                return solvedTickets;
            default:
                return [];
        }
    };

    const renderActionButton = (ticket) => {
        if (ticket.status === 'Open') {
            return (
                <button
                    onClick={() => updateStatus(ticket._id, 'In Progress')}
                    disabled={updatingTicket === ticket._id}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updatingTicket === ticket._id ? (
                        <>
                            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            <ArrowRight className="w-3 h-3" />
                            <span>Mark In Processing</span>
                        </>
                    )}
                </button>
            );
        } else if (ticket.status === 'In Progress') {
            return (
                <button
                    onClick={() => updateStatus(ticket._id, 'Resolved')}
                    disabled={updatingTicket === ticket._id}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updatingTicket === ticket._id ? (
                        <>
                            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Mark Solved</span>
                        </>
                    )}
                </button>
            );
        }
        return null; // No button for Resolved tickets
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Open':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'In Progress':
                return 'bg-blue-500/10 text-blue-500';
            case 'Resolved':
                return 'bg-green-500/10 text-green-500';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Open':
                return 'Pending';
            case 'In Progress':
                return 'In Processing';
            case 'Resolved':
                return 'Solved';
            default:
                return status;
        }
    };

    const currentTabTickets = getCurrentTabTickets();

    return (
        <div className="min-h-screen bg-black text-white p-2 md:p-4 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-2">
                    <h1 className="text-xl font-bold mb-0.5">Help & Support</h1>
                    <p className="text-gray-400 text-xs">View and manage user support tickets</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#121212] border border-white/10 rounded p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-[10px] mb-0">Pending</p>
                                <p className="text-xl font-bold text-yellow-500">{pendingTickets.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-[10px] mb-0">In Processing</p>
                                <p className="text-xl font-bold text-blue-500">{processingTickets.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded p-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-[10px] mb-0">Solved</p>
                                <p className="text-xl font-bold text-green-500">{solvedTickets.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0.5 mb-2 border-b border-white/10">
                    {['Pending', 'In Processing', 'Solved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 text-[11px] font-medium transition-all relative ${activeTab === tab
                                    ? 'text-primary'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : currentTabTickets.length === 0 ? (
                    <div className="bg-[#121212] rounded p-4 text-center border border-white/5">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <h3 className="text-sm font-medium text-white mb-0.5">No {activeTab.toLowerCase()} tickets</h3>
                        <p className="text-gray-400 text-xs">There are no {activeTab.toLowerCase()} support tickets at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-1.5">
                        {currentTabTickets.map((ticket) => (
                            <div key={ticket._id} className="bg-[#121212] border border-white/10 rounded p-2 hover:border-primary/30 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-2">
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-[11px]">
                                                    {ticket.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xs">{ticket.name}</h3>
                                                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                                        <Clock className="w-2 h-2" />
                                                        <span>{formatDate(ticket.createdAt)}</span>
                                                        <span className={`px-1 py-0 rounded text-[8px] uppercase font-bold tracking-wider ${getStatusBadgeColor(ticket.status)}`}>
                                                            {getStatusLabel(ticket.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-auto">
                                                {renderActionButton(ticket)}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 text-[10px] text-gray-400 bg-black/30 p-1.5 rounded">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                                                <span className="break-all">{ticket.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                                                <span>{ticket.phone}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[9px] font-bold text-gray-300 mb-0.5 uppercase tracking-wider">Issue Description</h4>
                                            <p className="text-gray-300 bg-black/20 p-1.5 rounded border border-white/5 leading-snug text-[10px]">
                                                {ticket.message}
                                            </p>
                                        </div>
                                    </div>

                                    {ticket.attachment && (
                                        <div className="md:w-28 flex-shrink-0">
                                            <h4 className="text-[9px] font-bold text-gray-300 mb-0.5 uppercase tracking-wider">Attachment</h4>
                                            <div className="bg-black/40 border border-white/10 rounded p-1.5 flex flex-col items-center justify-center gap-1 h-full min-h-[70px]">
                                                {ticket.attachment.endsWith('.pdf') ? (
                                                    <FileText className="w-6 h-6 text-red-500" />
                                                ) : (
                                                    <img
                                                        src={`${backendUrl}${ticket.attachment}`}
                                                        alt="Attachment"
                                                        className="w-full h-12 object-contain rounded bg-black/50"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <a
                                                    href={`${backendUrl}${ticket.attachment}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-primary hover:text-white flex items-center gap-0.5 font-medium transition-colors"
                                                >
                                                    View File <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
