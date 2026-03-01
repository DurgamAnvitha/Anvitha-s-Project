import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, Search, User, Clock, CheckCircle,
    ShieldAlert, Check, X, Filter, Activity, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../services/AuthContext';
import { queryService } from '../services/api';

const Queries = () => {
    const { user } = useAuth();
    const [queries, setQueries] = useState([]);
    const [newQuery, setNewQuery] = useState({ subject: '', content: '' });
    const [responseInput, setResponseInput] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchQueries = async () => {
        setLoading(true);
        try {
            let res;
            if (user.role === 'ADMIN' || user.role === 'TEACHER') {
                res = await queryService.getAll();
            } else {
                res = await queryService.getBySender(user.username || user.email);
            }
            let fetchedQueries = res.data || [];

            if (user.role === 'TEACHER') {
                fetchedQueries = fetchedQueries.filter(q =>
                    q.receiverId === 'TEACHER' || q.senderId === (user.username || user.email)
                );
            }

            setQueries(fetchedQueries);
        } catch (error) {
            toast.error("Failed to sync query stream");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newQuery.content.trim()) return;

        try {
            await queryService.create({
                ...newQuery,
                senderId: user.username || user.email,
                senderName: user.name,
                senderRole: user.role,
                receiverId: user.role === 'TEACHER' ? 'ADMIN' : (user.role === 'STUDENT' ? 'TEACHER' : 'ADMIN')
            });
            toast.success('Query Payload Transmitted');
            setNewQuery({ subject: '', content: '' });
            fetchQueries();
        } catch (error) {
            toast.error('Transmission Failure');
        }
    };

    const handleResolve = async (queryId) => {
        const reply = responseInput[queryId];
        if (!reply?.trim()) return;

        try {
            await queryService.resolve(queryId, { reply });
            toast.success('Resolution Synchronized');
            setResponseInput({ ...responseInput, [queryId]: '' });
            fetchQueries();
        } catch (error) {
            toast.error('Resolution Sync Failed');
        }
    };

    const filteredQueries = queries.filter(q =>
        filterStatus === 'All' ? true : q.status === filterStatus.toUpperCase()
    ).filter((q, index, self) =>
        index === self.findIndex((t) => t.id === q.id) // Ensure unique ID rendering
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Query Management</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <MessageSquare size={14} className="text-[var(--accent-primary)]" />
                        Resolution Protocol • {user.role} Sector
                    </p>
                </div>
                <div className="flex gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                    {['All', 'Pending', 'Resolved'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {user.role !== 'ADMIN' && (
                    <div className="lg:col-span-1">
                        <div className="glass-card-accent border-[var(--border-primary)] p-8 space-y-6 shadow-2xl shadow-[var(--accent-primary)]/10">
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Broadcaster</h3>
                                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-1 opacity-60">Authorized Uplink</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    placeholder="Subject Title"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[var(--accent-primary)] outline-none transition-all"
                                    value={newQuery.subject}
                                    onChange={e => setNewQuery({ ...newQuery, subject: e.target.value })}
                                />
                                <textarea
                                    required
                                    placeholder="Briefly explain the situation..."
                                    className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[var(--accent-primary)] outline-none transition-all resize-none"
                                    value={newQuery.content}
                                    onChange={e => setNewQuery({ ...newQuery, content: e.target.value })}
                                />
                                <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--accent-primary)]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                    <Send size={16} /> Transmit Query
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className={`${user.role === 'ADMIN' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
                    <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-[var(--accent-primary)]" /> Signal Stream
                            </h3>
                            <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-50">{filteredQueries.length} Total Nodes Detected</p>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {filteredQueries.length > 0 ? filteredQueries.map((q) => (
                                <div key={q.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[var(--accent-primary)]/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent-primary)] font-black shadow-lg">
                                                {q.senderName?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic group-hover:text-[var(--accent-primary)] transition-colors">{q.senderName}</p>
                                                <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                                    {q.senderRole} node • {new Date(q.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] border transition-all ${q.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {q.status}
                                        </div>
                                    </div>

                                    <div className="relative pl-6 border-l-2 border-white/5 mb-6 group-hover:border-[var(--accent-primary)]/40 transition-all">
                                        <p className="text-[10px] font-black uppercase text-[var(--accent-primary)] tracking-widest mb-1 opacity-80">{q.subject || "Academic Query"}</p>
                                        <p className="text-xs font-bold text-[var(--text-primary)] italic leading-relaxed opacity-90">{q.content}</p>
                                    </div>

                                    {q.status === 'RESOLVED' ? (
                                        <div className="ml-6 p-5 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10">
                                            <div className="flex items-center gap-2 mb-2 text-[var(--accent-primary)]">
                                                <CheckCircle size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Official Resolution</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-[var(--text-primary)] italic leading-relaxed opacity-70">"{q.reply}"</p>
                                        </div>
                                    ) : (user.role === 'ADMIN' || (user.role === 'TEACHER' && q.receiverId === 'TEACHER')) ? (
                                        <div className="ml-6 flex gap-3">
                                            <input
                                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:border-[var(--accent-primary)] outline-none transition-all"
                                                placeholder="Transmit resolution..."
                                                value={responseInput[q.id] || ''}
                                                onChange={e => setResponseInput({ ...responseInput, [q.id]: e.target.value })}
                                            />
                                            <button
                                                onClick={() => handleResolve(q.id)}
                                                className="px-6 bg-[var(--accent-primary)] text-white rounded-2xl shadow-lg shadow-[var(--accent-primary)]/20 hover:brightness-110 active:scale-95 transition-all"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="ml-6 flex items-center gap-2 text-amber-500/50 italic text-[9px] font-black uppercase tracking-widest">
                                            <Clock size={12} /> Awaiting Peer Synchronization
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
                                    <ShieldAlert size={60} className="mb-6 stroke-[1]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal stream clear • No anomalies detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Queries;
