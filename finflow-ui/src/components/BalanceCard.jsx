import React from 'react';
import { Wallet, Cpu } from 'lucide-react';

const BalanceCard = ({ balance, currency = 'USD' }) => {
    return (
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
            
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="flex items-center space-x-2 text-indigo-300">
                    <Wallet size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Available Liquidity</span>
                </div>
                <div className="bg-white/10 px-2.5 py-1 rounded-md border border-white/10 flex items-center space-x-1.5">
                    <Cpu size={14} className="text-indigo-300" />
                    <span className="text-[10px] font-bold text-white tracking-widest">{currency}</span>
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    ${balance !== undefined ? parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </h2>
            </div>

            <div className="relative z-10 mt-8 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-slate-300 font-medium">SQL Ledger Synced</span>
                </div>
                <span className="text-indigo-400/80 font-mono text-[10px] uppercase tracking-widest font-semibold">Immutable State</span>
            </div>
        </div>
    );
};

export default BalanceCard;