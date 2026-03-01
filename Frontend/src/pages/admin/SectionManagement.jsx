import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Plus, Trash2, X, Save, Shield, BookOpen,
    Users, Calendar, Hash, AlertTriangle, ChevronRight,
    Edit2, GraduationCap, MapPin
} from 'lucide-react';
import { sectionService, studentService, teacherService } from '../../services/api';

const EMPTY_SECTION = {
    name: '', branch: '', year: '', semester: '',
    academicYear: '', classRoom: '', maxCapacity: '', classTeacherId: ''
};

/* ── Create / Edit Section Modal ─────────────── */
const SectionModal = ({ section, onClose, onSave, teachers }) => {
    const [form, setForm] = useState(section ? { ...section } : { ...EMPTY_SECTION });
    const [loading, setLoading] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.branch) return alert('Section name and branch are required.');
        setLoading(true);
        try { await onSave(form); onClose(); }
        catch (err) { alert(err.response?.data?.message || 'Failed to save section.'); }
        finally { setLoading(false); }
    };

    const inputClass = "w-full bg-white/5 border border-[var(--border-primary)] rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40";
    const labelClass = "text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card-accent w-full max-w-xl p-8 border-[var(--border-primary)] relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button onClick={onClose} className="absolute top-5 right-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-6">
                    {section ? '✏️ Edit Section' : '➕ Create New Section'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1 */}
                    <div>
                        <label className={labelClass}>Section Name *</label>
                        <input className={inputClass} placeholder="e.g. CSE-A, ECE-B" value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Branch / Department *</label>
                            <select className={inputClass + ' appearance-none bg-black/40'} value={form.branch} onChange={e => set('branch', e.target.value)}>
                                <option value="">Select Branch...</option>
                                <option>Computer Science (CSE)</option>
                                <option>Electronics (ECE)</option>
                                <option>Mechanical (ME)</option>
                                <option>Civil (CE)</option>
                                <option>Information Technology (IT)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Year (1–4)</label>
                            <select className={inputClass + ' appearance-none bg-black/40'} value={form.year} onChange={e => set('year', e.target.value)}>
                                <option value="">Select Year...</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Semester</label>
                            <select className={inputClass + ' appearance-none bg-black/40'} value={form.semester} onChange={e => set('semester', e.target.value)}>
                                <option value="">Select Sem...</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Academic Year</label>
                            <input className={inputClass} placeholder="e.g. 2024-25" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Classroom / Room No.</label>
                            <input className={inputClass} placeholder="e.g. A-101, Lab-3" value={form.classRoom} onChange={e => set('classRoom', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Max Capacity</label>
                            <input type="number" className={inputClass} placeholder="e.g. 60" value={form.maxCapacity} onChange={e => set('maxCapacity', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Class Teacher (optional)</label>
                        <select className={inputClass + ' appearance-none bg-black/40'} value={form.classTeacherId || ''} onChange={e => set('classTeacherId', e.target.value)}>
                            <option value="">Select Class Teacher...</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} – {t.department || 'N/A'}</option>)}
                        </select>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full mt-2 py-3 bg-[var(--accent-primary)] hover:brightness-110 rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        <Save size={16} /> {loading ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

/* ── Delete Confirm ───────────────────────────── */
const DeleteConfirm = ({ section, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-sm p-8 border-red-500/30">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter">Delete Section?</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-bold">Remove <span className="text-[var(--text-primary)]">{section.name}</span>? This cannot be undone.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-xs uppercase tracking-widest hover:bg-white/5">Cancel</button>
                        <button disabled={loading}
                            onClick={async () => { setLoading(true); try { await onConfirm(); onClose(); } catch { alert('Delete failed'); setLoading(false); } }}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-black text-white text-xs uppercase tracking-widest disabled:opacity-50">
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ── Section Detail Panel ─────────────────────── */
const SectionDetailPanel = ({ section, onClose, onEdit, studentCount, teacherName }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="h-full w-full md:w-[420px] glass-card-accent overflow-y-auto custom-scrollbar border-l border-[var(--border-primary)]"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)] p-6 flex items-center justify-between z-10">
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Section Details</span>
                <div className="flex gap-3">
                    <button onClick={() => onEdit(section)} className="px-4 py-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)]/20 flex items-center gap-1.5">
                        <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
                </div>
            </div>
            <div className="p-8 space-y-6">
                {/* Section Name Badge */}
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] font-black text-3xl">
                        <Layers size={36} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{section.name}</h2>
                        <span className="mt-2 inline-block px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full text-[10px] font-black uppercase tracking-widest">
                            {section.branch || 'No Branch'}
                        </span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Year', value: section.year ? `${section.year}${['st', 'nd', 'rd', 'th'][section.year - 1] || 'th'} Year` : '—', icon: GraduationCap },
                        { label: 'Semester', value: section.semester ? `Semester ${section.semester}` : '—', icon: BookOpen },
                        { label: 'Academic Year', value: section.academicYear || '—', icon: Calendar },
                        { label: 'Classroom', value: section.classRoom || '—', icon: MapPin },
                        { label: 'Max Capacity', value: section.maxCapacity || '—', icon: Users },
                        { label: 'Students Enrolled', value: studentCount ?? '—', icon: Users },
                        { label: 'Class Teacher', value: teacherName || 'Not Assigned', icon: Shield },
                    ].map(item => (
                        <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon size={12} className="text-[var(--accent-primary)] opacity-70" />
                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className="text-sm font-black text-[var(--text-primary)]">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    </div>
);

/* ── Main Page ───────────────────────────────── */
const SectionManagement = () => {
    const [sections, setSections] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editSection, setEditSection] = useState(null);
    const [deleteSection, setDeleteSection] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const getStdId = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        return obj.id || obj._id || (obj['$id'] ? obj['$id'].toString() : null);
    };

    const fetchAll = useCallback(() => {
        setLoading(true);
        Promise.allSettled([
            sectionService.getAll(),
            teacherService.getAll(),
            studentService.getAll()
        ]).then(([secRes, tchRes, stdRes]) => {
            setSections(secRes.status === 'fulfilled' ? (secRes.value.data || []) : []);
            setTeachers(tchRes.status === 'fulfilled' ? (tchRes.value.data || []) : []);
            setStudents(stdRes.status === 'fulfilled' ? (stdRes.value.data || []) : []);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = sections.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.academicYear?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data) => {
        try {
            if (editSection) {
                await sectionService.create({ ...data, id: editSection.id });
            } else {
                await sectionService.create(data);
            }
            fetchAll();
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save section changes.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await sectionService.delete(id);
            fetchAll();
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const getStudentCount = (section) => students.filter(s => s.sectionId === section.id || s.sectionName === section.name).length;
    const getTeacherName = (section) => {
        const tId = section.classTeacherId;
        if (!tId) return null;
        return teachers.find(t => getStdId(t) === tId || t.id === tId || t._id === tId)?.name || null;
    };

    const openEdit = (sec) => { setSelectedSection(null); setEditSection(sec); setModalOpen(true); };

    const branchColor = (branch = '') => {
        if (branch.includes('Computer') || branch.includes('CSE')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (branch.includes('Electronics') || branch.includes('ECE')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        if (branch.includes('Mechanical') || branch.includes('ME')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        if (branch.includes('Civil') || branch.includes('CE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        return 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20';
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Manage Sections</h2>
                        <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                            {sections.length} Sections — Click any card for details
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="text" placeholder="Search sections..."
                            className="bg-white/5 px-5 py-3 rounded-2xl border border-[var(--border-primary)] outline-none focus:border-[var(--accent-primary)]/30 text-sm text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)] w-60"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <button onClick={() => { setEditSection(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-3 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20">
                            <Plus size={16} /> New Section
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="text-center py-24 text-[var(--text-secondary)] animate-pulse font-black uppercase tracking-widest text-xs">Loading Sections...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs opacity-30">No Sections Found — Create One Above</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map(section => {
                            const bc = branchColor(section.branch);
                            const stdCount = getStudentCount(section);
                            const tchName = getTeacherName(section);
                            return (
                                <motion.div key={section.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
                                    className="glass-card-accent border-[var(--border-primary)] p-6 relative overflow-hidden group cursor-pointer hover:border-[var(--accent-primary)]/30 transition-all"
                                    onClick={() => setSelectedSection(section)}>
                                    {/* Decorative corner */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-bl-[80px] -z-0 group-hover:scale-150 transition-transform duration-500" />

                                    {/* Top section */}
                                    <div className="flex items-start justify-between mb-5 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                                            <Layers size={26} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Edit */}
                                            <button onClick={e => { e.stopPropagation(); openEdit(section); }} className="p-2 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all opacity-0 group-hover:opacity-100">
                                                <Edit2 size={13} />
                                            </button>
                                            {/* Delete */}
                                            <button onClick={e => { e.stopPropagation(); setDeleteSection(section); }} className="p-2 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section name */}
                                    <div className="relative z-10 mb-4">
                                        <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{section.name}</h3>
                                        <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bc}`}>
                                            {section.branch || 'No Branch'}
                                        </span>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={12} className="text-[var(--text-secondary)] opacity-50" />
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Sem / Year</p>
                                                <p className="text-xs font-black text-[var(--text-primary)]">
                                                    {section.semester ? `Sem ${section.semester}` : '—'} / {section.year ? `Y${section.year}` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-[var(--text-secondary)] opacity-50" />
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Academic Year</p>
                                                <p className="text-xs font-black text-[var(--text-primary)]">{section.academicYear || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="text-[var(--text-secondary)] opacity-50" />
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Students</p>
                                                <p className="text-xs font-black text-[var(--text-primary)]">{stdCount} / {section.maxCapacity || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-[var(--text-secondary)] opacity-50" />
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Room</p>
                                                <p className="text-xs font-black text-[var(--text-primary)]">{section.classRoom || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Class teacher */}
                                    {tchName && (
                                        <div className="mt-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] flex items-center gap-2 relative z-10">
                                            <Shield size={12} className="text-[var(--accent-primary)] opacity-60" />
                                            <span className="text-[10px] font-black text-[var(--text-secondary)]">Class Teacher: <span className="text-[var(--text-primary)]">{tchName}</span></span>
                                        </div>
                                    )}

                                    {/* View link */}
                                    <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                        <ChevronRight size={12} /> View Full Details
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {modalOpen && (
                    <SectionModal
                        section={editSection}
                        teachers={teachers}
                        onClose={() => { setModalOpen(false); setEditSection(null); }}
                        onSave={handleSave}
                    />
                )}
                {deleteSection && (
                    <DeleteConfirm
                        section={deleteSection}
                        onClose={() => setDeleteSection(null)}
                        onConfirm={() => handleDelete(deleteSection.id)}
                    />
                )}
                {selectedSection && !modalOpen && (
                    <SectionDetailPanel
                        section={selectedSection}
                        onClose={() => setSelectedSection(null)}
                        onEdit={openEdit}
                        studentCount={getStudentCount(selectedSection)}
                        teacherName={getTeacherName(selectedSection)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default SectionManagement;
