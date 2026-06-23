import React, { useState } from 'react';
import { transferFunds } from '../services/financeService';
import { X, Send, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const TransferModal = ({ isOpen, onClose, onSuccess, currentBalance }) => {
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleTransfer = async (e) => {
        e.preventDefault();
        setError('');
        
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount greater than $0.00');
            return;
        }
        
        if (numAmount > currentBalance) {
            setError('Insufficient liquidity in sender pool.');
            return;
        }

        setIsProcessing(true);
        try {
            await transferFunds(receiverEmail, numAmount, description);
            setReceiverEmail('');
            setAmount('');
            setDescription('');
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed. Verify the recipient email exists.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn font-sans">
            
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 transform transition-all text-left flex flex-col">
            
                <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Send size={14} strokeWidth={2.5} className="ml-0.5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Secure Dispatch Desk</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Local Bridge Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 bg-slate-50/50">
                    <form onSubmit={handleTransfer} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium flex items-start space-x-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Target Recipient Email</label>
                            <input type="email" required value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 text-slate-400 font-medium">$</span>
                                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Available Balance</label>
                                <div className="w-full px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 flex justify-between">
                                    <span>$</span><span>{currentBalance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Memo / Description</label>
                            <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Contract Settlement" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start space-x-3 mt-6">
                            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Immediate settlement protocol: Funds get programmatically locked and committed instantly across Docker instances.
                            </p>
                        </div>

                        <button type="submit" disabled={isProcessing || !receiverEmail || !amount || !description} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center text-sm disabled:opacity-50 cursor-pointer">
                            {isProcessing ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                            {isProcessing ? 'Committing to Ledger...' : 'Authorize Immediate Dispatch'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransferModal; 