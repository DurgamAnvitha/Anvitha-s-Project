import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, MapPin, User, Info, Calendar, Plus, Filter,
    ShieldCheck, Zap, X, Save, Edit2, Trash2, BookOpen
} from 'lucide-react';
import { timetableService, sectionService, teacherService, studentService, attendanceService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { TableSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';

const AttendanceSessionModal = ({ slot, onClose }) => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('MANUAL'); // 'MANUAL' or 'RFID'
    const [saving, setSaving] = useState(false);
    const [rfidBuffer, setRfidBuffer] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await studentService.getAll();
                const allStudents = res.data || [];
                const sectionStudents = allStudents.filter(s =>
                    (s.sectionId === slot.sectionId) ||
                    (s.sectionName === slot.section)
                );
                setStudents(sectionStudents);

                const attMap = {};
                sectionStudents.forEach(s => {
                    const id = s.id || s._id;
                    if (id) attMap[id] = 'A';
                });
                setAttendance(attMap);
            } catch (err) {
                toast.error('Failed to load students for this section');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [slot]);

    useEffect(() => {
        if (mode !== 'RFID') return;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                if (rfidBuffer.trim() !== '') {
                    handleRfidScan(rfidBuffer.trim());
                    setRfidBuffer('');
                }
            } else if (e.key.length === 1) {
                setRfidBuffer(prev => prev + e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, rfidBuffer, students]);

    const handleRfidScan = async (uid) => {
        const student = students.find(s => (s.rfidUid || s.rfid_uid || s.rfid) === uid);
        if (student) {
            const sid = student.id || student._id;
            setAttendance(prev => ({ ...prev, [sid]: 'P' }));
            toast.success(`${student.name} marked Present`);
            try {
                await attendanceService.markRfid(uid, slot.subject, 'P');
            } catch (e) {
                // Silently continue for RFID mode flow
            }
        } else {
            toast.error(`Unknown RFID Card: ${uid}`);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'P' ? 'A' : 'P'
        }));
    };

    const submitManualAttendance = async () => {
        setSaving(true);
        try {
            const promises = Object.entries(attendance).map(([studentId, status]) => {
                return attendanceService.markManual({
                    studentId,
                    subject: slot.subject,
                    status
                });
            });
            await Promise.all(promises);
            toast.success('Attendance submitted successfully');
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to submit attendance';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-2xl p-8 border-[var(--border-primary)] relative max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(var(--accent-primary-rgb),0.2)]">
                <button onClick={onClose} className="absolute right-6 top-6 text-[var(--text-secondary)] hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Mark Attendance</h2>
                    <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] mt-1">{slot.subject} • {slot.section}</p>

                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setMode('MANUAL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'MANUAL' ? 'bg-[var(--accent-primary)] text-white shadow-[0_5px_15px_rgba(255,100,0,0.2)]' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}>Manual Roll Call</button>
                        <button onClick={() => setMode('RFID')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'RFID' ? 'bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}>
                            <Zap size={14} className={mode === 'RFID' ? 'animate-pulse' : ''} /> RFID Scanner Mode
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-10">
                        <div className="w-8 h-8 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <>
                        {mode === 'RFID' && (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/30 rounded-2xl bg-emerald-500/5 mb-6 p-10 flex-shrink-0">
                                <Zap size={48} className="text-emerald-500 animate-pulse mb-6" />
                                <p className="text-lg font-black text-white uppercase tracking-widest text-center">Ready for Scan</p>
                                <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mt-2 text-center">Please tap student RFID card on the reader to mark 'Present'<br />(Listening for scanner input globally...)</p>
                                <input autoFocus className="opacity-0 absolute w-0 h-0" />
                            </div>
                        )}

                        <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 ${mode === 'RFID' ? 'hidden' : ''}`}>
                            {students.length === 0 ? (
                                <p className="text-[10px] text-center uppercase tracking-widest text-[var(--text-secondary)] opacity-50 py-10 font-black italic">No students allocated to this section.</p>
                            ) : (
                                students.map(s => {
                                    const sid = s.id || s._id;
                                    const isPresent = attendance[sid] === 'P';
                                    return (
                                        <div key={sid} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isPresent ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs shadow-lg ${isPresent ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-[12px] uppercase italic tracking-tight">{s.name}</p>
                                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">{s.rollNo} • RFID: {s.rfidUid || s.rfid_uid || s.rfid || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => toggleAttendance(sid)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:brightness-110' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                                                {isPresent ? 'PRESENT' : 'ABSENT'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {mode === 'MANUAL' && students.length > 0 && (
                            <div className="pt-6 border-t border-white/10 mt-2 flex-shrink-0">
                                <button onClick={submitManualAttendance} disabled={saving} className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(var(--accent-primary-rgb),0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                                    {saving ? 'Transmitting Data...' : 'Submit Session Attendance'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};


const TimetableModal = ({ slot, onClose, onSave }) => {
    const [form, setForm] = useState(
        slot || {
            time: '', subject: '', instructor: '', teacherId: '',
            room: '', type: 'Lecture', section: '', sectionId: '', day: 'Monday', semester: 'Sem 1'
        }
    );
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Self-fetch sections and teachers so dropdowns always work
    useEffect(() => {
        const load = async () => {
            setLoadingData(true);
            try {
                const [secRes, tRes] = await Promise.all([
                    sectionService.getAll(),
                    teacherService.getAll()
                ]);
                setSections(secRes.data || []);
                setTeachers(tRes.data || []);
            } catch (e) {
                toast.error('Could not load sections/teachers. Check backend connection.');
            }
            setLoadingData(false);
        };
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sectionId) { toast.error('Please select a section'); return; }
        if (!form.teacherId) { toast.error('Please select a teacher'); return; }
        setSaving(true);
        try {
            await onSave(form);
        } catch (err) {
            toast.error('Failed to save. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="glass-card-accent w-full max-w-lg p-10 border-[var(--border-primary)] relative shadow-[0_0_100px_rgba(var(--accent-primary-rgb),0.2)]">
                <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                        {slot ? 'Edit Class Slot' : 'Add Class Slot'}
                    </h2>
                    <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] mt-2">Fill in the class schedule details</p>
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center py-16 flex-col gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Loading teachers & sections...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">Day</label>
                                <select required value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)] transition-all">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">Time (e.g. 09:00 - 10:30)</label>
                                <input required type="text" placeholder="09:00 - 10:30" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)] placeholder:opacity-20" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">Subject Name</label>
                            <input required type="text" placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)]" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">
                                    Section {sections.length > 0 ? `(${sections.length} available)` : '(loading...)'}
                                </label>
                                <select required value={form.sectionId} onChange={e => {
                                    const sec = sections.find(s => s.id === e.target.value);
                                    setForm({ ...form, sectionId: e.target.value, section: sec ? sec.name : '' });
                                }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--accent-primary)]">
                                    <option value="" disabled className="bg-black">-- Select Section --</option>
                                    {sections.map(s => <option key={s.id} value={s.id} className="bg-[#111]">{s.name} ({s.branch})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">
                                    Teacher {teachers.length > 0 ? `(${teachers.length} available)` : '(loading...)'}
                                </label>
                                <select required value={form.teacherId} onChange={e => {
                                    const t = teachers.find(t => t.id === e.target.value);
                                    setForm({ ...form, teacherId: e.target.value, instructor: t ? t.name : '' });
                                }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--accent-primary)]">
                                    <option value="" disabled className="bg-black">-- Select Teacher --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id} className="bg-[#111]">{t.name} ({t.subject || t.department || 'Faculty'})</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">Room / Location</label>
                                <input required type="text" placeholder="e.g. B-201" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 opacity-50">Class Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase text-white outline-none focus:border-[var(--accent-primary)]">
                                    {['Lecture', 'Lab', 'Tutorial', 'Seminar'].map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-all bg-white/5">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 px-8 py-4 bg-[var(--accent-primary)] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[var(--accent-primary)]/40 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                                {saving ? 'Saving...' : (slot ? 'Update Schedule' : 'Add to Schedule')}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

const Timetable = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [selectedSlotForAttendance, setSelectedSlotForAttendance] = useState(null);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            let res;
            if (user.role === 'ADMIN') {
                res = await timetableService.getAll();
                const [secRes, tRes] = await Promise.all([sectionService.getAll(), teacherService.getAll()]);
                setSections(secRes.data || []);
                setTeachers(tRes.data || []);
            } else if (user.role === 'TEACHER') {
                // Resolve teacher's MongoDB ID from email
                const tRes = await teacherService.getAll();
                const allTeachers = tRes.data || [];
                setSections([]);
                setTeachers(allTeachers);
                const me = allTeachers.find(t => t.email === user.email);
                if (me) {
                    res = await timetableService.getByTeacher(me.id);
                } else {
                    res = await timetableService.getAll(); // fallback
                }
            } else {
                // Student: look up their section by name or ID
                const [sRes, secRes] = await Promise.all([
                    studentService.getAll(),
                    sectionService.getAll()
                ]);
                const me = sRes.data?.find(s => s.email === user.email || s.rollNo === user.username);
                const allSections = secRes.data || [];
                const mySection = allSections.find(s => s.id === me?.sectionId || s.name === me?.sectionName);
                const targetSectionId = mySection ? (mySection.id || mySection._id) : me?.sectionId;

                if (targetSectionId) {
                    res = await timetableService.getBySection(targetSectionId);
                } else {
                    res = { data: [] };
                }
            }
            const fetched = res?.data || [];
            const sorted = fetched.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            setSchedule(sorted);
        } catch (err) {
            toast.error("Failed to load timetable. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [user]);

    const handleSave = async (slotData) => {
        try {
            if (slotData.id) {
                await timetableService.updateSlot(slotData.id, slotData);
                toast.success('Schedule updated successfully');
            } else {
                await timetableService.createSlot(slotData);
                toast.success('Class slot added successfully');
            }
            setIsModalOpen(false);
            fetchTimetable();
        } catch (error) { throw error; }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this class slot?")) return;
        try {
            await timetableService.deleteSlot(id);
            toast.success("Class slot deleted");
            fetchTimetable();
        } catch (error) { toast.error("Delete failed"); }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const filteredSchedule = selectedSection ? schedule.filter(s => s.section === selectedSection) : schedule;

    if (loading) return <div className="p-8"><TableSkeleton /></div>;

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4">
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Class Schedule</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <Zap size={14} className="text-[var(--accent-primary)] animate-pulse" />
                        Weekly timetable • {user.role} View
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {user.role === 'ADMIN' && (
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-[2rem] border border-[var(--border-primary)] backdrop-blur-xl">
                            <Filter size={16} className="text-[var(--accent-primary)]" />
                            <select className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value="" className="bg-black">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.name} className="bg-black">{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    {user.role === 'ADMIN' && (
                        <button onClick={() => { setEditingSlot(null); setIsModalOpen(true); }} className="flex items-center gap-3 px-8 py-4 bg-[var(--accent-primary)] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.3)] hover:scale-105 transition-all">
                            <Plus size={18} /> Add Class
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-16">
                {days.map(day => {
                    const daySlots = filteredSchedule.filter(s => s.day === day);
                    if (daySlots.length === 0 && user.role !== 'ADMIN') return null;

                    return (
                        <div key={day} className="space-y-8">
                            <div className="flex items-center gap-6 group">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic group-hover:text-[var(--accent-primary)] transition-colors">{day}</h3>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {daySlots.length > 0 ? daySlots.map((item, i) => (
                                    <motion.div key={i} whileHover={{ x: 10 }}
                                        onClick={(e) => {
                                            if (user.role === 'TEACHER') {
                                                if (e.target.closest('button')) return; // ignore edit/delete clicks
                                                setSelectedSlotForAttendance(item);
                                            }
                                        }}
                                        className={`glass-card-accent border-[var(--border-primary)] p-0 flex flex-col lg:flex-row lg:items-center gap-8 relative group overflow-hidden ${user.role === 'TEACHER' ? 'cursor-pointer hover:border-[var(--accent-primary)]/50' : ''}`}
                                    >
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                        <div className="flex flex-col items-center justify-center p-8 bg-white/5 min-w-[200px] border-r border-white/5 group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                                            <Clock size={24} className="text-[var(--accent-primary)] mb-4" />
                                            <span className="text-sm font-black text-[var(--text-primary)] tracking-widest uppercase">{item.time}</span>
                                            <span className="text-[8px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] mt-2 opacity-60">Time Slot</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 px-8 py-6 items-center">
                                            <div className="lg:col-span-1">
                                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-1 italic group-hover:text-[var(--accent-primary)] transition-all leading-none mb-3">{item.subject}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest">{item.type}</span>
                                                    <span className="px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg text-[8px] font-black uppercase text-[var(--accent-primary)] tracking-widest">{item.section}</span>
                                                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest">{item.semester}</span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <User size={16} className="text-[var(--accent-primary)]" />
                                                    <span className="text-[11px] font-black uppercase italic text-[var(--text-primary)]">{item.instructor}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={16} className="text-[var(--text-secondary)] opacity-50" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">{item.room}</span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2 px-6 py-2 border border-emerald-500/10 bg-emerald-500/[0.02] rounded-2xl">
                                                    <ShieldCheck size={18} className="text-emerald-500 animate-pulse" />
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest opacity-60">Active</span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 flex items-center justify-end gap-3 px-2">
                                                {user.role === 'ADMIN' && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingSlot(item); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-2xl hover:bg-[var(--accent-primary)] hover:text-white transition-all">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/10 text-red-500/50 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-10 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center opacity-20">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No classes scheduled for {day}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isModalOpen && <TimetableModal slot={editingSlot} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
                {selectedSlotForAttendance && <AttendanceSessionModal slot={selectedSlotForAttendance} onClose={() => setSelectedSlotForAttendance(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default Timetable;
