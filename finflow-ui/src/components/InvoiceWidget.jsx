import React, { useState, useEffect } from 'react';
import { getInvoiceInbox, createInvoice, payInvoice, cancelInvoice } from '../services/financeService';
import { FileText, Plus, Loader2, CheckCircle2, XCircle, ArrowDownLeft } from 'lucide-react';

const InvoiceWidget = ({ onPaymentSuccess, refreshTrigger }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [targetEmail, setTargetEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchInvoices = async () => {
        try {
            const data = await getInvoiceInbox();
            setInvoices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [refreshTrigger]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createInvoice(targetEmail, parseFloat(amount), desc);
            setTargetEmail(''); setAmount(''); setDesc('');
            alert("Invoice securely dispatched!");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to send invoice");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePay = async (id) => {
        setProcessingId(id);
        try {
            await payInvoice(id);
            await fetchInvoices();
            onPaymentSuccess(); 
        } catch (err) {
            alert(err.response?.data?.message || "Payment failed. Insufficient funds?");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (id) => {
        setProcessingId(id);
        try {
            await cancelInvoice(id);
            await fetchInvoices();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit">
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-3 bg-white rounded-t-2xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Plus size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 tracking-tight">Request Funds</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Issue an internal bill</p>
                    </div>
                </div>
                
                {/* Form Body */}
                <div className="p-6 sm:p-8 space-y-5 bg-white rounded-b-2xl">
                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Target Email</label>
                            <input 
                                type="email" 
                                required 
                                value={targetEmail} 
                                onChange={e => setTargetEmail(e.target.value)} 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xs" 
                                placeholder="bruce@waynenterprises.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-2.5 text-slate-400 font-medium text-sm">$</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    required 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)} 
                                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xs" 
                                    placeholder="150.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Memo / Description</label>
                            <input 
                                type="text" 
                                required 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xs" 
                                placeholder="Contract Settlement"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting || !targetEmail || !amount || !desc} 
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center text-sm disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin mr-2"/> : <FileText size={16} className="mr-2"/>}
                            Dispatch Invoice
                        </button>
                    </form>
                </div>
            </div>

            {/* Accounts Payable */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <ArrowDownLeft size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Accounts Payable</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Pending internal invoices</p>
                        </div>
                    </div>
                </div>
                
                {/* List Body */}
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[500px] bg-slate-50/40">
                    {loading ? (
                        <div className="text-center text-slate-400 text-sm py-12 flex flex-col items-center">
                            <Loader2 size={24} className="animate-spin text-indigo-400 mb-3" />
                            Scanning Inbox...
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-base font-semibold text-slate-900">Inbox Zero</p>
                            <p className="text-sm text-slate-500 mt-1">You have no pending invoices to pay.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invoices.map(inv => (
                                <div key={inv.id} className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${inv.status === 'PENDING' ? 'bg-white border-slate-200/80 shadow-2xs hover:border-indigo-200' : 'bg-slate-50/60 border-slate-100 opacity-75'}`}>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                                inv.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                                                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                                                'bg-rose-50 text-rose-700 border-rose-200/60'
                                            }`}>
                                                {inv.status}
                                            </span>
                                            <span className="text-xs font-mono font-medium text-slate-400">INV-{inv.id}</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-slate-900">{inv.requesterEmail}</h4>
                                        <p className="text-xs text-slate-500">{inv.description}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
                                        <span className={`text-sm font-mono font-semibold ${inv.status === 'PENDING' ? 'text-slate-900' : 'text-slate-400'}`}>
                                            ${parseFloat(inv.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                        </span>

                                        {inv.status === 'PENDING' && (
                                            <div className="flex items-center space-x-1.5">
                                                <button 
                                                    onClick={() => handleDecline(inv.id)} 
                                                    disabled={processingId === inv.id} 
                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Decline Invoice"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handlePay(inv.id)} 
                                                    disabled={processingId === inv.id} 
                                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all flex items-center cursor-pointer shadow-2xs disabled:opacity-50"
                                                >
                                                    {processingId === inv.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                                                    Pay
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default InvoiceWidget;