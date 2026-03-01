import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, Calendar, MessageSquare, Check } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('all');

    const notifications = [
        { id: 1, type: 'announcement', title: 'System Maintenance', message: 'System will be down for upgrades at 2:00 AM PST.', time: '2h ago', unread: true },
        { id: 2, type: 'event', title: 'Annual Tech Fest', message: 'Registrations are now open for the Tech Innovators 2026.', time: '5h ago', unread: true },
        { id: 3, type: 'message', title: 'Prof. Miller', message: 'Your query regarding DBMS Assignment has been resolved.', time: '1d ago', unread: false },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'announcement': return <Info size={16} className="text-blue-400" />;
            case 'event': return <Calendar size={16} className="text-emerald-400" />;
            case 'message': return <MessageSquare size={16} className="text-violet-400" />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-96 glass-card bg-black/90 rounded-l-3xl z-[100] border-l border-[var(--border-primary)] shadow-2xl flex flex-col p-0"
                    >
                        <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Signals</h2>
                                <p className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-[0.2em]">Operational Stream</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                <X size={20} className="text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        <div className="flex p-2 gap-2 bg-white/5 mx-6 mt-6 rounded-xl overflow-hidden">
                            {['all', 'announcements', 'events', 'messages'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {notifications.map((n) => (
                                <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.unread ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20 shadow-lg shadow-[var(--accent-primary)]/5' : 'bg-white/[0.02] border-[var(--border-primary)] opacity-70'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${n.unread ? 'border border-[var(--accent-primary)]/30' : ''}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">{n.title}</h4>
                                                <span className="text-[9px] font-bold text-[var(--text-secondary)]">{n.time}</span>
                                            </div>
                                            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-bold">{n.message}</p>
                                        </div>
                                    </div>
                                    {n.unread && (
                                        <div className="mt-3 flex justify-end gap-2">
                                            <button className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-1 hover:brightness-125">
                                                <Check size={10} /> Mark read
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-[var(--border-primary)] bg-white/[0.01]">
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                                Clear All Signal History
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
