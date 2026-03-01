import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Search, Edit2, Trash2, X, Save,
    Mail, Lock, Phone, BookOpen, Hash, User,
    Briefcase, Calendar, GraduationCap, AlertTriangle, ChevronRight
} from 'lucide-react';
import { teacherService } from '../../services/api';
import IDCard from '../../components/IDCard';

const EMPTY_FORM = {
    name: '', email: '', password: '', phone: '',
    department: '', designation: '', employeeId: '',
    joiningDate: '', qualification: ''
};

/* ── Add / Edit Modal ─────────────────────────────────── */
const TeacherModal = ({ teacher, onClose, onSave }) => {
    const [form, setForm] = useState(teacher ? { ...teacher, password: '' } : { ...EMPTY_FORM });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) return alert('Name and Email are required');
        setLoading(true);
        try { await onSave(form); onClose(); }
        catch (err) { alert(err.response?.data?.message || 'Operation failed.'); }
        finally { setLoading(false); }
    };

    const fields = [
        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Dr. Ravi Kumar', icon: User },
        { label: 'Employee ID', name: 'employeeId', type: 'text', placeholder: 'EMP-001', icon: Hash },
        { label: 'Email Address', name: 'email', type: 'email', placeholder: 'teacher@avanthi.edu.in', icon: Mail },
        { label: teacher ? 'New Password (leave blank to keep)' : 'Password', name: 'password', type: 'password', placeholder: '••••••••', icon: Lock },
        { label: 'Phone', name: 'phone', type: 'text', placeholder: '+91 9XXXXXXXXX', icon: Phone },
        { label: 'Department', name: 'department', type: 'text', placeholder: 'e.g. CSE, ECE, ME', icon: BookOpen },
        { label: 'Designation', name: 'designation', type: 'text', placeholder: 'e.g. Professor, Asst. Professor', icon: Briefcase },
        { label: 'Qualification', name: 'qualification', type: 'text', placeholder: 'e.g. M.Tech, Ph.D', icon: GraduationCap },
        { label: 'Joining Date', name: 'joiningDate', type: 'date', placeholder: '', icon: Calendar },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card-accent w-full max-w-lg p-8 border-[var(--border-primary)] relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button onClick={onClose} className="absolute top-5 right-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-6">
                    {teacher ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] pl-1 block mb-1">{field.label}</label>
                            <div className="relative">
                                <field.icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                                <input
                                    type={field.type} name={field.name} value={form[field.name] || ''}
                                    onChange={handleChange} placeholder={field.placeholder}
                                    className="w-full bg-white/5 border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                                />
                            </div>
                        </div>
                    ))}
                    <button type="submit" disabled={loading}
                        className="w-full mt-2 py-3 bg-[var(--accent-primary)] hover:brightness-110 rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        <Save size={16} /> {loading ? 'Saving...' : teacher ? 'Update Teacher' : 'Add Teacher'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

/* ── Delete Confirm ───────────────────────────────────── */
const DeleteConfirmModal = ({ teacher, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-sm p-8 border-red-500/30">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter">Confirm Delete</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-bold">Remove <span className="text-[var(--text-primary)]">{teacher.name}</span>? This cannot be undone.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-xs uppercase tracking-widest hover:bg-white/5">Cancel</button>
                        <button disabled={loading}
                            onClick={async () => { setLoading(true); try { await onConfirm(); onClose(); } catch { alert('Delete failed'); setLoading(false); } }}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-black text-white text-xs uppercase tracking-widest disabled:opacity-50">
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>

                {/* ID Card */}
                <div className="border-t border-white/5 pt-6 mx-8 mb-8">
                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4">🪪 ID Card</h3>
                    <IDCard type="teacher" data={teacher} />
                </div>
            </motion.div>
        </div>
    );
};

/* ── Teacher Detail Panel ─────────────────────────────── */
const TeacherDetailPanel = ({ teacher, onClose, onEdit }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="h-full w-full md:w-[420px] glass-card-accent overflow-y-auto custom-scrollbar border-l border-[var(--border-primary)]"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)] p-6 flex items-center justify-between z-10">
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Teacher Profile</span>
                <div className="flex gap-3">
                    <button onClick={() => onEdit(teacher)} className="px-4 py-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)]/20 flex items-center gap-1.5">
                        <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
                </div>
            </div>
            <div className="p-8 space-y-8">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] font-black text-4xl">
                        {teacher.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">{teacher.name}</h2>
                        <p className="text-[var(--text-secondary)] text-xs font-bold mt-1">{teacher.designation || 'Faculty'}</p>
                        <span className="mt-2 inline-block px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full text-[10px] font-black uppercase tracking-widest">
                            {teacher.department || 'No Dept'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Employee ID', value: teacher.employeeId || '—', icon: Hash },
                        { label: 'Email', value: teacher.email || '—', icon: Mail },
                        { label: 'Phone', value: teacher.phone || '—', icon: Phone },
                        { label: 'Qualification', value: teacher.qualification || '—', icon: GraduationCap },
                        { label: 'Department', value: teacher.department || '—', icon: BookOpen },
                        { label: 'Joining Date', value: teacher.joiningDate || '—', icon: Calendar },
                    ].map(item => (
                        <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon size={12} className="text-[var(--accent-primary)] opacity-70" />
                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className="text-sm font-black text-[var(--text-primary)] truncate">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    </div>
);

/* ── Main Teachers Page ───────────────────────────────── */
const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [deleteTeacher, setDeleteTeacher] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const fetchTeachers = useCallback(() => {
        setLoading(true);
        teacherService.getAll().then(res => setTeachers(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const filtered = teachers.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data) => {
        if (editTeacher) { await teacherService.update(editTeacher.id, data); }
        else { await teacherService.create(data); }
        fetchTeachers();
    };

    const openEdit = (teacher) => { setSelectedTeacher(null); setEditTeacher(teacher); setModalOpen(true); };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Teachers</h2>
                        <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                            {teachers.length} Faculty Members — Click row for details
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-[var(--border-primary)] focus-within:border-[var(--accent-primary)]/30 transition-all group w-72">
                            <Search size={16} className="text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)]" />
                            <input type="text" placeholder="Search by name, dept, ID..."
                                className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button onClick={() => { setEditTeacher(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-3 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20 border border-white/10">
                            <UserPlus size={16} /> Add Teacher
                        </button>
                    </div>
                </div>

                <div className="glass-card-accent bg-white/[0.01] border-[var(--border-primary)] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-primary)]">
                                    <th className="px-8 py-5">Name</th>
                                    <th className="px-6 py-5">Emp. ID</th>
                                    <th className="px-6 py-5">Department</th>
                                    <th className="px-6 py-5">Designation</th>
                                    <th className="px-6 py-5">Email</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-24 text-[var(--text-secondary)] italic font-black uppercase tracking-[0.4em] opacity-30 animate-pulse">Loading Faculty...</td></tr>
                                ) : filtered.length > 0 ? filtered.map(teacher => (
                                    <tr key={teacher.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--accent-primary)]/5 transition-all cursor-pointer"
                                        onClick={() => setSelectedTeacher(teacher)}>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] font-black text-lg border border-[var(--accent-primary)]/10">
                                                    {teacher.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--text-primary)] uppercase tracking-tight">{teacher.name}</p>
                                                    <p className="text-[9px] text-[var(--text-secondary)] font-bold flex items-center gap-1 mt-0.5">
                                                        <ChevronRight size={10} className="opacity-50" /> View Profile
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] font-bold">{teacher.employeeId || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-black uppercase">
                                                {teacher.department || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] font-bold text-xs">{teacher.designation || '—'}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] font-bold text-xs">{teacher.email || '—'}</td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(teacher)} className="p-2.5 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all"><Edit2 size={14} /></button>
                                                <button onClick={() => setDeleteTeacher(teacher)} className="p-2.5 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-24 text-[var(--text-secondary)] italic font-black uppercase tracking-[0.4em] opacity-30">No Teachers Found — Add One Above</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {modalOpen && <TeacherModal teacher={editTeacher} onClose={() => { setModalOpen(false); setEditTeacher(null); }} onSave={handleSave} />}
                {deleteTeacher && <DeleteConfirmModal teacher={deleteTeacher} onClose={() => setDeleteTeacher(null)} onConfirm={async () => { await teacherService.remove(deleteTeacher.id); setTeachers(p => p.filter(t => t.id !== deleteTeacher.id)); }} />}
                {selectedTeacher && !modalOpen && <TeacherDetailPanel teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} onEdit={openEdit} />}
            </AnimatePresence>
        </>
    );
};

export default Teachers;
