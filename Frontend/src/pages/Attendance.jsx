import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, ShieldAlert, Activity, BarChart3,
    Smartphone, Fingerprint, Calendar, Search, Users, ChevronRight, RefreshCcw, BookOpen, TrendingUp, Bookmark
} from 'lucide-react';
import { attendanceService, studentService, timetableService, sectionService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherSections, setTeacherSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [sectionStudents, setSectionStudents] = useState([]);
    const [markingStatus, setMarkingStatus] = useState({}); // { studentId: 'P' | 'A' }
    const [rfidInput, setRfidInput] = useState('');
    const [pulseSubject, setPulseSubject] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const [attRes, ttRes, userRes] = await Promise.allSettled([
                attendanceService.getAll(),
                user.role === 'TEACHER' ? timetableService.getAll() : Promise.resolve({ data: [] }),
                studentService.getAll()
            ]);

            const allAttendance = attRes.status === 'fulfilled' ? attRes.value.data : [];
            setAttendance(allAttendance);

            const allStudents = userRes.status === 'fulfilled' ? userRes.value.data : [];
            const profile = allStudents.find(s => s.email === user.email);
            setStudentProfile(profile);

            if (user.role === 'TEACHER') {
                const allSlots = ttRes.status === 'fulfilled' ? ttRes.value.data : [];
                // Find teacher's true ID and sections
                const allSections = (await sectionService.getAll()).data;
                const teacherProfile = (await studentService.getAll()).data.find(s => s.role === 'TEACHER' && s.email === user.email);
                const trueTeacherId = teacherProfile ? (teacherProfile.id || teacherProfile._id) : user.id;

                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const myClasses = allSlots.filter(c => (c.teacherId === trueTeacherId || c.instructor === user.name) && c.day === today);
                setTeacherSections(myClasses);
            }
        } catch (error) {
            toast.error("Telemetry Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [user]);

    useEffect(() => {
        if (activeSection) {
            const fetchStudents = async () => {
                try {
                    const sRes = await studentService.getAll();
                    // Match by sectionId or sectionName
                    const filtered = sRes.data.filter(s => s.sectionId === activeSection.sectionId || s.sectionName === activeSection.section);
                    setSectionStudents(filtered);

                    // Pre-check if already marked today
                    const todayStr = new Date().toISOString().split('T')[0];
                    const markedToday = attendance.filter(a => a.date === todayStr && a.subject === activeSection.subject);
                    const statusMap = {};
                    markedToday.forEach(a => {
                        const student = filtered.find(s => s.rfidUid === a.rfidUid);
                        if (student) statusMap[student.id] = a.status;
                    });
                    setMarkingStatus(statusMap);
                } catch (error) {
                    toast.error("Section Registry Sync Failed");
                }
            };
            fetchStudents();
        }
    }, [activeSection, attendance]);

    const handleManualMark = async (student, status) => {
        try {
            if (user.role === 'ADMIN') {
                await attendanceService.adminUpdate({
                    studentId: student.id,
                    subject: activeSection.subject,
                    status: status,
                    date: new Date().toISOString().split('T')[0]
                });
            } else {
                await attendanceService.markManual({
                    studentId: student.id,
                    subject: activeSection.subject,
                    status: status,
                    date: new Date().toISOString().split('T')[0]
                });
            }
            setMarkingStatus(prev => ({ ...prev, [student.id]: status }));
            toast.success(`${student.name} • Protocol ${status === 'P' ? 'PRESENT' : 'ABSENT'} ${user.role === 'ADMIN' ? '(OVERRIDE)' : ''}`);
            fetchAttendance();
        } catch (error) {
            toast.error(error.response?.data?.message || "Transmission Error");
        }
    };

    const handleRfidPulse = async () => {
        if (!rfidInput || !pulseSubject) return toast.error("Identify ID and Subject Node");
        try {
            await attendanceService.markRfid(rfidInput, pulseSubject, 'P');
            toast.success("RFID Pulse Captured • System Synchronized");
            setRfidInput('');
            fetchAttendance();
        } catch (error) {
            toast.error("Biometric Pulse Failed");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Attendance Telemetry</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Smartphone size={14} className="text-[var(--accent-primary)] animate-pulse" />
                        Biometric Link • Real-time Sync
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchAttendance} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[var(--accent-primary)]/10 transition-all">
                        <RefreshCcw size={20} className="text-[var(--accent-primary)]" />
                    </button>
                    {user.role === 'ADMIN' && (
                        <div className="glass-accent px-6 py-2.5 rounded-2xl border border-[var(--accent-primary)]/20 flex items-center gap-3">
                            <Activity size={14} className="text-[var(--accent-primary)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] italic">Simulation Mode Active</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {user.role === 'TEACHER' ? (
                    <div className="lg:col-span-4 space-y-8">
                        {!activeSection ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {teacherSections.length > 0 ? teacherSections.map((sec, i) => (
                                    <motion.div key={i} whileHover={{ y: -5 }} onClick={() => setActiveSection(sec)} className="glass-card-accent border-[var(--border-primary)] p-8 relative overflow-hidden group cursor-pointer">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                            <Calendar size={120} />
                                        </div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-14 h-14 bg-[var(--accent-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xl group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                                                <Users size={28} />
                                            </div>
                                            <span className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-[var(--accent-primary)] border border-white/5 rounded-lg tracking-widest">{sec.time}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic mb-2 leading-none">{sec.section}</h3>
                                        <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest opacity-60 flex items-center gap-2">
                                            <Bookmark size={12} className="text-[var(--accent-primary)]" /> {sec.subject}
                                        </p>
                                        <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] group-hover:translate-x-3 transition-transform">
                                            Open Digital Register <ChevronRight size={16} />
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-40 glass-card border-[var(--border-primary)] text-center opacity-30 italic">
                                        <Clock size={40} className="mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Academic Sessions Detected for Today</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-6">
                                        <button onClick={() => setActiveSection(null)} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 group shadow-xl shadow-black/20">
                                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform" /> Reset Frame
                                        </button>
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">{activeSection.section} Registry</h3>
                                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-1 opacity-60">Authorized Protocol: {activeSection.subject}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden shadow-2xl shadow-black/50">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/40">
                                                <th className="py-6 px-10">Academic Identity</th>
                                                <th className="py-6 px-10">RFID Node Pulse</th>
                                                <th className="py-6 px-10 text-center">Protocol Selection</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[12px]">
                                            {sectionStudents.map((s, i) => (
                                                <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-black text-[var(--accent-primary)] shadow-inner group-hover:scale-110 transition-transform">
                                                                {s.name?.[0] || 'S'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase italic">{s.name}</p>
                                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 mt-1">S_NODE_0{i + 1} / {s.rollNo}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-10 font-mono text-[10px] text-[var(--text-secondary)] tracking-widest group-hover:text-[var(--accent-primary)] transition-colors">{s.rfidUid}</td>
                                                    <td className="py-6 px-10">
                                                        <div className="flex justify-center gap-4">
                                                            <button
                                                                onClick={() => handleManualMark(s, 'P')}
                                                                className={`px-8 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${markingStatus[s.id] === 'P' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/5'}`}
                                                            >
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => handleManualMark(s, 'A')}
                                                                className={`px-8 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${markingStatus[s.id] === 'A' ? 'bg-red-500 text-white shadow-xl shadow-red-500/30' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-red-500/20 hover:text-red-400 border border-white/5'}`}
                                                            >
                                                                Absent
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="lg:col-span-1 space-y-8">
                            {/* Attendance Stats */}
                            <div className="glass-card border-[var(--border-primary)] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><Activity size={80} /></div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-8">Personal Stats</h3>
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <p className="text-6xl font-black text-[var(--text-primary)] tracking-tighter italic mb-2">
                                            {(() => {
                                                const myAtt = attendance.filter(a => (a.rfidUid === studentProfile?.rfidUid || a.student?.rfidUid === studentProfile?.rfidUid || a.studentId === studentProfile?.id || a.student?.id === studentProfile?.id));
                                                return Math.round((myAtt.filter(a => a.status === 'P').length / Math.max(1, myAtt.length)) * 100);
                                            })()}%
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-50">Aggregate Attendance</p>
                                    </div>
                                    <div className="pt-8 border-t border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            <span>Subject Metrics</span>
                                            <TrendingUp size={12} className="text-emerald-500" />
                                        </div>
                                        <div className="h-40">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    { name: 'W1', v: 85 }, { name: 'W2', v: 92 },
                                                    { name: 'W3', v: 88 }, { name: 'W4', v: 95 }
                                                ]}>
                                                    <Area type="monotone" dataKey="v" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.1} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-8">
                            {/* Subject Breakdown */}
                            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden flex flex-col shadow-2xl">
                                <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3 italic">
                                        <BookOpen size={18} className="text-[var(--accent-primary)]" /> Subject Breakdown
                                    </h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...new Set(attendance.filter(a => (a.rfidUid === studentProfile?.rfidUid || a.student?.rfidUid === studentProfile?.rfidUid || a.studentId === studentProfile?.id || a.student?.id === studentProfile?.id)).map(a => a.subject))].map((sub, i) => {
                                        const subAtt = attendance.filter(a => (a.rfidUid === studentProfile?.rfidUid || a.student?.rfidUid === studentProfile?.rfidUid || a.studentId === studentProfile?.id || a.student?.id === studentProfile?.id) && a.subject === sub);
                                        const pct = Math.round((subAtt.filter(a => a.status === 'P').length / Math.max(1, subAtt.length)) * 100);
                                        const isSelected = selectedSubject === sub;
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedSubject(isSelected ? null : sub)}
                                                className={`p-6 rounded-2xl bg-white/[0.02] border transition-all group cursor-pointer ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 shadow-lg shadow-[var(--accent-primary)]/10 scale-[1.02]' : 'border-white/10 hover:border-[var(--accent-primary)]/40'}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic group-hover:text-[var(--accent-primary)] transition-colors">{sub}</h4>
                                                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 mt-1 tracking-widest">{subAtt.length} Lectures Total</p>
                                                    </div>
                                                    <span className={`text-sm font-black italic ${pct >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>{pct}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${pct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {attendance.filter(a => a.rfidUid === user.rfidUid || a.studentId === user.id).length === 0 && (
                                        <div className="col-span-full py-10 opacity-20 italic font-black uppercase text-[10px] tracking-widest text-center">No attendance patterns detected</div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Day-by-day Log */}
                            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden flex flex-col shadow-2xl min-h-[400px]">
                                <div className="p-8 border-b border-white/5 bg-white/5">
                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3 italic">
                                        <Calendar size={18} className="text-orange-500" />
                                        {selectedSubject ? `${selectedSubject} Protocol Log` : 'Day by Day Protocol Log'}
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/40">
                                                <th className="py-6 px-10">Timestamp</th>
                                                <th className="py-6 px-10">Subject Node</th>
                                                <th className="py-6 px-10 text-center">Protocol Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[12px]">
                                            {attendance.filter(a => (a.rfidUid === studentProfile?.rfidUid || a.student?.rfidUid === studentProfile?.rfidUid || a.studentId === studentProfile?.id || a.student?.id === studentProfile?.id))
                                                .filter(a => !selectedSubject || a.subject === selectedSubject)
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map((a, i) => (
                                                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                                        <td className="py-5 px-10 font-mono text-[var(--text-secondary)] text-[10px] opacity-60">
                                                            {new Date(a.date).toLocaleDateString()} • {a.timestamp || '09:00 AM'}
                                                        </td>
                                                        <td className="py-5 px-10 font-black text-[var(--text-primary)] uppercase tracking-tight italic group-hover:text-[var(--accent-primary)] transition-colors">{a.subject}</td>
                                                        <td className="py-5 px-10">
                                                            <div className="flex justify-center">
                                                                <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${a.status === 'P' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                                    {a.status === 'P' ? 'VALIDATED' : 'ABSENT'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Attendance;
