import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Calendar as CalendarIcon, MapPin, CheckCircle, Clock, Trash2, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { placementService } from '../../services/api';

const PlacementsAdmin = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDrive, setNewDrive] = useState({
        companyName: '',
        date: '',
        time: '',
        venue: '',
        eligibility: '',
        description: ''
    });

    const fetchDrives = async () => {
        setLoading(true);
        try {
            const res = await placementService.getDrives();
            setDrives(res.data || []);
        } catch (error) {
            toast.error("Failed to sync placement drives");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrives();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await placementService.addDrive(newDrive);
            toast.success("Placement Drive Activated");
            setShowModal(false);
            setNewDrive({ companyName: '', date: '', time: '', venue: '', eligibility: '', description: '' });
            fetchDrives();
        } catch (error) {
            toast.error("Failed to sequence placement drive");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this placement drive?")) return;
        try {
            await placementService.deleteDrive(id);
            toast.success("Placement Drive Deleted");
            fetchDrives();
        } catch (error) {
            toast.error("Failed to delete placement drive");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Placement Control</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Building2 size={14} className="text-orange-500" />
                        Recruitment Infrastructure
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                    <Plus size={16} /> Init Drive Sequence
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-widest text-[var(--text-secondary)] animate-pulse inline-flex items-center justify-center gap-2">
                        <Clock size={16} className="animate-spin" /> Synchronizing Data...
                    </div>
                ) : drives.length > 0 ? (
                    drives.map((d, i) => (
                        <div key={d.id || i} className="glass-card border-[var(--border-primary)] p-6 md:p-8 hover:border-orange-500/40 transition-all group flex flex-col justify-between h-full min-h-[250px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                <Building2 size={80} className="text-orange-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{d.companyName}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                                        <button onClick={() => handleDelete(d.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-3">
                                        <CalendarIcon size={14} className="text-orange-500 opacity-70" /> {d.date} • {d.time}
                                    </p>
                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-3">
                                        <MapPin size={14} className="text-orange-500 opacity-70" /> {d.venue}
                                    </p>
                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase flex items-start gap-3">
                                        <CheckCircle size={14} className="text-emerald-500 opacity-70 mt-0.5 flex-shrink-0" /> <span className="text-emerald-500/80 leading-snug">{d.eligibility}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-30 italic">
                        <ShieldAlert size={60} className="mb-6 stroke-[1]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Grid is empty • No active recruitment drives</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl glass-card-accent border-[var(--border-primary)] p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Init Recruiter Node</h3>
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1">System wide broadcast broadcast</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Corporate Entity Name</label>
                                    <input required placeholder="E.g. TechCorp Dynamics" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/20" value={newDrive.companyName} onChange={e => setNewDrive({ ...newDrive, companyName: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Arrival Date</label>
                                        <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all text-[var(--text-primary)]" value={newDrive.date} onChange={e => setNewDrive({ ...newDrive, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Time Grid (e.g. 09:00 AM)</label>
                                        <input required placeholder="09:00 AM" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/20" value={newDrive.time} onChange={e => setNewDrive({ ...newDrive, time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Physical Node / Venue</label>
                                    <input required placeholder="Main Auditorium" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/20" value={newDrive.venue} onChange={e => setNewDrive({ ...newDrive, venue: e.target.value })} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Eligibility Parameters</label>
                                    <textarea required placeholder="B.Tech CSE/IT, >7.5 CGPA, No Active Backlogs" className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all resize-none placeholder:text-white/20" value={newDrive.eligibility} onChange={e => setNewDrive({ ...newDrive, eligibility: e.target.value })} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-4">Optional Briefing</label>
                                    <textarea placeholder="Additional instructions..." className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-orange-500 focus:bg-white/10 outline-none transition-all resize-none placeholder:text-white/20" value={newDrive.description} onChange={e => setNewDrive({ ...newDrive, description: e.target.value })} />
                                </div>

                                <button type="submit" className="w-full py-4 mt-6 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:brightness-110 active:scale-95 shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3">
                                    <Building2 size={18} /> Execute Insertion Protocol
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PlacementsAdmin;
