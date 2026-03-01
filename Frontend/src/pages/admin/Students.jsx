import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Search, Edit2, Trash2, X, Save, Shield,
    AlertTriangle, Mail, Lock, GraduationCap, BookOpen,
    Hash, User, ChevronRight, BarChart2, Layers
} from 'lucide-react';
import { studentService, gradeService, attendanceService } from '../../services/api';
import IDCard from '../../components/IDCard';

const EMPTY_FORM = { name: '', rollNo: '', rfidUid: '', branch: '', year: '', email: '', password: '', joiningYear: '', passingYear: '', sectionName: '', cgpa: '' };

/* ─── Add / Edit Modal ──────────────────────────────────── */
const StudentModal = ({ student, onClose, onSave }) => {
    const [form, setForm] = useState(student ? { ...student, password: '' } : { ...EMPTY_FORM });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.rollNo) return alert('Name and Roll No are required');
        setLoading(true);
        try {
            await onSave({
                ...form,
                year: parseInt(form.year) || 1,
                joiningYear: parseInt(form.joiningYear) || 0,
                passingYear: parseInt(form.passingYear) || 0,
                cgpa: parseFloat(form.cgpa) || 0
            });
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Operation failed. Check if RFID UID is unique.');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. Ravi Kumar', icon: User },
        { label: 'Roll Number', name: 'rollNo', type: 'text', placeholder: 'e.g. 21A91A0501', icon: Hash },
        { label: 'Branch', name: 'branch', type: 'text', placeholder: 'e.g. CSE, ECE, ME', icon: BookOpen },
        { label: 'Year (1-4)', name: 'year', type: 'number', placeholder: '1', icon: GraduationCap },
        { label: 'Joining Year', name: 'joiningYear', type: 'number', placeholder: 'e.g. 2022', icon: GraduationCap },
        { label: 'Passing Year', name: 'passingYear', type: 'number', placeholder: 'e.g. 2026', icon: GraduationCap },
        { label: 'RFID UID', name: 'rfidUid', type: 'text', placeholder: 'RFID card UID', icon: Shield },
        { label: 'Section Name', name: 'sectionName', type: 'text', placeholder: 'e.g. CSE-A', icon: Layers },
        { label: 'Current CGPA', name: 'cgpa', type: 'number', placeholder: 'e.g. 9.5', icon: BarChart2 },
        { label: 'Email Address', name: 'email', type: 'email', placeholder: 'student@example.com', icon: Mail },
        { label: student ? 'New Password (leave blank to keep)' : 'Password', name: 'password', type: 'password', placeholder: '••••••••', icon: Lock },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card-accent w-full max-w-lg p-8 border-[var(--border-primary)] relative overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-5 right-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-6">
                    {student ? '✏️ Edit Student Record' : '➕ Add New Student'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] pl-1 block mb-1">{field.label}</label>
                            <div className="relative">
                                <field.icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={form[field.name] || ''}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    min={field.name === 'year' ? 1 : undefined}
                                    max={field.name === 'year' ? 4 : undefined}
                                    className="w-full bg-white/5 border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 bg-[var(--accent-primary)] hover:brightness-110 rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all shadow-lg shadow-[var(--accent-primary)]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

/* ─── Delete Confirm ─────────────────────────────────────── */
const DeleteConfirmModal = ({ student, onClose, onConfirm }) => {
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
                    <p className="text-sm text-[var(--text-secondary)] font-bold">
                        Remove <span className="text-[var(--text-primary)]">{student.name}</span>? This cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                        <button
                            disabled={loading}
                            onClick={async () => { setLoading(true); try { await onConfirm(); onClose(); } catch { alert('Delete failed'); setLoading(false); } }}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-black text-white text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── Student Detail Panel ───────────────────────────────── */
const StudentDetailPanel = ({ student, onClose, onEdit }) => {
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
        if (!student) return;
        setLoadingDetails(true);
        // Use student.id as primary lookup key (MongoDB _id)
        const lookupId = student.id || student.rfidUid;
        Promise.allSettled([
            gradeService.getByRfidOrId(lookupId),
            gradeService.calculateGPA(lookupId),
        ]).then(([gradesRes, gpaRes]) => {
            if (gradesRes.status === 'fulfilled') setGrades(gradesRes.value.data || []);
            if (gpaRes.status === 'fulfilled') setGpa(gpaRes.value.data ?? null);
        }).finally(() => setLoadingDetails(false));
    }, [student]);

    const displayGpa = student.cgpa > 0
        ? student.cgpa
        : (gpa !== null ? Number(gpa).toFixed(2) : 'N/A');

    const yearLabels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="h-full md:h-auto md:max-h-[90vh] w-full md:w-[480px] glass-card-accent overflow-y-auto custom-scrollbar border-l border-[var(--border-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top bar */}
                <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)] p-6 flex items-center justify-between z-10">
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Student Profile</span>
                    <div className="flex gap-3">
                        <button onClick={() => onEdit(student)} className="px-4 py-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)]/20 transition-all flex items-center gap-1.5">
                            <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] font-black text-4xl">
                            {student.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">{student.name}</h2>
                            <p className="text-[var(--text-secondary)] text-xs font-bold mt-1">{student.rollNo || 'No Roll No'}</p>
                            <span className="mt-2 inline-block px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full text-[10px] font-black uppercase tracking-widest">
                                {student.branch} • {yearLabels[student.year] || `Year ${student.year}`}
                            </span>
                        </div>
                    </div>

                    {/* CGPA Highlight */}
                    <div className="p-6 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-center">
                        <p className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-1.5">
                            <BarChart2 size={12} /> Overall CGPA
                        </p>
                        <p className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter">
                            {loadingDetails ? '...' : displayGpa}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Email', value: student.email || 'Not Set', icon: Mail },
                            { label: 'RFID UID', value: student.rfidUid || 'Unassigned', icon: Shield },
                            { label: 'Branch', value: student.branch || '—', icon: BookOpen },
                            { label: 'Year', value: yearLabels[student.year] || '—', icon: GraduationCap },
                            { label: 'Joining Year', value: student.joiningYear || '—', icon: GraduationCap },
                            { label: 'Passing Year', value: student.passingYear || '—', icon: GraduationCap },
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

                    {/* Grades Table */}
                    <div>
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <BookOpen size={12} /> Subject Grades
                        </h3>
                        {loadingDetails ? (
                            <p className="text-[var(--text-secondary)] text-xs text-center animate-pulse py-8">Loading grades...</p>
                        ) : grades.length > 0 ? (
                            <div className="space-y-2">
                                {grades.map((g, i) => (
                                    <div key={g.id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-all">
                                        <div>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{g.subject || `Subject ${i + 1}`}</span>
                                            <span className="text-[10px] text-[var(--text-secondary)] ml-2">Sem {g.semester} • {g.credits} Credits</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${g.grade === 'O' || g.grade === 'A+' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            g.grade === 'F' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20'
                                            }`}>
                                            {g.grade || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[var(--text-secondary)] text-xs font-bold italic opacity-40">No grade records available</div>
                        )}
                    </div>

                    {/* ID Card */}
                    <div className="border-t border-white/5 pt-6">
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4">🪪 ID Card</h3>
                        <IDCard type="student" data={student} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── Main Students Page ─────────────────────────────────── */
const Students = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const fetchStudents = useCallback(() => {
        setLoading(true);
        studentService.getAll()
            .then(res => setStudents(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rfidUid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data) => {
        if (editStudent) {
            await studentService.update(editStudent.id, data);
        } else {
            await studentService.create(data);
        }
        fetchStudents();
    };

    const handleDelete = async (id) => {
        await studentService.remove(id);
        setStudents(prev => prev.filter(s => s.id !== id));
    };

    const openEdit = (student) => {
        setSelectedStudent(null);
        setEditStudent(student);
        setModalOpen(true);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Total Students</h2>
                        <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                            {students.length} Enrolled — Click any row for details
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-[var(--border-primary)] focus-within:border-[var(--accent-primary)]/30 transition-all group w-72">
                            <Search size={16} className="text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)]" />
                            <input
                                type="text"
                                placeholder="Search by name, roll no, email..."
                                className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setEditStudent(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-3 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20 border border-white/10"
                        >
                            <UserPlus size={16} /> Add Student
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card-accent bg-white/[0.01] border-[var(--border-primary)] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-primary)]">
                                    <th className="px-8 py-5">Name</th>
                                    <th className="px-6 py-5">Roll No</th>
                                    <th className="px-6 py-5">Email</th>
                                    <th className="px-6 py-5">Branch / Year</th>
                                    <th className="px-6 py-5">RFID UID</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-24 text-[var(--text-secondary)] italic font-black uppercase tracking-[0.4em] opacity-30 animate-pulse">Loading Registry...</td></tr>
                                ) : filtered.length > 0 ? filtered.map(student => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-[var(--border-primary)] hover:bg-[var(--accent-primary)]/5 transition-all group cursor-pointer"
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] font-black text-lg border border-[var(--accent-primary)]/10">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--text-primary)] uppercase tracking-tight">{student.name}</p>
                                                    <p className="text-[9px] text-[var(--text-secondary)] font-bold flex items-center gap-1 mt-0.5">
                                                        <ChevronRight size={10} className="opacity-50" /> View Profile
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] font-bold">{student.rollNo || '—'}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] font-bold text-xs">{student.email || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-black uppercase">
                                                {student.branch} · Y{student.year}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-[var(--border-primary)] w-fit">
                                                <Shield size={11} className="text-[var(--accent-primary)] opacity-60" />
                                                <span className="font-mono text-[10px] text-[var(--text-primary)] font-black">{student.rfidUid || 'UNASSIGNED'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(student)} className="p-2.5 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => setDeleteStudent(student)} className="p-2.5 rounded-xl bg-white/5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-24 text-[var(--text-secondary)] italic font-black uppercase tracking-[0.4em] opacity-30">No Students Found — Add One Above</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {modalOpen && (
                    <StudentModal
                        student={editStudent}
                        onClose={() => { setModalOpen(false); setEditStudent(null); }}
                        onSave={handleSave}
                    />
                )}
                {deleteStudent && (
                    <DeleteConfirmModal
                        student={deleteStudent}
                        onClose={() => setDeleteStudent(null)}
                        onConfirm={() => handleDelete(deleteStudent.id)}
                    />
                )}
                {selectedStudent && !modalOpen && (
                    <StudentDetailPanel
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                        onEdit={openEdit}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Students;
