import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send OTP');
            }

            alert('Emergency Dispatch: OTP sent to the provided identity node.');
            navigate('/reset-password', { state: { email } });
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
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Identity Recovery</h1>
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 text-[var(--accent-primary)]">Protocol: OTP Dispatch</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                        <input
                            type="email"
                            placeholder="Registered Institutional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-[var(--accent-primary)]/5 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-bold text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--accent-primary)] hover:brightness-110 rounded-2xl font-black text-white shadow-xl shadow-[var(--accent-primary)]/20 transition-all border border-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        {loading ? 'Dispatching...' : <><Send size={16} /> Request OTP</>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft size={14} /> Abort Recovery
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
