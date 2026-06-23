import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TransactionTable = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <div className="p-8 text-center text-slate-400 text-sm font-medium">No ledger history available.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500">Transaction</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500">Description</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500">Date & Time</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500">Risk Profile</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-5">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-lg ${tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {tx.type === 'DEPOSIT' ? <ArrowDownRight size={16} strokeWidth={2.5} /> : <ArrowUpRight size={16} strokeWidth={2.5} />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                        {tx.type === 'DEPOSIT' ? 'Deposit' : 'Wire Transfer'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3.5 px-5 text-sm text-slate-600 truncate max-w-[200px]">
                                {tx.description}
                            </td>
                            <td className="py-3.5 px-5 text-sm text-slate-500">
                                {tx.timestamp ? format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </td>
                            <td className="py-3.5 px-5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    tx.riskScore === 'LOW' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    tx.riskScore === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                                    'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                    {tx.riskScore || 'UNKNOWN'}
                                </span>
                            </td>
                            <td className={`py-3.5 px-5 text-sm font-mono font-medium text-right ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.type === 'DEPOSIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;