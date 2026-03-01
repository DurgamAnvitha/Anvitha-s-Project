import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Book, Clock, AlertCircle, Edit2, Trash2, CheckCircle, X, RotateCcw } from 'lucide-react';
import { libraryService, studentService } from '../../services/api';

const LibraryAdmin = () => {
    const [books, setBooks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('BOOKS'); // BOOKS or ISSUES
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('ADD_BOOK'); // ADD_BOOK, EDIT_BOOK, ISSUE_BOOK
    const [editingId, setEditingId] = useState(null);

    const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', totalCopies: 1, availableCopies: 1 });
    const [issueForm, setIssueForm] = useState({ studentId: '', bookId: '', returnDate: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, sRes, iRes] = await Promise.all([
                libraryService.getAllBooks(),
                studentService.getAll(),
                libraryService.getAllIssues()
            ]);
            setBooks(bRes.data || []);
            setStudents(sRes.data || []);
            setIssues(iRes.data || []);
        } catch (error) {
            console.error('LibraryAdmin Data Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'EDIT_BOOK') {
                await libraryService.updateBook(editingId, bookForm);
            } else {
                await libraryService.addBook({ ...bookForm, availableCopies: bookForm.totalCopies });
            }
            setShowModal(false);
            setBookForm({ title: '', author: '', category: '', totalCopies: 1, availableCopies: 1 });
            fetchData();
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        try {
            await libraryService.issueBook(issueForm);
            setShowModal(false);
            setIssueForm({ studentId: '', bookId: '', returnDate: '' });
            fetchData();
        } catch (error) {
            alert('Failed to issue resource');
        }
    };

    const handleEditBook = (book) => {
        setModalMode('EDIT_BOOK');
        setEditingId(book.id || book.bookId); // MongoDB uses id, check entity
        setBookForm({
            title: book.title,
            author: book.author,
            category: book.category,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies
        });
        setShowModal(true);
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Erase this resource from central repository?')) return;
        try {
            await libraryService.deleteBook(bookId);
            fetchData();
        } catch (error) {
            alert('Failed to delete book');
        }
    };

    const handleDeleteIssue = async (issueId) => {
        if (!window.confirm('Erase this circulation record?')) return;
        try {
            await libraryService.deleteIssue(issueId);
            fetchData();
        } catch (error) {
            alert('Failed to delete circulation record');
        }
    };

    const handleReturnBook = async (issueId) => {
        if (!window.confirm('Acknowledge resource return and close circulation record?')) return;
        try {
            await libraryService.returnBook(issueId);
            fetchData();
        } catch (error) {
            alert('Failed to process return');
        }
    };

    const filteredBooks = books.filter(b =>
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredIssues = issues.filter(i => {
        const student = students.find(s => (s.id || s._id) === i.studentId);
        const book = books.find(b => (b.bookId || b.id) === i.bookId);
        const searchLow = searchTerm.toLowerCase();
        return student?.name?.toLowerCase().includes(searchLow) ||
            student?.rollNo?.toLowerCase().includes(searchLow) ||
            book?.title?.toLowerCase().includes(searchLow);
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Library Inventory Hub</h2>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => { setView('BOOKS'); setSearchTerm(''); }}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'BOOKS' ? 'bg-[var(--accent-primary)] text-white shadow-[0_5px_15px_rgba(255,100,0,0.2)]' : 'bg-white/5 text-[var(--text-secondary)] border border-white/10'}`}
                        >
                            Resource Bank
                        </button>
                        <button
                            onClick={() => { setView('ISSUES'); setSearchTerm(''); }}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'ISSUES' ? 'bg-[var(--accent-primary)] text-white shadow-[0_5px_15px_rgba(255,100,0,0.2)]' : 'bg-white/5 text-[var(--text-secondary)] border border-white/10'}`}
                        >
                            Active Circulations
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[var(--accent-primary)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={view === 'BOOKS' ? "SEARCH BY TITLE/AUTHOR..." : "SEARCH BY REGISTRANT/ID..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all w-full md:w-80"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setModalMode(view === 'BOOKS' ? 'ADD_BOOK' : 'ISSUE_BOOK');
                            setBookForm({ title: '', author: '', category: '', totalCopies: 1, availableCopies: 1 });
                            setIssueForm({ studentId: '', bookId: '', returnDate: '' });
                            setShowModal(true);
                        }}
                        className="bg-[var(--accent-primary)] text-white p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card border-[var(--border-primary)] p-0 overflow-hidden shadow-2xl">
                {view === 'BOOKS' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/20">
                                    <th className="py-6 px-8">Book Asset Details</th>
                                    <th className="py-6 px-8">Subject Classification</th>
                                    <th className="py-6 px-8">Inventory Availability</th>
                                    <th className="py-6 px-8 text-right">Central Terminal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map((book, i) => (
                                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10 shadow-lg">
                                                    <Book size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--text-primary)] text-[13px] uppercase italic tracking-tight">{book.title}</p>
                                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 mt-1 tracking-widest">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${book.availableCopies > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}
                                                        style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-white/40 uppercase font-mono">{book.availableCopies} / {book.totalCopies}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => handleEditBook(book)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-[var(--accent-primary)] shadow-lg"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteBook(book.id || book.bookId)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-500 shadow-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-[0.5em]">No Assets Registered</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] border-b border-white/5 bg-black/20">
                                    <th className="py-6 px-8">Registrant & Asset ID</th>
                                    <th className="py-6 px-8">Circulation Timeline</th>
                                    <th className="py-6 px-8">Operational Protocol</th>
                                    <th className="py-6 px-8 text-right">Central Terminal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIssues.map((issue, i) => {
                                    const student = students.find(s => (s.id || s._id) === issue.studentId);
                                    const book = books.find(b => (b.bookId || b.id) === issue.bookId);
                                    return (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                                            <td className="py-6 px-8">
                                                <div className="flex flex-col">
                                                    <p className="font-black text-white text-[11px] uppercase italic tracking-tighter">{student?.name || 'REGISTRY ERROR'}</p>
                                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase opacity-40 mt-1 tracking-widest italic">Asset: {book?.title || 'UNKNOWN ASSET'}</p>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic font-mono">Issued: {issue.issueDate}</p>
                                                    <p className="text-[9px] font-black text-orange-500 uppercase mt-1 tracking-[0.2em] italic font-mono">Terminal: {issue.returnDate}</p>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border transition-all 
                                                    ${issue.status === 'ISSUED' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    {issue.status === 'ISSUED' && (
                                                        <button onClick={() => handleReturnBook(issue.id || issue.issueId)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-emerald-500 shadow-lg" title="ACKNOWLEDGE RETURN">
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteIssue(issue.id || issue.issueId)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-500 shadow-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredIssues.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-[0.5em]">No Circulations Logged in Terminal</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
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
                                    {modalMode === 'ADD_BOOK' ? 'Integrate New Resource' : modalMode === 'EDIT_BOOK' ? 'Modify Resource Metadata' : 'Initiate Circulation Protocol'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={modalMode === 'ADD_BOOK' || modalMode === 'EDIT_BOOK' ? handleBookSubmit : handleIssueSubmit} className="space-y-6">
                                {modalMode === 'ADD_BOOK' || modalMode === 'EDIT_BOOK' ? (
                                    <>
                                        <FormGroup label="Asset Label/Title" value={bookForm.title} onChange={v => setBookForm({ ...bookForm, title: v })} />
                                        <FormGroup label="Primary Author/Editor" value={bookForm.author} onChange={v => setBookForm({ ...bookForm, author: v })} />
                                        <FormGroup label="Thematic Classification" value={bookForm.category} placeholder="CS / THEORY / SCIENCE" onChange={v => setBookForm({ ...bookForm, category: v })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormGroup label="Total Units" type="number" value={bookForm.totalCopies} onChange={v => setBookForm({ ...bookForm, totalCopies: parseInt(v) })} />
                                            <FormGroup label="Available Units" type="number" value={bookForm.availableCopies} onChange={v => setBookForm({ ...bookForm, availableCopies: parseInt(v) })} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <SelectGroup label="Target Student Registrant" options={students.map(s => ({ label: `${s.name} (${s.rollNo})`, value: s.id || s._id }))} value={issueForm.studentId} onChange={v => setIssueForm({ ...issueForm, studentId: v })} />
                                        <SelectGroup label="Resource Asset Selection" options={books.filter(b => b.availableCopies > 0).map(b => ({ label: b.title, value: b.bookId || b.id }))} value={issueForm.bookId} onChange={v => setIssueForm({ ...issueForm, bookId: v })} />
                                        <FormGroup label="Projected Return Terminal" type="date" value={issueForm.returnDate} onChange={v => setIssueForm({ ...issueForm, returnDate: v })} />
                                    </>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">Cancel Override</button>
                                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,100,0,0.3)] transition-all">
                                        {modalMode === 'EDIT_BOOK' ? 'Update Metadata' : 'Commit To Terminal'}
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

const FormGroup = ({ label, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 italic">{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
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

export default LibraryAdmin;
