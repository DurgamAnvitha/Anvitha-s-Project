import React from 'react';
import { motion } from 'framer-motion';

export const CardSkeleton = () => (
    <div className="glass-card bg-white/[0.01] border-[var(--border-primary)] overflow-hidden relative">
        <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent z-0"
        />
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-32 h-6 bg-white/5 rounded-lg" />
            <div className="w-20 h-4 bg-white/5 rounded-lg" />
        </div>
        <div className="space-y-4 relative z-10">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5" />
                        <div>
                            <div className="w-40 h-4 bg-white/5 rounded-md mb-2" />
                            <div className="w-24 h-3 bg-white/5 rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const StatSkeleton = () => (
    <div className="glass-card-accent border-[var(--border-primary)] overflow-hidden relative">
        <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/5 to-transparent z-0"
        />
        <div className="w-12 h-12 rounded-2xl bg-white/5 mb-4 relative z-10" />
        <div className="w-24 h-4 bg-white/5 rounded-md mb-2 relative z-10" />
        <div className="w-16 h-8 bg-white/5 rounded-md relative z-10" />
    </div>
);

export const TableSkeleton = () => (
    <div className="glass-card bg-white/[0.01] border-[var(--border-primary)] overflow-hidden relative">
        <div className="w-48 h-6 bg-white/5 rounded-lg mb-8" />
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                        <div className="w-40 h-4 bg-white/5 rounded-md" />
                    </div>
                    <div className="w-24 h-4 bg-white/5 rounded-md" />
                    <div className="w-16 h-6 bg-white/5 rounded-full" />
                </div>
            ))}
        </div>
    </div>
);
