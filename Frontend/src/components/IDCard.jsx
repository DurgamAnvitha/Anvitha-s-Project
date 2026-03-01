import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, Hash, Mail, Calendar, GraduationCap, Briefcase } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   IDCard component
   Props:
     type:    'student' | 'teacher'
     data:    student or teacher object from the DB
     college: optional college name override
   ───────────────────────────────────────────────────────────── */
const IDCard = ({ type = 'student', data = {}, college = 'Avanthi Institute of Engineering & Technology' }) => {
    const cardRef = useRef(null);

    if (!data || !data.name) return null;

    const initial = data.name?.charAt(0)?.toUpperCase() || '?';
    const isStudent = type === 'student';

    const handlePrint = () => {
        const printContent = document.getElementById('id-card-print-area');
        const win = window.open('', '_blank', 'width=500,height=800');
        win.document.write(`
            <html><head><title>ID Card – ${data.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { margin: 0; padding: 20px; background: #000; font-family: Inter, sans-serif; display:flex; justify-content:center; }
                * { box-sizing: border-box; }
            </style></head>
            <body>${printContent.innerHTML}</body></html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">
                    🪪 Digital ID Card
                </h3>
                <button onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)]/20 transition-all">
                    <Download size={12} /> Print / Save
                </button>
            </div>

            {/* Card */}
            <div id="id-card-print-area" ref={cardRef}>
                <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-[var(--accent-primary)]/30 shadow-2xl shadow-[var(--accent-primary)]/10"
                    style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)' }}>

                    {/* Top banner */}
                    <div className="px-6 py-4 flex items-center justify-between"
                        style={{ background: 'linear-gradient(90deg, #1a1a4e, #2a1a6e)' }}>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-wide leading-tight">{college}</p>
                            <p className="text-white/50 text-[9px] uppercase tracking-[0.3em] mt-0.5">
                                {isStudent ? 'Student Identity Card' : 'Faculty Identity Card'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center">
                            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 flex gap-5 items-start">
                        {/* Photo / Avatar */}
                        <div className="flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 flex items-center justify-center shadow-lg">
                            <span className="text-5xl font-black text-[var(--accent-primary)]">{initial}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2">
                            <div>
                                <p className="font-black text-white text-lg leading-tight uppercase tracking-tight">{data.name}</p>
                                {isStudent && (
                                    <p className="text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                                        {data.branch || 'N/A'} — Year {data.year || '?'}
                                    </p>
                                )}
                                {!isStudent && (
                                    <p className="text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                                        {data.designation || 'Faculty'} — {data.department || 'N/A'}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 mt-2">
                                {isStudent ? (
                                    <>
                                        <InfoRow icon={<Hash size={10} className="opacity-60" />} label="Roll No" value={data.rollNo || '—'} />
                                        <InfoRow icon={<Mail size={10} className="opacity-60" />} label="Email" value={data.email || '—'} />
                                        <InfoRow icon={<GraduationCap size={10} className="opacity-60" />} label="Joining" value={data.joiningYear ? `${data.joiningYear} – ${data.passingYear || '?'}` : '—'} />
                                    </>
                                ) : (
                                    <>
                                        <InfoRow icon={<Briefcase size={10} className="opacity-60" />} label="Emp. ID" value={data.employeeId || '—'} />
                                        <InfoRow icon={<Mail size={10} className="opacity-60" />} label="Email" value={data.email || '—'} />
                                        <InfoRow icon={<Calendar size={10} className="opacity-60" />} label="Joined" value={data.joiningDate || '—'} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barcode strip */}
                    <div className="px-6 pb-5">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                            {/* Simulated barcode */}
                            <div className="flex gap-px h-8 items-end">
                                {Array.from({ length: 28 }).map((_, i) => (
                                    <div key={i} style={{ height: `${Math.random() * 70 + 30}%`, width: i % 5 === 0 ? '3px' : '1.5px' }}
                                        className="bg-[var(--accent-primary)] opacity-60 rounded-sm" />
                                ))}
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">ID No.</p>
                                <p className="text-[10px] font-mono font-black text-white/70">
                                    {isStudent ? data.rollNo || data.id?.slice(-8)?.toUpperCase() : data.employeeId || data.id?.slice(-8)?.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center gap-2">
                            <Shield size={12} className="text-[var(--accent-primary)] opacity-50" />
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">
                                {isStudent ? 'Student' : 'Faculty'} • {new Date().getFullYear()}–{new Date().getFullYear() + 1}
                            </span>
                        </div>
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">
                            If found, please return to admin office
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        <span className="text-[var(--accent-primary)]">{icon}</span>
        <span className="text-[9px] font-black text-white/40 uppercase w-14 flex-shrink-0">{label}:</span>
        <span className="text-[10px] font-bold text-white/80 truncate">{value}</span>
    </div>
);

export default IDCard;
