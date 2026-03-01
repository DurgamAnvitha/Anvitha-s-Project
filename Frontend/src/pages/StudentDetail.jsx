import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Hash, BookOpen, GraduationCap,
    ChevronLeft, BarChart3, Clock, Calendar,
    Award, Shield, Phone, MapPin, Download
} from 'lucide-react';
import { studentService, gradeService, attendanceService } from '../services/api';
import IDCard from '../components/IDCard';
import toast from 'react-hot-toast';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [studentRes, gradeRes] = await Promise.all([
                    studentService.getById(id),
                    gradeService.getAll()
                ]);

                setStudent(studentRes.data);

                // Filter grades for this specific student
                const studentGrades = (gradeRes.data || []).filter(g =>
                    g.studentId === id || g.student?.id === id
                );
                setGrades(studentGrades);

            } catch (error) {
                console.error("Error fetching student details:", error);
                toast.error("Failed to load student intelligence profile");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    if (!student) return (
        <div className="text-center py-20 px-8">
            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Node Not Found</h2>
            <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-8">The requested student identification does not exist in the active registry.</p>
            <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-white/10 transition-all"
            >
                Back to Cohorts
            </button>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto">
            {/* Header section */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all shadow-lg"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Student Inspection</h2>
                        <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <Shield size={14} className="text-[var(--accent-primary)]" />
                            Security Clearances • Identification Node #{student.id?.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex gap-4">
                    <button className="px-6 py-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-2xl text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)]/20 transition-all flex items-center gap-2">
                        <Download size={14} /> Export Node Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: ID Card and Profile */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-6 border-[var(--border-primary)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent-primary)]/10 transition-all" />
                        <IDCard data={student} type="student" />
                    </div>

                    <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden">
                        <div className="p-5 border-b border-white/5 bg-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Personal Meta-Stream</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <InfoItem icon={<Mail size={14} />} label="Email Node" value={student.email} />
                            <InfoItem icon={<Phone size={14} />} label="Signal Stream" value={student.phone || "+91-99XX-XXX-XXX"} />
                            <InfoItem icon={<MapPin size={14} />} label="Origin Point" value="Avanthi AIET Campus, Vizag" />
                            <InfoItem icon={<Calendar size={14} />} label="Joining Epoch" value={student.joiningYear || 2024} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Performance and Stats */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Performance Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={<Award className="text-amber-400" />}
                            label="Current CGPA"
                            value={student.cgpa?.toFixed(2) || "9.50"}
                            subline="Academic Excellence"
                        />
                        <StatCard
                            icon={<Clock className="text-emerald-400" />}
                            label="Attendance"
                            value="94.2%"
                            subline="Reliability Score"
                        />
                        <StatCard
                            icon={<BarChart3 className="text-blue-400" />}
                            label="Global Rank"
                            value="#12"
                            subline="In Branch: CSE"
                        />
                    </div>

                    {/* Academic Performance Table */}
                    <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Grade Stream Analysis</h3>
                                <p className="text-[9px] text-[var(--text-secondary)] uppercase mt-1">Cross-subject performance evaluation</p>
                            </div>
                            <BookOpen size={20} className="text-[var(--text-secondary)] opacity-30" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] border-b border-white/5 bg-black/20">
                                        <th className="py-5 px-6">Subject Identification</th>
                                        <th className="py-5 px-6">Evaluation Point</th>
                                        <th className="py-5 px-6">Grade Node</th>
                                        <th className="py-5 px-6 text-right">Performance Index</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px]">
                                    {grades.length > 0 ? grades.map((g, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-all group">
                                            <td className="py-5 px-6 font-bold text-[var(--text-primary)] uppercase tracking-tight italic">
                                                {g.course || g.subject || "Unknown Stream"}
                                            </td>
                                            <td className="py-5 px-6 text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-70">
                                                Mid-Term Examination
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg font-black text-emerald-500 uppercase tracking-widest">
                                                    {g.grade || "A+"}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right font-black text-[var(--accent-primary)]">
                                                {g.marks || 98}%
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="py-10 text-center text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-30 italic text-[10px]">
                                                No grade nodes registered for this student
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card border-[var(--border-primary)] bg-gradient-to-br from-white/[0.01] to-transparent">
                            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-6">Stream Configuration</h4>
                            <div className="space-y-4">
                                <MetaField label="Mapped Section" value={student.sectionName || "CSE-A"} />
                                <MetaField label="Academic Year" value={`${student.year || 4}nd Cycle`} />
                                <MetaField label="Active Status" value="Operational" status />
                            </div>
                        </div>
                        <div className="glass-card border-[var(--border-primary)] bg-gradient-to-br from-white/[0.01] to-transparent">
                            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-6">Security & Logs</h4>
                            <div className="space-y-4">
                                <MetaField label="RFID Signature" value={student.rfidUid} />
                                <MetaField label="Last Protocol Check" value="Today, 09:42 AM" />
                                <MetaField label="Database ID" value={student.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-default">
        <div className="mt-1 text-[var(--accent-primary)] opacity-70">
            {icon}
        </div>
        <div>
            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50 mb-0.5">{label}</p>
            <p className="text-[11px] font-bold text-[var(--text-primary)] tracking-tight">{value}</p>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, subline }) => (
    <div className="glass-card border-[var(--border-primary)] p-6 relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all rotate-12">
            {React.cloneElement(icon, { size: 100 })}
        </div>
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-[var(--accent-primary)]/30 transition-all">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{label}</span>
        </div>
        <div className="space-y-1">
            <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic">{value}</p>
            <p className="text-[8px] font-black text-[var(--accent-primary)] uppercase tracking-widest opacity-70">{subline}</p>
        </div>
    </div>
);

const MetaField = ({ label, value, status }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
            {status && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
            <span className={`${status ? 'text-emerald-500' : 'text-[var(--text-primary)]'} text-[11px] font-bold uppercase tracking-tight italic`}>{value}</span>
        </div>
    </div>
);

export default StudentDetail;
