import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, BarChart3, Users, BookOpen,
    MessageSquare, MessageCircle, Award, ClipboardList, ChevronRight, ChevronLeft,
    Activity, Zap, TrendingUp, CheckCircle, AlertCircle, Phone, Mail, Building2, Briefcase,
    Library, Wallet, X, Info
} from 'lucide-react';
import { dashboardService, studentService, timetableService, assignmentService, sectionService, teacherService, gradeService, queryService } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '../components/Skeletons';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Efficiency Optimized States
    const [studentData, setStudentData] = useState(null);
    const [attendancePercent, setAttendancePercent] = useState(0);
    const [cGPA, setCGPA] = useState(0);
    const [classes, setClasses] = useState([]);
    const [placementDrives, setPlacementDrives] = useState([]);
    const [activeDriveIndex, setActiveDriveIndex] = useState(0);
    const [booksLentCount, setBooksLentCount] = useState(0);
    const [pendingFeeAmount, setPendingFeeAmount] = useState(0);
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [fees, setFees] = useState([]);

    // Modal states
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showFeeModal, setShowFeeModal] = useState(false);

    // Teacher specific states
    const [teacherStudents, setTeacherStudents] = useState([]);
    const [pendingQueries, setPendingQueries] = useState(0);
    const [activeAssignments, setActiveAssignments] = useState(0);
    const [uniqueSections, setUniqueSections] = useState([]);

    const GRADE_MAP = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const fetchDashboardAggregated = async () => {
        setLoading(true);
        try {
            if (user.role === 'STUDENT') {
                const res = await dashboardService.getStudentData(user.username || user.email);
                if (res.data) {
                    const d = res.data;
                    setStudentData(d.student);
                    setAttendancePercent(d.attendancePercent || 0);
                    setBooksLentCount(d.booksLentCount || 0);
                    setPendingFeeAmount(d.pendingFeeAmount || 0);
                    setIssuedBooks(d.issuedBooks || []);
                    setFees(d.fees || []);
                    setClasses(d.todayClasses || []);
                    setPlacementDrives(d.placementDrives || []);

                    try {
                        const libRes = await dashboardService.getBooks(); // get raw books to map title
                        const bks = libRes.data || [];
                        const mappedIssues = (d.issuedBooks || []).map(issue => {
                            const b = bks.find(bk => (bk.bookId || bk.id) === issue.bookId);
                            return {
                                ...issue,
                                title: b ? b.title : 'Unknown Asset',
                            }
                        });
                        setIssuedBooks(mappedIssues);
                    } catch (e) {
                        setIssuedBooks(d.issuedBooks || []);
                    }

                    // GPA Calculation
                    if (d.grades && d.grades.length > 0) {
                        const total = d.grades.reduce((acc, g) => acc + (GRADE_MAP[g.grade] || 0), 0);
                        setCGPA((total / d.grades.length).toFixed(2));
                    }
                }
            } else if (user.role === 'TEACHER') {
                const [sRes, qRes, ttRes, asgRes, secRes] = await Promise.allSettled([
                    studentService.getAll(),
                    queryService.getAll(),
                    timetableService.getAll(),
                    assignmentService.getByTeacher(user.username || user.email),
                    sectionService.getAll(),
                ]);

                const students = sRes.status === 'fulfilled' ? sRes.value.data : [];
                const allQueries = qRes.status === 'fulfilled' ? qRes.value.data : [];
                setPendingQueries(allQueries.filter(q => q.status === 'PENDING').length);

                const allSlots = ttRes.status === 'fulfilled' ? ttRes.value.data : [];
                const mySlots = allSlots.filter(s =>
                    s.instructor?.toLowerCase().includes(user.name?.toLowerCase()) ||
                    s.instructor?.toLowerCase().includes(user.username?.toLowerCase())
                );
                setClasses(mySlots.filter(s => s.day === todayStr));

                const allSections = secRes.status === 'fulfilled' ? secRes.value.data : [];
                const sectionNames = [...new Set(mySlots.map(c => c.section))];
                setUniqueSections(sectionNames);
                setActiveAssignments(asgRes.status === 'fulfilled' ? asgRes.value.data?.length || 0 : 0);
                setTeacherStudents(students.filter(s => sectionNames.includes(s.sectionName)).slice(0, 8));
            }
        } catch (error) {
            console.error('Aggregated Dashboard Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardAggregated();
    }, [user]);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
    );

    /* ─── TEACHER DASHBOARD ─────────────────────────────── */
    if (user.role === 'TEACHER') {
        return (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8 px-2 md:px-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                            Welcome, {user.name || 'Faculty Member'}
                        </h2>
                        <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            Avanthi Institute Faculty • {todayStr}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricTile icon={<Users className="text-orange-500" />} label="Academic Cohorts" value={uniqueSections.length} color="amber" onClick={() => navigate('/cohorts')} />
                    <MetricTile icon={<BookOpen className="text-emerald-500" />} label="Assignments" value={activeAssignments} color="emerald" onClick={() => navigate('/assignments')} />
                    <MetricTile icon={<MessageSquare className="text-indigo-500" />} label="Open Queries" value={pendingQueries} color="indigo" onClick={() => navigate('/queries')} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 glass-card border border-[var(--border-primary)] p-0 overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3 italic">
                                <Clock size={16} className="text-[var(--accent-primary)]" /> Scheduled Sessions
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                            {classes.length > 0 ? classes.map((c, i) => (
                                <div key={i} onClick={() => navigate('/attendance')} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] font-black text-xs border border-[var(--accent-primary)]/10 group-hover:scale-110 transition-transform">
                                            {c.time?.split(':')[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[var(--text-primary)] text-[11px] uppercase italic leading-tight">{c.subject}</h4>
                                            <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mt-0.5">{c.time} • Room {c.room}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase text-[var(--accent-primary)] border border-white/5">{c.section}</span>
                                </div>
                            )) : (
                                <div className="text-center py-20 opacity-20 italic font-black uppercase text-[10px] tracking-[0.4em]">No active sessions</div>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-2 glass-card border border-[var(--border-primary)] p-0 overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3 italic">
                                <Activity size={18} className="text-emerald-500" /> Students Analytics Stream
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/20">
                                        <th className="py-4 px-6 md:px-8">Roll No</th>
                                        <th className="py-4 px-6 md:px-8">Name</th>
                                        <th className="py-4 px-6 md:px-8 text-right">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherStudents.map((s, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                            <td className="py-4 px-6 md:px-8 text-[9px] font-black text-[var(--text-secondary)] uppercase italic">{s.rollNo}</td>
                                            <td className="py-4 px-6 md:px-8">
                                                <p className="font-black text-[var(--text-primary)] text-[11px] uppercase italic group-hover:text-[var(--accent-primary)] transition-colors">{s.name}</p>
                                            </td>
                                            <td className="py-4 px-6 md:px-8 text-right">
                                                <span className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase bg-white/5 text-[var(--text-secondary)] border border-white/5">Steady</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    /* ─── STUDENT DASHBOARD ────────────────────────── */
    return (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-10 pb-20 px-4 md:px-0">
            {/* HERO BANNER */}
            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden relative shadow-2xl group min-h-[300px] md:min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1541339906194-e1620a9fb2dd?auto=format&fit=crop&q=80&w=1200"
                    alt="Avanthi Banner"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
                />
                <div className="relative z-20 p-6 md:p-12 h-full flex flex-col justify-end">
                    <span className="px-3 py-1 md:px-4 md:py-1.5 bg-orange-500 text-white rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest w-max mb-4 md:mb-6">Avanthi Excellence</span>
                    <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none max-w-3xl mb-4">
                        AVANTHI INSTITUTE FINAL YEAR STUDENTS ACHIEVING <span className="text-orange-500 underline decoration-white/20">HIGHEST PACKAGES</span>
                    </h2>
                    <p className="text-white/60 text-[9px] md:text-xs font-bold font-mono uppercase tracking-tight max-w-lg">850+ Avanthi students secured elite placements this season across tech giants*</p>
                </div>
            </div>

            {/* UPDATED QUICK METRICS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <MetricTile icon={<Activity className="text-emerald-500" />} label="Attendance" value={`${attendancePercent}%`} subline="Protocol Summary" color="emerald" />
                <MetricTile icon={<Award className="text-orange-500" />} label="GPA" value={cGPA} subline="Academic Standing" color="amber" />
                <MetricTile icon={<Library className="text-cyan-500" />} label="Books Lent" value={booksLentCount} subline="Library Records" color="cyan" onClick={() => setShowLibraryModal(true)} />
                <MetricTile icon={<Wallet className="text-indigo-500" />} label="Fee Pending" value={`₹${pendingFeeAmount}`} subline="Financial Dues" color="indigo" onClick={() => setShowFeeModal(true)} />
            </div>

            {/* MODALS FOR DETAILS */}
            <AnimatePresence>
                {showLibraryModal && (
                    <DetailModal title="Library Lending Records" onClose={() => setShowLibraryModal(false)}>
                        <div className="space-y-4">
                            {issuedBooks.length > 0 ? issuedBooks.map((b, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-white text-sm uppercase italic">{b.title || b.bookId}</p>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Issued: {b.issueDate} • Status: {b.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Due: {b.returnDate || 'N/A'}</p>
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">Fine: ₹0</p>
                                    </div>
                                </div>
                            )) : <p className="text-center py-10 opacity-40 uppercase font-black text-xs tracking-widest">No books currently issued</p>}
                        </div>
                    </DetailModal>
                )}

                {showFeeModal && (
                    <DetailModal title="Financial Dues Breakdown" onClose={() => setShowFeeModal(false)}>
                        <div className="space-y-4">
                            {fees.length > 0 ? fees.map((f, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${f.status === 'PAID' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                    <div>
                                        <p className="font-black text-white text-sm uppercase italic">{f.feeType}</p>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Due Date: {f.dueDate} • Status: {f.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white tracking-tighter italic">₹{f.pendingAmount}</p>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Total: ₹{f.amount}</p>
                                    </div>
                                </div>
                            )) : <p className="text-center py-10 opacity-40 uppercase font-black text-xs tracking-widest">No financial records found</p>}
                        </div>
                    </DetailModal>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* TIMETABLE SECTION */}
                <div className="lg:col-span-8 h-full">
                    <div className="glass-card-accent border-[var(--border-primary)] p-0 overflow-hidden flex flex-col shadow-2xl h-full min-h-[400px]">
                        <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Today's Protocol Stream</h3>
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">{todayStr}</span>
                        </div>
                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.length > 0 ? classes.map((c, i) => (
                                <div key={i} className="flex justify-between items-center p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4 md:gap-5">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white/5 flex items-center justify-center font-black text-xs md:text-sm italic text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            {c.time?.split(':')[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-[var(--text-primary)] text-[12px] md:text-sm uppercase italic tracking-tight">{c.subject}</p>
                                            <p className="text-[8px] md:text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 italic mt-1">{c.instructor} • {c.time} • Rm {c.room}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-[var(--text-secondary)] group-hover:text-white" />
                                </div>
                            )) : (
                                <div className="col-span-full py-16 text-center opacity-20 italic font-black uppercase text-[10px] tracking-[0.4em]">No Classes Scheduled</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RECRUITMENT DRIVES */}
                <div className="lg:col-span-4 space-y-8 h-full">
                    <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden flex flex-col shadow-2xl h-full min-h-[400px]">
                        <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="text-xs md:text-sm font-black text-[var(--text-primary)] uppercase tracking-[.2em] flex items-center gap-3 italic">
                                <Building2 size={16} className="text-orange-500" /> Recruitment Drives
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveDriveIndex(prev => Math.max(0, prev - 1))}
                                    disabled={activeDriveIndex === 0}
                                    className="p-1 rounded-lg bg-white/5 text-white/40 disabled:opacity-20 hover:text-orange-500 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setActiveDriveIndex(prev => Math.min(placementDrives.length - 1, prev + 1))}
                                    disabled={activeDriveIndex >= placementDrives.length - 1}
                                    className="p-1 rounded-lg bg-white/5 text-white/40 disabled:opacity-20 hover:text-orange-500 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 flex-1 relative flex flex-col">
                            <div className="flex-1 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {placementDrives.length > 0 ? (
                                        <motion.div
                                            key={activeDriveIndex}
                                            initial={{ x: 50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -50, opacity: 0 }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="h-full"
                                        >
                                            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-orange-500/30 transition-all h-full flex flex-col justify-between shadow-xl">
                                                <div>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <h5 className="text-xl font-black text-[var(--text-primary)] uppercase italic leading-tight">{placementDrives[activeDriveIndex].companyName}</h5>
                                                        <span className="text-[10px] font-black text-orange-500 font-mono italic bg-orange-500/10 px-3 py-1 rounded-full">{placementDrives[activeDriveIndex].time}</span>
                                                    </div>
                                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase opacity-60 flex items-center gap-3 mb-8">
                                                        <Building2 size={16} className="text-orange-500/50" /> {placementDrives[activeDriveIndex].venue}
                                                    </p>
                                                </div>
                                                <div className="pt-6 border-t border-white/5">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-relaxed flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Eligibility: {placementDrives[activeDriveIndex].eligibility}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase text-[9px] tracking-widest border border-dashed border-white/10 rounded-3xl">
                                            No active drives
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {placementDrives.length > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {placementDrives.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveDriveIndex(i)}
                                            className={`h-1.5 transition-all duration-300 rounded-full ${activeDriveIndex === i ? 'w-8 bg-orange-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AUTHORITIES SECTION */}
            <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic border-l-4 border-orange-500 pl-4 md:pl-6 ml-4">Authorities Registry</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    <AuthorityCard role="Mentor" name="Smt. Lakshmi Devi" title="Assistant Professor" school="Avanthi Institute" img="/authorities/mentor.png" />
                    <AuthorityCard role="Head of Dept" name="Dr. Srinivas Rao" title="Associate Professor" school="Avanthi Institute" img="/authorities/dean.png" />
                    <AuthorityCard role="Head of School" name="Dr. Prabhakar Reddy" title="Professor" school="Avanthi Institute" img="/authorities/principal.png" />
                    <AuthorityCard role="Head of Faculty" name="Dr. Anitha Kumari" title="Dean" school="Avanthi Institute" img="/authorities/hod.png" />
                </div>
            </div>
        </motion.div>
    );
};

/* ─── HELPER COMPONENTS ─── */

const MetricTile = ({ icon, label, value, subline, color, onClick }) => {
    return (
        <div onClick={onClick} className={`glass-card border-[var(--border-primary)] p-5 md:p-8 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer ${onClick ? 'active:scale-95' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:rotate-6 bg-white/5">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <p className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{value}</p>
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mt-2 md:mt-3 opacity-60 italic">{label}</p>
        </div>
    );
};

const DetailModal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-2xl glass-card border-[var(--border-primary)] p-0 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} className="text-white" /></button>
            </div>
            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Avanthi Integrated Management System</p>
            </div>
        </motion.div>
    </div>
);

const AuthorityCard = ({ role, name, title, school, img }) => (
    <div className="glass-card border-[var(--border-primary)] p-6 text-center flex flex-col items-center group hover:border-orange-500/30 transition-all shadow-xl">
        <div className="w-20 h-20 rounded-full p-1 bg-white/10 border border-white/5 mb-4 group-hover:border-orange-500/50 transition-colors">
            <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-opacity" />
        </div>
        <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em] italic mb-1">{role}</p>
        <h4 className="text-sm font-black text-[var(--text-primary)] uppercase italic leading-tight">{name}</h4>
        <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest mt-1">{school}</p>
    </div>
);

export default Dashboard;
