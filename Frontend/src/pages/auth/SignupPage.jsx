import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, GraduationCap, Laptop, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../services/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const [role, setRole] = useState('STUDENT');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) return alert('Please fill all fields');
        if (password !== confirmPassword) return alert('Passwords do not match');

        setLoading(true);
        try {
            await signup({ username, email, password, role });
            // After signup, automatically log them in
            await login(role, { username, password });
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'STUDENT', label: 'Student', icon: GraduationCap },
        { id: 'TEACHER', label: 'Teacher', icon: Laptop },
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-primary)]">
            {/* Dynamic Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent-primary)]/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-primary)]/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md glass-card-accent p-10 z-10 border-[var(--border-primary)]"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[var(--accent-primary)]/10 border border-white/10 overflow-hidden transition-all duration-500">
                        <img src="/logo.jpeg" alt="Avanthi Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Avanthi Node</h1>
                    <p className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-[0.4em] mt-2 text-[var(--accent-primary)]">Infrastructural Onboarding</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] pl-1">Choose Portal Access</label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${role === r.id
                                        ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg shadow-[var(--accent-primary)]/10'
                                        : 'bg-white/5 border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-white/10'
                                        }`}
                                >
                                    <r.icon size={20} className={role === r.id ? 'text-[var(--accent-primary)]' : 'text-inherit'} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Full Legal Name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                            <input
                                type="email"
                                placeholder="Institutional Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                            <input
                                type="password"
                                placeholder="Secure Access Pin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                            <input
                                type="password"
                                placeholder="Confirm Access Pin"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--accent-primary)] hover:brightness-110 rounded-2xl font-black text-white shadow-xl shadow-[var(--accent-primary)]/20 transition-all border border-white/10 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing Hash...' : 'Create Credentials'}
                    </button>
                </form>

                <div className="mt-8 text-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[var(--text-secondary)]">Already verified? </span>
                    <Link to="/login" className="text-[var(--accent-primary)] hover:brightness-125 transition-colors">SignIn Access</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
