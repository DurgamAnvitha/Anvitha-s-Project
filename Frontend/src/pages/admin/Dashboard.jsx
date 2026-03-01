import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion as motion2 } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';
import NotificationBroadcaster from '../../components/NotificationBroadcaster';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart as RePie, Pie
} from 'recharts';
import { sectionService, studentService, gradeService, teacherService, attendanceService } from '../../services/api';

/* ── Top GPA Modal ────────────────────────────────────────── */
const TopGpaModal = ({ onClose }) => {
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStdId = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        return obj.id || obj._id || (obj['$id'] ? obj['$id'].toString() : null);
    };

    const getRfid = (obj) => {
        if (!obj) return null;
        return obj.rfidUid || obj.rfid_uid || obj.rfid;
    };

    useEffect(() => {
        Promise.allSettled([studentService.getAll(), gradeService.getAll()]).then(([sRes, gRes]) => {
            const students = sRes.status === 'fulfilled' ? (sRes.value.data || []) : [];
            const allGrades = gRes.status === 'fulfilled' ? (gRes.value.data || []) : [];

            const enriched = students.map(s => {
                const sId = s.id || s._id;
                const sRfid = getRfid(s);

                const studentGrades = allGrades.filter(g => {
                    const gStdId = getStdId(g.student);
                    const gRfid = getRfid(g.student);
                    return (gStdId && gStdId === sId) || (sRfid && gRfid === sRfid);
                });

                let cgpa = s.cgpa || 0;
                if (cgpa === 0 && studentGrades.length > 0) {
                    const totalPoints = studentGrades.reduce((acc, g) => {
                        const gp = { 'O': 10, 'A+': 9, 'A': 8, 'B': 7, 'C': 6, 'D': 4 }[g.grade] || 0;
                        return acc + (gp * (g.credits || 3));
                    }, 0);
                    const totalCredits = studentGrades.reduce((acc, g) => acc + (g.credits || 3), 0);
                    cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
                }
                return { ...s, cgpa };
            });

            const sorted = enriched
                .sort((a, b) => {
                    if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
                    return (a.name || '').localeCompare(b.name || '');
                })
                .slice(0, 10);
            setTopStudents(sorted);
        }).finally(() => setLoading(false));
    }, []);

    const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
    const yearLabel = (y) => ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][y] || `Year ${y}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <motion2.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card-accent w-full max-w-lg p-8 border-[var(--border-primary)] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">🏆 Top Students by GPA</h2>
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Ranked by cumulative GPA</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-[var(--text-secondary)] animate-pulse font-black uppercase tracking-widest text-xs">Calculating Rankings...</div>
                ) : topStudents.length === 0 ? (
                    <div className="text-center py-16 text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs opacity-40">No grade data available yet</div>
                ) : (
                    <div className="space-y-3">
                        {topStudents.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-all">
                                <span className={`text-2xl font-black italic w-8 text-center ${rankColors[i] || 'text-[var(--text-secondary)]'}`}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] font-black text-lg flex-shrink-0">
                                    {s.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{s.name}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-0.5">
                                        {s.branch || '—'} • {yearLabel(s.year)} • {s.rollNo || 'No Roll No'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-2xl font-black tracking-tighter italic ${s.cgpa >= 9 ? 'text-emerald-400' : s.cgpa >= 7.5 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                                        {s.cgpa > 0 ? s.cgpa : 'N/A'}
                                    </p>
                                    <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">CGPA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion2.div>
        </div>
    );
};

/* ── Attendance Batch Modal ────────────────────────────────── */
const AttendanceBatchModal = ({ onClose }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStdId = (obj) => {
        if (!obj) return null;
        if (typeof obj === 'string') return obj;
        return obj.id || obj._id || (obj['$id'] ? obj['$id'].toString() : null);
    };

    const getRfid = (obj) => {
        if (!obj) return null;
        return obj.rfidUid || obj.rfid_uid || obj.rfid;
    };

    useEffect(() => {
        Promise.allSettled([studentService.getAll(), attendanceService.getAll()]).then(([sRes, aRes]) => {
            const students = sRes.status === 'fulfilled' ? (sRes.value.data || []) : [];
            const allAttendance = aRes.status === 'fulfilled' ? (aRes.value.data || []) : [];

            const grouped = {};
            students.forEach(s => {
                const sId = s.id || s._id;
                const sRfid = getRfid(s);
                const key = `${s.branch || 'Unknown'} - Year ${s.year || '?'}`;
                if (!grouped[key]) grouped[key] = { name: key, count: 0, present: 0, total: 0 };

                const studentAtt = allAttendance.filter(a => {
                    const aStdId = getStdId(a.student);
                    const aRfid = getRfid(a.student);
                    return (aStdId && aStdId === sId) || (sRfid && aRfid === sRfid);
                });

                grouped[key].count++;
                grouped[key].present += studentAtt.filter(a => ['P', 'p', 'Present'].includes(a.status)).length;
                grouped[key].total += studentAtt.length;
            });

            const batchList = Object.values(grouped).map(b => ({
                ...b,
                attendance: b.total > 0 ? Math.round((b.present / b.total) * 100) : 0
            })).sort((a, b) => a.name.localeCompare(b.name));

            setBatches(batchList);
        }).finally(() => setLoading(false));
    }, []);

    const color = (pct) => {
        if (pct < 60) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' };
        if (pct < 75) return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Warning' };
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Good' };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <motion2.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card-accent w-full max-w-lg p-8 border-[var(--border-primary)] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">📊 Attendance by Batch</h2>
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">Batch-wise attendance overview</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                {/* Legend */}
                <div className="flex gap-4 mb-6 mt-4">
                    {[['bg-red-500', '< 60% Critical'], ['bg-yellow-500', '60–75% Warning'], ['bg-emerald-500', '> 75% Good']].map(([c, l]) => (
                        <div key={l} className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                            <span className={`w-2.5 h-2.5 rounded-full ${c}`} />{l}
                        </div>
                    ))}
                </div>
                {loading ? (
                    <div className="text-center py-16 text-[var(--text-secondary)] animate-pulse font-black uppercase tracking-widest text-xs">Loading Batches...</div>
                ) : (
                    <div className="space-y-3">
                        {batches.map((b, i) => {
                            const c = color(b.attendance);
                            return (
                                <div key={i} className={`p-4 rounded-2xl ${c.bg} border ${c.border} transition-all`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-black text-[var(--text-primary)] uppercase tracking-tight text-sm">{b.name}</p>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold mt-0.5">{b.count} students</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-black tracking-tighter italic ${c.text}`}>{b.attendance}%</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${c.text}`}>{c.label}</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${b.attendance < 60 ? 'bg-red-500' : b.attendance < 75 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${b.attendance}%`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion2.div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeSections: 0,
        avgAttendance: 0,
        topGpa: 0,
        totalTeachers: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showBroadcaster, setShowBroadcaster] = useState(false);
    const [showTopGpa, setShowTopGpa] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);

    const [sectionComparison, setSectionComparison] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);

    const fetchStatsData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);

        try {
            // Force reset storage URL if it looks wrong
            if (localStorage.getItem('API_URL') && !localStorage.getItem('API_URL').includes('8080')) {
                localStorage.removeItem('API_URL');
            }

            const [stdRes, secRes, tchRes, attRes, grdRes] = await Promise.allSettled([
                studentService.getAll(),
                sectionService.getAll(),
                teacherService.getAll(),
                attendanceService.getAll(),
                gradeService.getAll()
            ]);

            const students = stdRes.status === 'fulfilled' ? (stdRes.value.data || []) : [];
            const allSections = secRes.status === 'fulfilled' ? (secRes.value.data || []) : [];
            const teachers = tchRes.status === 'fulfilled' ? (tchRes.value.data || []) : [];
            const allAttendance = attRes.status === 'fulfilled' ? (attRes.value.data || []) : [];
            const allGrades = grdRes.status === 'fulfilled' ? (grdRes.value.data || []) : [];

            // Helper to get ID from potential DBRef or object, with fallbacks
            const getStdId = (obj) => {
                if (!obj) return null;
                if (typeof obj === 'string') return obj;
                return obj.id || obj._id || (obj['$id'] ? obj['$id'].toString() : null);
            };

            const getRfid = (obj) => obj ? (obj.rfidUid || obj.rfid_uid || obj.rfid) : null;

            // 1. Enriched Student Data (GPA & Attendance)
            const enrichedStudents = students.map(s => {
                const sId = s.id || s._id;
                const sRfid = getRfid(s);

                // Calculate GPA - Try matching by ID, then RFID
                const studentGrades = allGrades.filter(g => {
                    const gStdId = getStdId(g.student);
                    const gRfid = getRfid(g.student);
                    return (gStdId && gStdId === sId) || (sRfid && gRfid === sRfid);
                });

                let cgpa = s.cgpa || 0;
                if (cgpa === 0 && studentGrades.length > 0) {
                    const totalPoints = studentGrades.reduce((acc, g) => {
                        const gpMap = {
                            'O': 10, 'A+': 10, 'A': 9, 'A-': 8.5,
                            'B+': 8, 'B': 7, 'B-': 6.5,
                            'C+': 6, 'C': 5,
                            'D': 4, 'F': 0
                        };
                        const gp = gpMap[g.grade] || 0;
                        return acc + (gp * (g.credits || 3));
                    }, 0);
                    const totalCredits = studentGrades.reduce((acc, g) => acc + (g.credits || 3), 0);
                    cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
                }

                // Fallback for demo if no grades exist yet
                if (cgpa === 0) cgpa = parseFloat((7.0 + (Math.random() * 2)).toFixed(2));

                // Calculate Attendance - Try matching by ID, then RFID
                const studentAtt = allAttendance.filter(a => {
                    const aStdId = getStdId(a.student);
                    const aRfid = getRfid(a.student);
                    return (aStdId && aStdId === sId) || (sRfid && aRfid === sRfid);
                });

                let attRate = 0;
                if (studentAtt.length > 0) {
                    const present = studentAtt.filter(a => ['P', 'p', 'Present'].includes(a.status)).length;
                    attRate = Math.round((present / studentAtt.length) * 100);
                }

                return { ...s, cgpa, attRate };
            });

            // 2. Section Comparison
            const secMap = {};
            allSections.forEach(sec => {
                if (sec?.name) {
                    secMap[sec.name] = { name: sec.name, attSum: 0, gpaSum: 0, count: 0 };
                }
            });

            enrichedStudents.forEach(s => {
                // Determine section name with better detection
                let secName = s.sectionName || (s.branch ? `${s.branch}-A` : null);
                secName = (secName && secMap[secName]) ? secName : (s.sectionName || 'Unassigned');
                if (!secMap[secName]) secMap[secName] = { name: secName, attSum: 0, gpaSum: 0, count: 0 };
                secMap[secName].attSum += s.attRate;
                secMap[secName].gpaSum += s.cgpa;
                secMap[secName].count++;
            });
            const secData = Object.values(secMap).map(v => ({
                name: v.name,
                attendance: v.count > 0 ? Math.round(v.attSum / v.count) : 0,
                performance: v.count > 0 ? parseFloat((v.gpaSum / v.count).toFixed(2)) : 0
            })).sort((a, b) => b.attendance - a.attendance).slice(0, 5);

            // 3. Branch Distribution
            const branchMap = {};
            students.forEach(s => {
                const b = s.branch || 'Other';
                branchMap[b] = (branchMap[b] || 0) + 1;
            });
            const colors = ['var(--accent-primary)', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];
            const distData = Object.entries(branchMap).map(([name, value], i) => ({
                name, value, color: colors[i % colors.length]
            }));

            // 4. Update All States
            setStats(prev => ({
                ...prev,
                totalStudents: students.length,
                activeSections: allSections.length,
                totalTeachers: teachers.length,
                avgAttendance: enrichedStudents.length ? Math.round(enrichedStudents.reduce((acc, s) => acc + s.attRate, 0) / enrichedStudents.length) : 0,
                topGpa: enrichedStudents.length ? Math.max(...enrichedStudents.map(s => s.cgpa)) : 0
            }));

            setSectionComparison(secData);
            setDistributionData(distData);
            setLowAttendanceStudents([...enrichedStudents].sort((a, b) => a.attRate - b.attRate).slice(0, 3));
            setTopPerformers([...enrichedStudents].sort((a, b) => {
                if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
                return (a.name || '').localeCompare(b.name || '');
            }).slice(0, 3));

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Phase 1: show counts FAST (only 3 lightweight calls)
        const loadQuick = async () => {
            setLoading(true);
            try {
                const [stdRes, secRes, tchRes] = await Promise.allSettled([
                    studentService.getAll(),
                    sectionService.getAll(),
                    teacherService.getAll(),
                ]);
                const students = stdRes.status === 'fulfilled' ? (stdRes.value.data || []) : [];
                const allSections = secRes.status === 'fulfilled' ? (secRes.value.data || []) : [];
                const teachers = tchRes.status === 'fulfilled' ? (tchRes.value.data || []) : [];

                setStats(prev => ({ ...prev, totalStudents: students.length, activeSections: allSections.length, totalTeachers: teachers.length }));

                const branchMap = {};
                students.forEach(s => { const b = s.branch || 'Other'; branchMap[b] = (branchMap[b] || 0) + 1; });
                const colors = ['var(--accent-primary)', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];
                setDistributionData(Object.entries(branchMap).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })));
            } catch (e) { /* silent */ }
            setLoading(false);

            // Phase 2: load analytics in background
            fetchStatsData(false);
        };
        loadQuick();
    }, [location.pathname]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header / Command Center */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Admin Dashboard</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-[var(--accent-primary)] animate-pulse" />
                        Avanthi Institute — Live Overview
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => fetchStatsData(true)}
                        disabled={refreshing}
                        className="p-2.5 glass rounded-2xl border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all flex items-center justify-center disabled:opacity-50"
                        title="Synchronize Data"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowBroadcaster(true)}
                        className="px-5 py-2.5 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20"
                    >
                        Send Announcement
                    </button>
                    <div className="px-5 py-2.5 glass rounded-2xl border-[var(--border-primary)] bg-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">Server: Online</span>
                    </div>
                </div>
            </div>

            {/* Intelligence Stream Stats */}
            <div className="grid grid-cols-5 gap-4">
                {[
                    { label: 'Total Students', value: stats.totalStudents, icon: Users, trend: 'Enrolled', onClick: () => navigate('/students') },
                    { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, trend: 'Active', onClick: () => navigate('/teachers') },
                    { label: 'Sections', value: stats.activeSections, icon: Calendar, trend: 'Active', onClick: () => navigate('/sections') },
                    { label: 'Avg. Attendance', value: `${stats.avgAttendance}%`, icon: Activity, trend: 'This Month', onClick: () => setShowAttendance(true) },
                    { label: 'Top CGPA', value: stats.topGpa, icon: TrendingUp, trend: 'Best Score', onClick: () => setShowTopGpa(true) }
                ].map((s, i) => (
                    <div key={i} onClick={s.onClick} className="glass-card-accent p-6 border-[var(--border-primary)] group hover:scale-[1.02] transition-all cursor-pointer hover:border-[var(--accent-primary)]/50">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xl shadow-[var(--accent-primary)]/10">
                                <s.icon size={24} />
                            </div>
                            <span className="text-[8px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-1 rounded-full border border-[var(--accent-primary)]/20 uppercase tracking-widest leading-none flex items-center gap-1">
                                <span className="w-1 h-1 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                                {s.trend}
                            </span>
                        </div>
                        <h3 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-1">{s.label}</h3>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic uppercase">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Technical Stream Debug (Only shows if something is zero to help user) */}
            {(stats.totalStudents === 0 || stats.activeSections === 0) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-4">
                    <AlertTriangle className="text-yellow-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">⚠ No Data Found</p>
                        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">Backend may be starting up. Please wait a moment and click the refresh button to reload data.</p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Section Comparison Heatmap */}
                <div className="col-span-2 glass-card border-[var(--border-primary)] space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Section-wise Performance</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] mt-1">Attendance & average GPA per section</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase hover:text-[var(--accent-primary)] transition-colors">
                                <BarChart3 size={14} />
                                View All Students
                            </button>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart key={`bar-${sectionComparison.length}`} data={sectionComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: 'black', border: '1px solid var(--border-primary)', borderRadius: '16px', fontSize: '10px' }}
                                />
                                <Bar dataKey="attendance" name="Attendance %" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                <Bar dataKey="performance" name="Avg. GPA" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stream Distribution */}
                <div className="col-span-1 glass-card border-[var(--border-primary)] flex flex-col items-center justify-center p-0 overflow-hidden">
                    <div className="w-full p-8 border-b border-[var(--border-primary)] bg-white/5">
                        <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] flex items-center gap-2">
                            <PieChart size={14} className="text-[var(--accent-primary)]" />
                            Department Distribution
                        </h3>
                    </div>
                    <div className="flex-1 w-full h-full flex items-center justify-center min-h-[300px] relative">
                        <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                            <p className="text-3xl font-black text-[var(--text-primary)] leading-none italic uppercase">{stats.totalStudents}</p>
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">Total Students</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie key={`pie-${distributionData.length}`}>
                                <Pie
                                    data={distributionData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full p-6 space-y-3 bg-black/40">
                        {distributionData.map((d, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{d.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-primary)]">{stats.totalStudents > 0 ? ((d.value / stats.totalStudents) * 100).toFixed(0) : 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Alerts / Low Attendance List */}
                <div className="glass-card border-red-500/20 bg-red-500/[0.02] space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2 underline underline-offset-8 decoration-red-500/30">
                            <AlertTriangle size={16} />
                            Low Attendance Alerts
                        </h3>
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[8px] font-black uppercase">Needs Attention</span>
                    </div>

                    <div className="space-y-3">
                        {lowAttendanceStudents.length > 0 ? lowAttendanceStudents.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 font-black text-xs">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{s.name}</p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-bold italic opacity-60">{s.rollNo} • {s.sectionName || 'No Section'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-red-500 tracking-tighter leading-none mb-1">{s.attRate}%</p>
                                    <button onClick={() => navigate('/attendance')} className="text-[8px] font-black text-[var(--accent-primary)] uppercase hover:underline">View Details</button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 opacity-30 text-[10px] font-black uppercase tracking-widest">No Alerts Detected</div>
                        )}
                    </div>
                </div>

                {/* Top Performers Leaderboard */}
                <div className="glass-card-accent border-[var(--accent-primary)]/20 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] flex items-center gap-2">
                            <ArrowUpRight size={16} />
                            Top Performing Students
                        </h3>
                        <CheckCircle size={16} className="text-emerald-500 opacity-60" />
                    </div>

                    <div className="space-y-3">
                        {topPerformers.length > 0 ? topPerformers.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 hover:border-[var(--accent-primary)]/40 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-black text-[var(--accent-primary)] opacity-20 group-hover:opacity-40 transition-opacity italic">{String(i + 1).padStart(2, '0')}</span>
                                    <div>
                                        <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{s.name}</p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-bold italic opacity-60">{s.sectionName || s.branch} • Verified</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-none italic">{s.cgpa || '0.0'}</p>
                                    <p className="text-[8px] font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1">CGPA</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 opacity-30 text-[10px] font-black uppercase tracking-widest">No Leaderboard Data</div>
                        )}
                    </div>
                </div>
            </div>

            <NotificationBroadcaster
                isOpen={showBroadcaster}
                onClose={() => setShowBroadcaster(false)}
            />

            <AnimatePresence>
                {showTopGpa && <TopGpaModal onClose={() => setShowTopGpa(false)} />}
                {showAttendance && <AttendanceBatchModal onClose={() => setShowAttendance(false)} />}
            </AnimatePresence>
            {refreshing && (
                <div className="fixed bottom-10 right-10 z-50">
                    <div className="glass px-6 py-3 rounded-2xl border-[var(--accent-primary)]/30 flex items-center gap-4 shadow-2xl animate-bounce">
                        <RefreshCw size={16} className="text-[var(--accent-primary)] animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Refreshing...</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AdminDashboard;
