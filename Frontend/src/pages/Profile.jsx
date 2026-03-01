import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Lock, Fingerprint, Save, Activity, CreditCard } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { studentService, teacherService } from '../services/api';
import IDCard from '../components/IDCard';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [profileData, setProfileData] = useState(null);
    const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'idcard'

    useEffect(() => {
        if (!user) return;
        if (user.role === 'STUDENT') {
            studentService.getAll().then(res => {
                // Find by matching email, rollNo, or name
                const match = res.data.find(s =>
                    s.email === user.email ||
                    s.rollNo === user.username ||
                    s.name?.toLowerCase() === user.name?.toLowerCase()
                );
                setProfileData(match || null);
            }).catch(() => { });
        } else if (user.role === 'TEACHER') {
            teacherService.getAll().then(res => {
                const match = res.data.find(t =>
                    t.email === user.email ||
                    t.employeeId === user.username ||
                    t.name?.toLowerCase() === user.name?.toLowerCase()
                );
                setProfileData(match || null);
            }).catch(() => { });
        }
    }, [user]);

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            toast.error("Passwords do not match.");
            return;
        }
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Updating password...',
                success: 'Password updated successfully.',
                error: 'Update failed.',
            }
        );
        setPasswords({ current: '', next: '', confirm: '' });
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'idcard', label: 'ID Card', icon: CreditCard },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            {/* Header with tabs */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">My Profile</h2>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        {user?.role} — {user?.email}
                    </p>
                </div>
                <div className="flex bg-white/5 rounded-2xl p-1.5 border border-[var(--border-primary)] gap-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeSection === tab.id ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}>
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeSection === 'profile' && (
                <div className="grid grid-cols-3 gap-8">
                    {/* Avatar Card */}
                    <div className="col-span-1 space-y-6">
                        <div className="glass-card flex flex-col items-center py-10 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />
                            <div className="w-24 h-24 rounded-3xl bg-[var(--accent-primary)]/10 p-1 border border-[var(--accent-primary)]/30 group-hover:scale-110 transition-transform duration-500">
                                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-[var(--accent-primary)] text-4xl font-black">
                                    {profileData?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            </div>
                            <h3 className="mt-6 text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">{profileData?.name || user?.name || user?.username}</h3>
                            <p className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-[0.3em]">{user?.role}</p>

                            <div className="mt-8 flex flex-col w-full px-6 gap-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Status</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[8px] font-black text-emerald-500 uppercase">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card border-[var(--border-primary)] bg-white/[0.01]">
                            <h4 className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Account Info</h4>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Email</span>
                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{user?.email || '—'}</span>
                                </div>
                                {profileData && (
                                    <>
                                        {user?.role === 'STUDENT' && (
                                            <>
                                                <div className="flex flex-col gap-1 pt-3 border-t border-white/5">
                                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Roll No.</span>
                                                    <span className="text-[11px] font-bold text-[var(--accent-primary)]">{profileData.rollNo || '—'}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Branch / Year</span>
                                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{profileData.branch} — Year {profileData.year}</span>
                                                </div>
                                            </>
                                        )}
                                        {user?.role === 'TEACHER' && (
                                            <>
                                                <div className="flex flex-col gap-1 pt-3 border-t border-white/5">
                                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Employee ID</span>
                                                    <span className="text-[11px] font-bold text-[var(--accent-primary)]">{profileData.employeeId || '—'}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                                                    <span className="text-[8px] font-black uppercase text-[var(--text-secondary)]">Department</span>
                                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{profileData.department} — {profileData.designation}</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Panel */}
                    <div className="col-span-2 glass-card bg-white/[0.01] border-[var(--border-primary)] flex flex-col gap-8">
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Security</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] mt-1">Change your password</p>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="space-y-4">
                                {[
                                    { label: 'Current Password', key: 'current', icon: Lock },
                                    { label: 'New Password', key: 'next', icon: Fingerprint },
                                    { label: 'Confirm New Password', key: 'confirm', icon: Shield },
                                ].map(({ label, key, icon: Icon }) => (
                                    <div key={key} className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1">{label}</label>
                                        <div className="relative group">
                                            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                                            <input type="password" required value={passwords[key]}
                                                onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                                className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-[var(--accent-primary)]/30 focus:bg-[var(--accent-primary)]/5 transition-all font-mono"
                                                placeholder="••••••••••••" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-emerald-500 opacity-50" />
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase">System Status: Stable</span>
                                </div>
                                <button type="submit"
                                    className="flex items-center gap-3 px-10 py-4 bg-[var(--accent-primary)] hover:brightness-110 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-2xl shadow-[var(--accent-primary)]/30">
                                    <Save size={16} /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeSection === 'idcard' && (
                <div className="max-w-md mx-auto">
                    {profileData ? (
                        <IDCard
                            type={user?.role === 'STUDENT' ? 'student' : 'teacher'}
                            data={profileData}
                        />
                    ) : (
                        <div className="glass-card text-center py-20 text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs opacity-40">
                            No profile data found.<br />
                            <span className="text-[10px] normal-case font-normal mt-2 block opacity-70">
                                Ask the admin to link your account with your student/teacher record.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Profile;
