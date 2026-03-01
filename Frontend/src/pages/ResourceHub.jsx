import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, FileText, Link, Upload, Download, Clock, CheckCircle, AlertCircle, Plus, Filter, Search, ChevronRight } from 'lucide-react';
import { noteService, assignmentService, sectionService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const ResourceHub = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const sectionId = user.sectionId || 'S1';
                const [notesRes, assignmentsRes] = await Promise.all([
                    noteService.getBySection(sectionId),
                    assignmentService.getBySection(sectionId)
                ]);
                setNotes(notesRes.data || []);
                setAssignments(assignmentsRes.data || []);
            } catch (err) {
                console.error(err);
                // Fallback mock data
                setNotes([
                    { id: 1, title: 'Distributed Systems Unit 1', type: 'PDF', subject: 'CS601', date: '2 days ago', size: '2.4 MB' },
                    { id: 2, title: 'System Architecture Reference', type: 'PPT', subject: 'CS603', date: '1 week ago', size: '5.1 MB' }
                ]);
                setAssignments([
                    { id: 1, title: 'BCNF Normalization Exercise', subject: 'CS601', deadline: 'Tomorrow, 11:59 PM', status: 'Pending' },
                    { id: 2, title: 'RFID Protocol Implementation', subject: 'CS605', deadline: 'March 15, 2026', status: 'Submitted' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleFileUpload = (e) => {
        e.preventDefault();
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Uploading Resource Packet...',
                success: 'Resource Synchronized with Section.',
                error: 'Transmission Failed.',
            }
        );
        setShowUpload(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Learning Ecosystem</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Book size={12} className="text-[var(--accent-primary)]" />
                        Infrastructure Level 04 • Section-Locked Resources
                    </p>
                </div>

                <div className="flex p-1.5 glass rounded-2xl border-[var(--border-primary)] bg-white/5">
                    {[
                        { id: 'notes', label: 'Knowledge Base', icon: FileText },
                        { id: 'assignments', label: 'Operational Tasks', icon: Clock }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-[var(--border-primary)] focus-within:bg-[var(--accent-primary)]/5 focus-within:border-[var(--accent-primary)]/30 transition-all group w-80">
                            <Search size={18} className="text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)]" />
                            <input
                                type="text"
                                placeholder="Query Resources..."
                                className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]/30"
                            />
                        </div>
                        {user.role === 'TEACHER' && (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20"
                            >
                                <Upload size={16} />
                                Broadcast Payload
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'notes' ? (
                            <motion.div
                                key="notes"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="grid grid-cols-2 gap-6"
                            >
                                {notes.map(note => (
                                    <div key={note.id} className="glass-card-accent border-[var(--border-primary)] group hover:border-[var(--accent-primary)]/40 transition-all p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            {note.type === 'PDF' ? <FileText size={60} /> : <Link size={60} />}
                                        </div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xl shadow-[var(--accent-primary)]/10">
                                                {note.type === 'PDF' ? <FileText size={24} /> : <Link size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[var(--text-primary)] uppercase tracking-tight text-lg leading-none mb-1">{note.title}</h4>
                                                <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest">{note.subject} • {note.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest italic">{note.size}</span>
                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all">
                                                <Download size={14} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="assignments"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4"
                            >
                                {assignments.map(assign => (
                                    <div key={assign.id} className="glass-card border-[var(--border-primary)] flex items-center justify-between p-6 group hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${assign.status === 'Submitted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                                {assign.status === 'Submitted' ? <CheckCircle size={28} /> : <Clock size={28} />}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{assign.title}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em]">{assign.subject}</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)] font-bold italic opacity-60">Deadline: {assign.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase mb-1">Status Protocol</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${assign.status === 'Submitted' ? 'text-emerald-500' : 'text-amber-500'}`}>{assign.status}</p>
                                            </div>
                                            <button className="p-3 bg-white/5 rounded-xl border border-[var(--border-primary)] group-hover:border-[var(--accent-primary)] transition-all">
                                                <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Stats */}
                <div className="col-span-1 space-y-6">
                    <div className="glass-card bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/10 text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/20 mx-auto flex items-center justify-center text-[var(--accent-primary)] mb-4 border border-[var(--accent-primary)]/30">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-2">Metrics Hub</h3>
                        <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">14</p>
                        <p className="text-[8px] font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1 italic">Total Sync Resources</p>
                    </div>

                    <div className="glass-card border-[var(--border-primary)] space-y-6">
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-500" />
                            Critical Deadlines
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs font-bold text-[var(--text-primary)] mb-1">ML Model Submission</p>
                                <p className="text-[8px] text-amber-500 font-black uppercase italic">Ends in 4 hours</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs font-bold text-[var(--text-primary)] mb-1">Ethics Case Study</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase italic">Ends in 2 days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal (Abstracted) */}
            <AnimatePresence>
                {showUpload && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUpload(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg glass rounded-[40px] border-[var(--border-primary)] p-10 bg-black shadow-2xl shadow-emerald-500/10"
                        >
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                                <Plus className="text-emerald-500" />
                                Resource Broadcast
                            </h3>
                            <form onSubmit={handleFileUpload} className="space-y-6">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Payload Title</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:text-[var(--text-secondary)]/30" placeholder="e.g. Distributed Systems Architecture" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Target Section</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xs font-black uppercase appearance-none outline-none focus:border-emerald-500/50">
                                            <option>CSE-A</option>
                                            <option>CSE-B</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Payload Type</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xs font-black uppercase appearance-none outline-none focus:border-emerald-500/50">
                                            <option>DOCUMENT (PDF)</option>
                                            <option>DEMO VIDEO (URL)</option>
                                            <option>EXTERNAL LINK</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Cloud Link (File/Video)</label>
                                    <input type="url" required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm font-mono focus:border-emerald-500/50 outline-none transition-all placeholder:text-[var(--text-secondary)]/30" placeholder="https://drive.google.com/..." />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Strategic Description</label>
                                    <textarea rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:text-[var(--text-secondary)]/30 resize-none" placeholder="Provide context for this payload..."></textarea>
                                </div>
                                <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 transition-all hover:brightness-110">
                                    Initiate Transmission
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ResourceHub;
