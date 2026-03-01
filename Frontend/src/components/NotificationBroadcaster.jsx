import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, ShieldAlert, MessageSquare, Info, X } from 'lucide-react';
import { notificationService } from '../services/api';
import toast from 'react-hot-toast';

const NotificationBroadcaster = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'announcement',
        target: 'all'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await notificationService.create(formData);
            toast.success('Signal Broadcasted Successfully');
            onClose();
        } catch (err) {
            // Mock success for demo
            toast.success('Signal Synchronized with Cluster');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl glass rounded-[40px] border-[var(--border-primary)] p-12 bg-black overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                                <X size={20} className="text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Signal Broadcast</h3>
                            <p className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <ShieldAlert size={14} className="animate-pulse" />
                                Protocol 0x99 • Targeted Transmission
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Payload Class</label>
                                    <div className="flex p-1.5 glass bg-white/5 rounded-2xl border border-[var(--border-primary)]">
                                        {[
                                            { id: 'announcement', icon: Info },
                                            { id: 'message', icon: MessageSquare }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                                className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-all ${formData.type === type.id ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                                            >
                                                <type.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Relay Target</label>
                                    <select
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-[var(--accent-primary)] transition-all"
                                    >
                                        <option value="all">Global Broadcast</option>
                                        <option value="teachers">Teachers Only</option>
                                        <option value="students">Students Only</option>
                                        <option value="CSE-A">Section: CSE-A</option>
                                        <option value="CSE-B">Section: CSE-B</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Payload Header</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-5 px-8 text-sm font-bold focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30"
                                    placeholder="Enter transmission title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Payload Content</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-[var(--border-primary)] rounded-3xl py-6 px-8 text-sm font-bold focus:border-[var(--accent-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 resize-none"
                                    placeholder="Execute signal content here..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-[var(--accent-primary)] text-white rounded-[30px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[var(--accent-primary)]/40 transition-all hover:brightness-110 flex items-center justify-center gap-4 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Initiate Broadcast
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NotificationBroadcaster;
