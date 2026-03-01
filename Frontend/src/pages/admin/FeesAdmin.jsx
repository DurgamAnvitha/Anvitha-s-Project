import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Wallet, CreditCard, AlertCircle, Edit2, Trash2, CheckCircle, X, TrendingUp, TrendingDown } from 'lucide-react';
import { feeService, studentService } from '../../services/api';

const FeesAdmin = () => {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('ADD'); // ADD or EDIT
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ studentId: '', feeType: 'Tuition', amount: 0, paidAmount: 0, dueDate: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fRes, sRes] = await Promise.all([
                feeService.getAll(),
                studentService.getAll()
            ]);
            setFees(fRes.data || []);
            setStudents(sRes.data || []);
        } catch (error) {
            console.error('FeesAdmin Data Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                pendingAmount: form.amount - form.paidAmount,
                status: (form.amount - form.paidAmount) <= 0 ? 'PAID' : (form.paidAmount > 0 ? 'PARTIAL' : 'PENDING')
            };

            if (modalMode === 'EDIT') {
                await feeService.update(editingId, payload);
            } else {
                await feeService.create(payload);
            }

            setShowModal(false);
            setForm({ studentId: '', feeType: 'Tuition', amount: 0, paidAmount: 0, dueDate: '' });
            fetchData();
        } catch (error) {
            alert('Failed to save fee record');
        }
    };

    const handleEdit = (fee) => {
        setModalMode('EDIT');
        setEditingId(fee.id || fee._id);
        setForm({
            studentId: fee.studentId,
            feeType: fee.feeType,
            amount: fee.amount,
            paidAmount: fee.paidAmount,
            dueDate: fee.dueDate
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this financial record?')) return;
        try {
            await feeService.delete(id);
            fetchData();
        } catch (error) {
            alert('Failed to delete record');
        }
    };

    const totalRevenue = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalPending = fees.reduce((acc, f) => acc + (f.pendingAmount || 0), 0);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Financial Stream Control</h2>
                    <div className="flex items-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <TrendingUp className="text-emerald-500" size={14} />
                            <span className="font-black text-emerald-500 uppercase tracking-widest italic font-mono">COLLECTED: ₹{totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <TrendingDown size={14} className="text-red-500" />
                            <span className="font-black text-red-500 uppercase tracking-widest italic font-mono">OUTSTANDING: ₹{totalPending.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[var(--accent-primary)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH BY ROLL NUMBER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all w-full md:w-80"
                        />
                    </div>
                    <button
                        onClick={() => { setModalMode('ADD'); setForm({ studentId: '', feeType: 'Tuition', amount: 0, paidAmount: 0, dueDate: '' }); setShowModal(true); }}
                        className="bg-[var(--accent-primary)] text-white p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/20">
                                <th className="py-6 px-8">Fee Type & Due Date</th>
                                <th className="py-6 px-8">Student Identification</th>
                                <th className="py-6 px-8">Balance Due</th>
                                <th className="py-6 px-8">Payment Protocol</th>
                                <th className="py-6 px-8 text-right">Terminal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fees.filter(f => students.find(s => s.id === f.studentId)?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())).map((fee, i) => {
                                const student = students.find(s => s.id === fee.studentId);
                                return (
                                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--text-primary)] text-[13px] uppercase italic tracking-tight">{fee.feeType}</p>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1 italic">TERM END: {fee.dueDate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">{student?.name || 'REGISTRY ERROR'}</p>
                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 mt-1 tracking-[0.2em] italic font-mono">{student?.rollNo || '###'}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <p className="text-[14px] font-black text-white tracking-tighter italic font-mono">₹{fee.pendingAmount?.toLocaleString()}</p>
                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">TOTAL: ₹{fee.amount?.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border transition-all 
                                                ${fee.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                                    fee.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                                                {fee.status}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => handleEdit(fee)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-[var(--accent-primary)] shadow-lg"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(fee.id || fee._id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-500 shadow-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-[0.5em]">No Financial Transactions Logged</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg glass-card border-[var(--border-primary)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-center mb-8 border-l-4 border-[var(--accent-primary)] pl-4">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                    {modalMode === 'EDIT' ? 'Modify Transaction Entry' : 'Build New Financial Protocol'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <SelectGroup
                                    label="Target Registrant"
                                    options={students.map(s => ({ label: `${s.name} (${s.rollNo})`, value: s.id }))}
                                    value={form.studentId}
                                    onChange={v => setForm({ ...form, studentId: v })}
                                />
                                <SelectGroup
                                    label="Financial Protocol category"
                                    options={[
                                        { label: 'Tuition Fee', value: 'Tuition Fee' },
                                        { label: 'Library Asset Fine', value: 'Library Late Fee' },
                                        { label: 'Examination Terminal', value: 'Exam Fee' },
                                        { label: 'Event/Workshop Pass', value: 'Event Fee' }
                                    ]}
                                    value={form.feeType}
                                    onChange={v => setForm({ ...form, feeType: v })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormGroup
                                        label="Total Capital Due"
                                        type="number"
                                        value={form.amount}
                                        onChange={v => setForm({ ...form, amount: parseFloat(v) })}
                                    />
                                    <FormGroup
                                        label="Capital Already Remitted"
                                        type="number"
                                        value={form.paidAmount}
                                        onChange={v => setForm({ ...form, paidAmount: parseFloat(v) })}
                                    />
                                </div>
                                <FormGroup
                                    label="Settlement Terminal Date"
                                    type="date"
                                    value={form.dueDate}
                                    onChange={v => setForm({ ...form, dueDate: v })}
                                />

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">Cancel Override</button>
                                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,100,0,0.3)] transition-all">
                                        {modalMode === 'EDIT' ? 'Synchronize Record' : 'Commit To Ledger'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, type = "text", value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 italic">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all font-mono"
        />
    </div>
);

const SelectGroup = ({ label, options, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 italic">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all appearance-none"
        >
            <option value="" className="bg-zinc-900">SELECT TARGET PROTOCOL...</option>
            {options.map((opt, i) => <option key={i} value={opt.value} className="bg-zinc-900">{opt.label}</option>)}
        </select>
    </div>
);

export default FeesAdmin;
