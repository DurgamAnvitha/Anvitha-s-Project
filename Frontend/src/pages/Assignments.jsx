import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Upload, CheckCircle, Clock, AlertTriangle, Award, FileText,
    Plus, Users, BookOpen, Send, Eye, ChevronRight, Search, X
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { assignmentService, submissionService, studentService, sectionService, timetableService, teacherService } from '../services/api';
import toast from 'react-hot-toast';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradingData, setGradingData] = useState({ marks: '', feedback: '' });
    const [uploadData, setUploadData] = useState({ content: '', fileLink: '' });
    const [newAssign, setNewAssign] = useState({ title: '', description: '', deadline: '', maxMarks: 100, sectionId: '', subject: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user.role === 'STUDENT') {
                const [studentRes, sectionRes] = await Promise.all([
                    studentService.getAll(),
                    sectionService.getAll()
                ]);
                const student = studentRes.data.find(s => s.email === user.email || s.rollNo === user.username);

                if (student) {
                    // Map student section record to actual section database record
                    const allSections = sectionRes.data || [];
                    const mySection = allSections.find(sec =>
                        sec.id === student.sectionId ||
                        sec.name === student.sectionName
                    );

                    const targetSectionId = mySection ? (mySection.id || mySection._id) : student.sectionId;

                    if (targetSectionId) {
                        const res = await assignmentService.getBySection(targetSectionId);
                        setAssignments(res.data || []);
                        const subs = await submissionService.getByStudent(student.id || student._id);
                        setSubmissions(subs.data || []);
                    }
                }
            } else if (user.role === 'TEACHER') {
                const [ttRes, secRes, tchRes] = await Promise.all([
                    timetableService.getByTeacher(user.username || user.email),
                    sectionService.getAll(),
                    teacherService.getAll()
                ]);

                // Resolve True Teacher ID
                const allTeachers = tchRes.data || [];
                const myTeacherProfile = allTeachers.find(t =>
                    t.email === user.email || t.employeeId === user.username
                );
                const trueTeacherId = myTeacherProfile ? (myTeacherProfile.id || myTeacherProfile._id) : (user.id || user._id);

                // Combine sections from Timetable and Class Teacher assignments
                const ttSections = (ttRes.data || []).map(t => ({ id: t.sectionId, name: t.section }));
                const ctSections = (secRes.data || [])
                    .filter(s => s.classTeacherId === trueTeacherId)
                    .map(s => ({ id: s.id || s._id, name: s.name }));

                const mergedMap = new Map();
                [...ttSections, ...ctSections].forEach(s => {
                    if (s.id && s.name) mergedMap.set(s.id, s);
                });

                const finalSections = Array.from(mergedMap.values());
                setSections(finalSections);
                const teacherSectionIds = finalSections.map(s => s.id);

                const allAssignments = [];
                for (const sid of teacherSectionIds) {
                    const res = await assignmentService.getBySection(sid);
                    allAssignments.push(...(res.data || []));
                }
                setAssignments(allAssignments);
            }
        } catch (error) {
            console.error("Assignment fetch error:", error);
            toast.error("Failed to fetch assignment stream");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await assignmentService.create({ ...newAssign, teacherId: user.username || user.email });
            toast.success('Assignment Protocol Deployed');
            setShowCreateModal(false);
            fetchData();
        } catch (error) {
            toast.error('Deployment failed');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const student = (await studentService.getAll()).data.find(s => s.email === user.email);
            await submissionService.submit({
                ...uploadData,
                assignmentId: selectedAssignment.id,
                studentId: student.id,
                studentName: student.name,
                submittedAt: new Date().toISOString()
            });
            toast.success('Assignment Uplink Successful');
            setShowUploadModal(false);
            fetchData();
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        try {
            await submissionService.grade(selectedSubmission.id, gradingData);
            toast.success('Grades Synchronized');
            setShowGradingModal(false);
            viewSubmissions(selectedAssignment);
        } catch (error) {
            toast.error('Grading failed');
        }
    };

    const viewSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        try {
            const res = await submissionService.getByAssignment(assignment.id);
            setSubmissions(res.data || []);
        } catch (error) {
            setSubmissions([]);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Assignments Control</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <ClipboardList size={14} className="text-[var(--accent-primary)] animate-pulse" />
                        Task Flow • Academic Sync
                    </p>
                </div>
                {user.role === 'TEACHER' && (
                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-[var(--accent-primary)] hover:brightness-110 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent-primary)]/20 flex items-center gap-2">
                        <Plus size={16} /> Create Deployment
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`${selectedAssignment && user.role === 'TEACHER' ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.length > 0 ? assignments.map((assignment, i) => {
                            const submission = submissions.find(s => s.assignmentId === assignment.id);
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className={`glass-card p-6 border-[var(--border-primary)] relative group cursor-pointer transition-all ${selectedAssignment?.id === assignment.id ? 'border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/10' : ''}`}
                                    onClick={() => user.role === 'TEACHER' ? viewSubmissions(assignment) : setSelectedAssignment(assignment)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[8px] font-black uppercase text-[var(--accent-primary)] tracking-widest">
                                            {assignment.subject || 'Core Module'}
                                        </div>
                                        <div className="flex gap-2">
                                            {submission ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                                                    <CheckCircle size={10} /> {submission.status === 'GRADED' ? `Graded: ${submission.marks}` : 'Uplinked'}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase">
                                                    <Clock size={10} /> Action Required
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-2 italic mb-2">{assignment.title}</h3>
                                    <div className="space-y-2 mb-6 opacity-60">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                                            <AlertTriangle size={12} /> Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {user.role === 'STUDENT' && !submission && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedAssignment(assignment); setShowUploadModal(true); }}
                                            className="w-full py-3 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-[var(--accent-primary)]/20 hover:border-transparent"
                                        >
                                            Upload Submission
                                        </button>
                                    )}
                                    {user.role === 'TEACHER' && (
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-[var(--accent-primary)] tracking-widest group-hover:translate-x-2 transition-transform">
                                            View Intel <ChevronRight size={14} />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center glass-card border-[var(--border-primary)] opacity-40 italic">
                                <ClipboardList size={40} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Assignment Protocols Detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {user.role === 'TEACHER' && selectedAssignment && (
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-2 glass-card border-[var(--border-primary)] p-0 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Submissions Stream</h3>
                                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mt-1">{selectedAssignment.title}</p>
                            </div>
                            <button onClick={() => setSelectedAssignment(null)} className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {submissions.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <Upload size={40} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Student Uplinks Found</p>
                                </div>
                            ) : (
                                submissions.map((sub, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[var(--accent-primary)]/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[var(--accent-primary)] font-black group-hover:scale-110 transition-transform shadow-lg">
                                                {sub.studentName?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{sub.studentName}</p>
                                                <p className="text-[9px] text-[var(--text-secondary)] font-bold italic opacity-60">ID: {sub.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => window.open(sub.fileLink, '_blank')} className="p-3 bg-white/5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-primary)] transition-all">
                                                <Eye size={16} />
                                            </button>
                                            {sub.status === 'GRADED' ? (
                                                <div className="text-right px-4 flex flex-col items-end">
                                                    <p className="text-lg font-black text-emerald-400 leading-none">{sub.marks}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-60 mt-1 italic">Score Deployed</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedSubmission(sub); setShowGradingModal(true); setGradingData({ marks: '', feedback: '' }); }}
                                                    className="px-6 py-2.5 bg-[var(--accent-primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                                                >
                                                    Grade Task
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modals for Create, Upload, Grade */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-lg p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Deploy Assignment Protocol</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-[var(--text-secondary)] hover:text-white"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateAssignment} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Title</label>
                                        <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all" value={newAssign.title} onChange={e => setNewAssign({ ...newAssign, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Section Stream</label>
                                        <select required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all text-white appearance-none" value={newAssign.sectionId} onChange={e => setNewAssign({ ...newAssign, sectionId: e.target.value })}>
                                            <option value="">Select Target...</option>
                                            {sections.map(s => <option key={s.id} value={s.id} className="bg-black">{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Subject</label>
                                        <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all" value={newAssign.subject} onChange={e => setNewAssign({ ...newAssign, subject: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Deadline</label>
                                        <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all" value={newAssign.deadline} onChange={e => setNewAssign({ ...newAssign, deadline: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Max Marks</label>
                                        <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all" value={newAssign.maxMarks} onChange={e => setNewAssign({ ...newAssign, maxMarks: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Description</label>
                                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all min-h-[100px]" value={newAssign.description} onChange={e => setNewAssign({ ...newAssign, description: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-[var(--accent-primary)] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--accent-primary)]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                    <Send size={18} /> Deploy Assignment Protocol
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-lg p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Upload Assignment Uplink</h3>
                                <button onClick={() => setShowUploadModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Submission Notes</label>
                                    <textarea required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[var(--accent-primary)] outline-none min-h-[120px]" placeholder="Briefly describe your solution approach..." value={uploadData.content} onChange={e => setUploadData({ ...uploadData, content: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Uplink URL (Drive / GitHub)</label>
                                    <input type="url" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[var(--accent-primary)] outline-none" placeholder="https://..." value={uploadData.fileLink} onChange={e => setUploadData({ ...uploadData, fileLink: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all">
                                    Transmit Submission
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showGradingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-accent w-full max-w-md p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Award Academic Marks</h3>
                                <button onClick={() => setShowGradingModal(false)}><X size={24} /></button>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1 italic">Recipient Identification</p>
                                <p className="font-bold text-[var(--text-primary)]">{selectedSubmission.studentName}</p>
                            </div>
                            <form onSubmit={handleGrade} className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">Marks Score Protocol</label>
                                    <input type="number" required max={selectedAssignment.maxMarks} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-4xl font-black text-center text-[var(--accent-primary)] outline-none focus:border-[var(--accent-primary)]" placeholder={`/ ${selectedAssignment.maxMarks}`} value={gradingData.marks} onChange={e => setGradingData({ ...gradingData, marks: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1 opacity-50">Performance Feedback</label>
                                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[var(--accent-primary)] outline-none min-h-[100px]" placeholder="Briefly comment on student performance..." value={gradingData.feedback} onChange={e => setGradingData({ ...gradingData, feedback: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all">
                                    Deploy Grades
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Assignments;
