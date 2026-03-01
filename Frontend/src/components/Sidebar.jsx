import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Calendar,
    GraduationCap,
    Library,
    LayoutDashboard,
    BookOpen,
    LogOut,
    MessageCircle,
    Fingerprint,
    Grid,
    Activity,
    ShieldAlert,
    CheckSquare,
    ClipboardCheck,
    Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuGroups = [
        {
            title: 'Academic',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
                { id: 'timetable', label: 'Class Schedule', icon: Calendar, path: '/timetable', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
                { id: 'cohorts', label: 'My Students', icon: Users, path: '/cohorts', roles: ['TEACHER'] },
                { id: 'attendance', label: 'Attendance', icon: Activity, path: '/attendance', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
                { id: 'grades', label: 'Grades & Results', icon: GraduationCap, path: '/grades', roles: ['ADMIN', 'STUDENT'] },
                { id: 'library', label: 'Knowledge Hub', icon: Library, path: '/library', roles: ['STUDENT'] },
                { id: 'assignments', label: 'Assignments', icon: BookOpen, path: '/assignments', roles: ['STUDENT'] },
                { id: 'teacher_assignments', label: 'Manage Assignments', icon: BookOpen, path: '/assignments', roles: ['TEACHER'] },
                { id: 'evaluate', label: 'Grade Submissions', icon: ClipboardCheck, path: '/assignments', roles: ['TEACHER'] },
                { id: 'queries', label: 'Student Queries', icon: MessageCircle, path: '/queries', roles: ['TEACHER'] },
            ]
        },
        {
            title: 'Administration',
            items: [
                { id: 'students', label: 'Manage Students', icon: Users, path: '/students', roles: ['ADMIN'] },
                { id: 'teachers', label: 'Manage Teachers', icon: Users, path: '/teachers', roles: ['ADMIN'] },
                { id: 'sections', label: 'Manage Sections', icon: Grid, path: '/sections', roles: ['ADMIN'] },
                { id: 'library_admin', label: 'Library Control', icon: Library, path: '/library-admin', roles: ['ADMIN'] },
                { id: 'fees_admin', label: 'Finance Control', icon: Wallet, path: '/fees-admin', roles: ['ADMIN'] },
                { id: 'placement_admin', label: 'Placement Control', icon: GraduationCap, path: '/placements-admin', roles: ['ADMIN'] },
                { id: 'queries_admin', label: 'Queries & Support', icon: MessageCircle, path: '/queries', roles: ['ADMIN', 'STUDENT'] },
            ]
        }
    ];

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-72 glass rounded-[2.5rem] p-8 flex flex-col gap-10 z-10 border-[var(--border-primary)] shadow-2xl relative overflow-hidden"
        >
            {/* Logo Section */}
            <div className="flex flex-col gap-2 relative z-10 group cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden group-hover:rotate-6 transition-transform">
                        <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">Avanthi Institute</span>
                        <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1">Engineering & Technology</span>
                    </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-4" />
            </div>

            {/* Navigation Nodes */}
            <nav className="flex-1 flex flex-col gap-10 overflow-y-auto custom-scrollbar pr-2 scroll-smooth">
                {menuGroups.map((group) => {
                    const visibleItems = group.items.filter(item => item.roles.includes(user?.role));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.title} className="flex flex-col gap-3">
                            <h3 className="px-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">{group.title}</h3>
                            <div className="space-y-2">
                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative ${isActive
                                                ? 'bg-[var(--accent-primary)] text-white shadow-[0_10px_30px_rgba(var(--accent-primary-rgb),0.3)] scale-[1.02]'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent hover:border-white/5'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-[var(--accent-primary)] transition-colors'} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                {isActive && (
                                                    <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-white rounded-full relative z-10" />
                                                )}
                                                {!isActive && (
                                                    <div className="w-1.5 h-1.5 bg-white/10 rounded-full group-hover:bg-[var(--accent-primary)]/40 transition-colors" />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* System Controls */}
            <div className="mt-auto flex flex-col gap-3 pt-8 border-t border-white/10 relative z-10">
                <h3 className="px-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">Account</h3>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group ${isActive
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                        }`
                    }
                >
                    <Fingerprint size={20} className="text-[var(--accent-primary)]" />
                    <span className="text-[11px] font-black uppercase tracking-widest">My Profile</span>
                </NavLink>

                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-red-500/70 hover:text-white hover:bg-red-500 transition-all duration-500 font-black border border-transparent hover:border-red-500/20 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LogOut size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest relative z-10">Logout</span>
                </button>
            </div>

            {/* Aesthetic Glow */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--accent-primary)]/10 blur-[80px] rounded-full translate-x-20 translate-y-20 -z-10" />
        </motion.aside>
    );
};

export default Sidebar;
