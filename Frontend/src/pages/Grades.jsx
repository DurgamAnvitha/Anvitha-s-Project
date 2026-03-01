import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Search, Calculator, TrendingUp, Award,
    Plus, Edit3, Trash2, Check, X, ShieldAlert, BookOpen, Layers
} from 'lucide-react';
import { gradeService, studentService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Grades = () => {
    const { user } = useAuth();
    const [searchId, setSearchId] = useState('');
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedSem, setSelectedSem] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [newGrade, setNewGrade] = useState({ subject: '', semester: 1, credits: 3, grade: 'O' });
    const [studentProfile, setStudentProfile] = useState(null);
    const [allStudents, setAllStudents] = useState([]);  // for admin dropdown

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    const fetchStudentGrades = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const gRes = await gradeService.getByRfidOrId(id);
            setGrades(gRes.data || []);
            const gpaRes = await gradeService.calculateGPA(id);
            setGpa(gpaRes.data || 0);

            // fetch student profile
            const sRes = await studentService.getAll();
            const profile = sRes.data.find(s => s.id === id || s.rfidUid === id || s.rollNo === id);
            setStudentProfile(profile);
        } catch (error) {
            toast.error('Could not load grades. Check student ID.');
            setGrades([]);
            setGpa(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.role === 'STUDENT') {
            studentService.getAll().then(res => {
                const me = res.data.find(s => s.email === user.email);
                if (me) {
                    setSearchId(me.id);
                    fetchStudentGrades(me.id);
                }
            });
        } else if (user.role === 'ADMIN') {
            // load full student list for the dropdown
            studentService.getAll().then(res => {
                setAllStudents(res.data || []);
            });
        }
    }, [user]);

    const handleAddOrUpdate = async (e) => {
        e.preventDefault();
        if (!searchId) {
            toast.error('Please select a student first before adding a grade.');
            return;
        }
        try {
            if (editingGrade) {
                await gradeService.update(editingGrade.id, newGrade);
                toast.success('Grade updated successfully');
            } else {
                await gradeService.add(null, searchId, newGrade);
                toast.success('Grade added successfully');
            }
            setShowAddModal(false);
            setEditingGrade(null);
            fetchStudentGrades(searchId);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to save grade.';
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this grade record?")) return;
        try {
            await gradeService.delete(id);
            toast.success('Grade deleted');
            fetchStudentGrades(searchId);
        } catch (error) {
            toast.error('Deletion Failed');
        }
    };

    const displayedGrades = grades.filter(g => g.semester === selectedSem);

    const chartData = semesters.map(sem => {
        const semGrades = grades.filter(g => g.semester === sem);
        if (semGrades.length === 0) return { name: `Sem ${sem}`, gpa: 0 };
        const totalPoints = semGrades.reduce((acc, curr) => {
            const map = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };
            return acc + (map[curr.grade] || 0);
        }, 0);
        return { name: `S${sem}`, gpa: (totalPoints / semGrades.length).toFixed(2) };
    });

    if (loading && !grades.length) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Grades & Academic Results</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Award size={14} className="text-[var(--accent-primary)]" />
                        GPA Summary • Semester-wise View
                    </p>
                </div>
                {user.role === 'ADMIN' && (
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-[var(--accent-primary)] transition-all">
                            <Search size={14} className="text-[var(--text-secondary)] shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-[10px] uppercase font-black tracking-widest text-[var(--text-primary)] w-56 cursor-pointer"
                                value={searchId}
                                onChange={e => {
                                    const id = e.target.value;
                                    setSearchId(id);
                                    if (id) fetchStudentGrades(id);
                                    else { setGrades([]); setGpa(0); setStudentProfile(null); }
                                }}
                            >
                                <option value="" className="bg-black">-- Select Student --</option>
                                {allStudents.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#111]">
                                        {s.name} ({s.rollNo || s.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {searchId && (
                            <button
                                onClick={() => { setSearchId(''); setGrades([]); setGpa(0); setStudentProfile(null); }}
                                className="p-2 text-[var(--text-secondary)] hover:text-red-400 transition-colors text-xs"
                                title="Clear selection"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card flex flex-col items-center justify-center py-12 text-center border-[var(--border-primary)] bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] opacity-30 italic">Overall CGPA</div>
                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-[var(--accent-primary)] mb-8 border border-white/10 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-[var(--accent-primary)]/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                            <Calculator size={40} className="relative z-10" />
                        </div>
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-3">Cumulative GPA</h3>
                        <p className="text-7xl font-black bg-gradient-to-br from-white via-white to-[var(--accent-primary)]/50 bg-clip-text text-transparent tracking-tighter leading-none italic">
                            {gpa ? gpa.toFixed(2) : '0.00'}
                        </p>
                        <div className="mt-8 flex items-center gap-3 px-6 py-2.5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Standing: {gpa >= 8.5 ? 'EXCELLENT' : (gpa >= 6.5 ? 'GOOD' : 'NEEDS IMPROVEMENT')}</span>
                        </div>
                    </div>

                    <div className="glass-card border-[var(--border-primary)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] flex items-center gap-2">
                                <TrendingUp size={14} className="text-[var(--accent-primary)]" /> Semester Progress
                            </h3>
                        </div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="gpa" stroke="var(--accent-primary)" strokeWidth={3} fill="url(#gpaGradient)" />
                                    <XAxis dataKey="name" hide />
                                    <Tooltip contentStyle={{ backgroundColor: 'black', border: '1px solid var(--border-primary)', borderRadius: '15px', fontSize: '9px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-3">
                            {studentProfile && (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center font-black text-[var(--accent-primary)] text-xs border border-[var(--accent-primary)]/20 shadow-lg">
                                        {studentProfile.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight italic truncate max-w-[120px]">{studentProfile.name}</p>
                                        <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50">Roll No: {studentProfile.rollNo}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="flex gap-2 bg-white/5 border border-white/10 p-2 rounded-3xl overflow-x-auto custom-scrollbar">
                        {semesters.map(sem => (
                            <button
                                key={sem}
                                onClick={() => setSelectedSem(sem)}
                                className={`flex-1 min-w-[100px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSem === sem ? 'bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                            >
                                Semester {sem}
                            </button>
                        ))}
                    </div>

                    <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden flex flex-col min-h-[550px]">
                        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                <Layers size={18} className="text-[var(--accent-primary)]" /> Subject Results: Semester {selectedSem}
                            </h3>
                            {user.role === 'ADMIN' && (
                                <div className="flex items-center gap-3">
                                    {!searchId && (
                                        <span className="text-[9px] text-yellow-500/70 font-black uppercase tracking-widest italic">
                                            ← Select a student first
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (!searchId) { toast.error('Please select a student from the dropdown above first.'); return; }
                                            setEditingGrade(null);
                                            setNewGrade({ subject: '', semester: selectedSem, credits: 3, grade: 'O' });
                                            setShowAddModal(true);
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${searchId ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                                    >
                                        <Plus size={14} /> New Record
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto custom-scrollbar flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] border-b border-white/5 bg-black/20">
                                        <th className="py-6 px-10">Subject</th>
                                        <th className="py-6 px-10 text-center">Credits</th>
                                        <th className="py-6 px-10 text-center">Grade</th>
                                        {user.role === 'ADMIN' && <th className="py-6 px-10 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-[12px]">
                                    {displayedGrades.length > 0 ? displayedGrades.map((g, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-all group">
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent-primary)] font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
                                                        {g.subject?.[0] || 'M'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[var(--text-primary)] uppercase tracking-tight italic underline decoration-[var(--accent-primary)]/20 decoration-2 underline-offset-4">{g.subject}</p>
                                                        <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 mt-1">Subject {String(i + 1).padStart(2, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 text-center font-mono text-[var(--text-secondary)] font-black tracking-widest">{g.credits} Credits</td>
                                            <td className="py-6 px-10 text-center">
                                                <span className={`px-5 py-2 rounded-2xl font-black text-xs border transition-all ${g.grade === 'O' || g.grade === 'A+' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : (g.grade === 'F' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-[var(--text-primary)] border-white/10')}`}>
                                                    {g.grade}
                                                </span>
                                            </td>
                                            {user.role === 'ADMIN' && (
                                                <td className="py-6 px-10 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingGrade(g); setNewGrade(g); setShowAddModal(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-all">
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(g.id)} className="p-3 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-500/50">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={user.role === 'ADMIN' ? 4 : 3} className="py-32 text-center text-[var(--text-secondary)] uppercase font-black text-[10px] tracking-[0.5em] italic opacity-20">
                                                <ShieldAlert size={40} className="mx-auto mb-4" />
                                                No grades recorded for Semester {selectedSem}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-lg p-10 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <BookOpen size={120} />
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-8 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{editingGrade ? 'Edit Grade' : 'Add Grade'}</h3>
                                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-50 mt-1">Enter subject and grade details</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white transition-colors p-2 bg-white/5 rounded-full"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddOrUpdate} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Subject Name</label>
                                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-[var(--accent-primary)] outline-none transition-all placeholder:opacity-20" placeholder="e.g. Data Structures & Algorithms" value={newGrade.subject} onChange={e => setNewGrade({ ...newGrade, subject: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Term</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--accent-primary)]" value={newGrade.semester} onChange={e => setNewGrade({ ...newGrade, semester: parseInt(e.target.value) })}>
                                            {semesters.map(s => <option key={s} value={s} className="bg-black">SEM {s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">CU (Credits)</label>
                                        <input required type="number" step="0.5" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black text-center outline-none focus:border-[var(--accent-primary)]" value={newGrade.credits} onChange={e => setNewGrade({ ...newGrade, credits: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Grade</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--accent-primary)]" value={newGrade.grade} onChange={e => setNewGrade({ ...newGrade, grade: e.target.value })}>
                                            {['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-[var(--accent-primary)] text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-[var(--accent-primary)]/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    <Check size={20} /> {editingGrade ? 'Save Changes' : 'Add Grade'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Grades;
