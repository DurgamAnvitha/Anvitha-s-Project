import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Library as LibraryIcon, Search, BookOpen, Clock, ChevronRight,
    Plus, X, Send, Video, FileText, Trash2, ShieldCheck, Zap
} from 'lucide-react';
import { resourceService, sectionService, timetableService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const KnowledgeHub = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', description: '', fileLink: '', videoLink: '', sectionId: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRes, secRes] = await Promise.all([
                resourceService.getAll(),
                sectionService.getAll()
            ]);
            let filtered = resRes.data || [];
            if (user.role === 'STUDENT') {
                filtered = filtered.filter(r => r.sectionId === user.sectionId);
            } else if (user.role === 'TEACHER') {
                filtered = filtered.filter(r => r.teacherId === (user.username || user.email));
            }
            setResources(filtered);
            setSections(secRes.data || []);
        } catch (error) {
            toast.error("Resource Stream Interrupted");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            await resourceService.create({
                ...newResource,
                teacherId: user.username || user.email,
                teacherName: user.name,
                createdAt: new Date().toISOString()
            });
            toast.success('Knowledge Node Deployed');
            setShowUploadModal(false);
            setNewResource({ title: '', description: '', fileLink: '', videoLink: '', sectionId: '' });
            fetchData();
        } catch (error) {
            toast.error('Deployment Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this knowledge node?")) return;
        try {
            await resourceService.delete(id);
            toast.success("Node Purged");
            fetchData();
        } catch (error) {
            toast.error("Purge Failed");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Knowledge Hub</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <LibraryIcon size={14} className="text-[var(--accent-primary)] animate-pulse" />
                        Synchronised Resource Stream • {user.role === 'TEACHER' ? 'Faculty Nexus' : 'Student Node'}
                    </p>
                </div>
                {user.role === 'TEACHER' && (
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-3 px-8 py-4 bg-[var(--accent-primary)] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(var(--accent-primary-rgb),0.3)] hover:scale-105 transition-all">
                        <Plus size={18} /> Share Knowledge
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.length > 0 ? resources.map((res, i) => (
                    <motion.div key={i} whileHover={{ y: -10 }} className="glass-card-accent border-[var(--border-primary)] p-8 relative group overflow-hidden flex flex-col justify-between shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1.5 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl text-[8px] font-black uppercase text-[var(--accent-primary)] tracking-widest shadow-inner">
                                    {sections.find(s => s.id === res.sectionId)?.name || 'General Stream'}
                                </span>
                                {user.role === 'TEACHER' && (
                                    <button onClick={() => handleDelete(res.id)} className="p-2.5 bg-red-500/10 text-red-500/50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic line-clamp-2 leading-none mb-4 group-hover:text-[var(--accent-primary)] transition-colors">{res.title}</h3>
                            <p className="text-xs font-bold text-[var(--text-secondary)] opacity-60 leading-relaxed italic mb-8 line-clamp-3">"{res.description}"</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                {res.fileLink && (
                                    <button onClick={() => window.open(res.fileLink, '_blank')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all">
                                        <FileText size={14} className="text-[var(--accent-primary)]" /> Notes Node
                                    </button>
                                )}
                                {res.videoLink && (
                                    <button onClick={() => window.open(res.videoLink, '_blank')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all">
                                        <Video size={14} className="text-indigo-400" /> Video Sync
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 italic">
                                <Clock size={12} /> {new Date(res.createdAt).toLocaleDateString()} • Verified by {res.teacherName || 'Faculty'}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-32 text-center glass-card border-dashed border-2 border-[var(--border-primary)] rounded-[3rem] opacity-30 italic">
                        <Zap size={60} className="mx-auto mb-6 stroke-[1]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Knowledge Nodes Detected in Stream</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-lg p-10 border-[var(--border-primary)] relative shadow-[0_0_100px_rgba(var(--accent-primary-rgb),0.2)]">
                            <button onClick={() => setShowUploadModal(false)} className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Deploy Knowledge Node</h2>
                                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] mt-3">Advanced Resource Distribution Protocol</p>
                            </div>
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 opacity-50 italic">Sector Identifier</label>
                                    <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-white hover:border-[var(--accent-primary)] outline-none appearance-none transition-all" value={newResource.sectionId} onChange={e => setNewResource({ ...newResource, sectionId: e.target.value })}>
                                        <option value="" className="bg-black">Target Sector...</option>
                                        {sections.map(s => <option key={s.id} value={s.id} className="bg-black">{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 opacity-50 italic">Node Title</label>
                                    <input required placeholder="e.g. Quantum Computing Basics" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white hover:border-[var(--accent-primary)] outline-none transition-all" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 opacity-50 italic">File Uplink (PDF/Notes)</label>
                                        <input placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white hover:border-[var(--accent-primary)] outline-none transition-all" value={newResource.fileLink} onChange={e => setNewResource({ ...newResource, fileLink: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 opacity-50 italic">Video Uplink (Sync)</label>
                                        <input placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white hover:border-[var(--accent-primary)] outline-none transition-all" value={newResource.videoLink} onChange={e => setNewResource({ ...newResource, videoLink: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 opacity-50 italic">Node Description</label>
                                    <textarea required placeholder="Explain the key learning outcomes..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white hover:border-[var(--accent-primary)] outline-none transition-all min-h-[120px] resize-none" value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-5 bg-[var(--accent-primary)] text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-[0_10px_40px_rgba(var(--accent-primary-rgb),0.3)] hover:brightness-110 active:scale-95 transition-all text-xs">
                                    Confirm Knowledge Injection
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default KnowledgeHub;
