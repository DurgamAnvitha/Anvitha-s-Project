import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft, Key } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert('Passwords do not match');

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to reset password');
            }

            alert('SUCCESS: Identity Token Restored. Please synchronize access.');
            navigate('/login');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-primary)]">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent-primary)]/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-primary)]/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md glass-card-accent p-10 z-10 border-[var(--border-primary)]"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Token Reset</h1>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 text-[var(--accent-primary)]">Manual Overwrite Initiated</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-4">Resetting for: <span className="text-[var(--accent-primary)]">{email}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                        <input
                            type="text"
                            placeholder="6-Digit Verification OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                        <input
                            type="password"
                            placeholder="New Secure Access Pin"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                        />
                    </div>

                    <div className="relative group">
                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                        <input
                            type="password"
                            placeholder="Confirm New Pin"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--accent-primary)] hover:brightness-110 rounded-2xl font-black text-white shadow-xl shadow-[var(--accent-primary)]/20 transition-all border border-white/10 uppercase tracking-widest text-xs"
                    >
                        {loading ? 'Processing Overwrite...' : 'Apply Identity Reset'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft size={14} /> Return to Onboarding
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
