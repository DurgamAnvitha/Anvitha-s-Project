import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Activity,
    LogOut,
    MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const MobileNav = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    let items = [];
    if (user.role === 'ADMIN') {
        items = [
            { id: 'dashboard', icon: LayoutDashboard, path: '/' },
            { id: 'timetable', icon: Calendar, path: '/timetable' },
            { id: 'students', icon: Users, path: '/students' },
        ];
    } else if (user.role === 'TEACHER') {
        items = [
            { id: 'dashboard', icon: LayoutDashboard, path: '/' },
            { id: 'timetable', icon: Calendar, path: '/timetable' },
            { id: 'attendance', icon: Activity, path: '/attendance' },
        ];
    } else {
        items = [
            { id: 'dashboard', icon: LayoutDashboard, path: '/' },
            { id: 'timetable', icon: Calendar, path: '/timetable' },
            { id: 'attendance', icon: Activity, path: '/attendance' },
        ];
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 glass border-t border-[var(--border-primary)] shadow-2xl safe-area-pb pb-2 px-2 pt-2">
            <div className="flex justify-around items-center">
                {items.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            `p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-110' : 'text-[var(--text-secondary)] hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                            </>
                        )}
                    </NavLink>
                ))}

                <button
                    onClick={logout}
                    className="p-3 rounded-2xl flex flex-col items-center gap-1 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={22} />
                </button>
            </div>
        </div>
    );
};

export default MobileNav;
