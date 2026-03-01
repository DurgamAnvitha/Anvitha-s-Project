import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, Hash, ChevronRight, UserCheck, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { timetableService, studentService, sectionService, teacherService } from '../services/api';
import toast from 'react-hot-toast';

const Cohorts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCohortData = async () => {
            setLoading(true);
            try {
                // Fetch timetable mapped sections, explicitly assigned class-teacher sections, and students
                const [ttRes, secRes, studentRes, tchRes] = await Promise.all([
                    timetableService.getByTeacher(user.username || user.email),
                    sectionService.getAll(),
                    studentService.getAll(),
                    teacherService.getAll()
                ]);

                // Find the specific Teacher Profile ID linked to this logged-in User
                const allTeachers = tchRes.data || [];
                const myTeacherProfile = allTeachers.find(t =>
                    t.email === user.email || t.employeeId === user.username
                );
                const trueTeacherId = myTeacherProfile ? (myTeacherProfile.id || myTeacherProfile._id) : (user.id || user._id);

                // 1. Get teacher's assigned sections from timetable
                const ttSections = (ttRes.data || []).map(t => ({ id: t.sectionId, name: t.section }));

                // 2. Get sections where this teacher is the designated Class Teacher
                const ctSections = (secRes.data || [])
                    .filter(s => s.classTeacherId === trueTeacherId)
                    .map(s => ({ id: s.id || s._id, name: s.name }));

                // Combine unique sections
                const mergedMap = new Map();
                [...ttSections, ...ctSections].forEach(s => {
                    if (s.id && s.name) mergedMap.set(s.id, s);
                });

                const assignedSections = Array.from(mergedMap.values());
                setSections(assignedSections);

                const sectionIds = assignedSections.map(s => s.id);
                const sectionNames = assignedSections.map(s => s.name);

                // 3. Get all students and filter by teacher's sections
                const filteredStudents = (studentRes.data || []).filter(s =>
                    sectionIds.includes(s.sectionId) || sectionNames.includes(s.sectionName)
                );
                setStudents(filteredStudents);
            } catch (error) {
                toast.error("Failed to synchronize cohort telemetry");
            } finally {
                setLoading(false);
            }
        };

        fetchCohortData();
    }, [user]);

    const filteredList = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Active Cohorts</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <UserCheck size={14} className="text-[var(--accent-primary)]" />
                        Mapped Sections • Student Nodes
                    </p>
                </div>
                <div className="flex gap-4">
                    {sections.map(s => (
                        <div key={s.id} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
                            {s.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden relative">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full max-w-md">
                        <Search className="text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search cohorts..."
                            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-full font-bold uppercase tracking-tight"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest opacity-50 italic">Total: {students.length} Nodes</p>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em] border-b border-white/5 bg-black/20">
                                <th className="py-6 px-8">Student Identification</th>
                                <th className="py-6 px-8">Contact Stream</th>
                                <th className="py-6 px-8">Stream Mapping</th>
                                <th className="py-6 px-8 text-right">Node Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px]">
                            {filteredList.map((s, i) => (
                                <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-all group">
                                    <td className="py-6 px-8 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[var(--accent-primary)] shadow-lg group-hover:scale-110 transition-transform">
                                            {s.name ? s.name[0] : 'S'}
                                        </div>
                                        <div>
                                            <p className="font-black text-[var(--text-primary)] uppercase tracking-tight italic">{s.name}</p>
                                            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest opacity-50 mt-1 flex items-center gap-1.5 font-bold">
                                                <Hash size={10} /> RFID: {s.rfidUid}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="space-y-1.5">
                                            <p className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-[10px] tracking-tight hover:text-[var(--text-primary)] transition-colors">
                                                <Mail size={12} className="opacity-50" /> {s.email}
                                            </p>
                                            <p className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-[10px] tracking-tight hover:text-[var(--text-primary)] transition-colors">
                                                <Phone size={12} className="opacity-50" /> {s.phone || "+91-99XX-XXX-XXX"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg text-[9px] font-black uppercase text-[var(--accent-primary)] tracking-widest text-center w-max shadow-sm">
                                                {s.sectionId}
                                            </span>
                                            <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] opacity-50 ml-1 tracking-widest">
                                                Academic Stream • 2024
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <button
                                            onClick={() => navigate(`/students/${s.id}`)}
                                            className="p-3 bg-white/5 rounded-2xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-primary)] transition-all group-hover:px-6 flex items-center gap-2 overflow-hidden w-max ml-auto shadow-md"
                                        >
                                            <span className="hidden group-hover:block text-[9px] font-black uppercase tracking-widest">Inspection</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Cohorts;
