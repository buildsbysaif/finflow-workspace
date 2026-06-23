import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, ShieldAlert, PieChart as PieChartIcon } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';

const AnalyticsView = ({ transactions = [], wallet }) => {
    
    // DATA PROCESSING
    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const txCount = transactions.length;
    const activeLiquidity = wallet?.balance !== undefined ? parseFloat(wallet.balance) : 0;

    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    transactions.forEach(tx => {
        if (tx.riskScore) riskCounts[tx.riskScore]++;
        else riskCounts['LOW']++;
    });

    const riskData = [
        { name: 'Low Risk', value: riskCounts.LOW, color: '#10b981' },   
        { name: 'Medium Risk', value: riskCounts.MEDIUM, color: '#f59e0b' },
        { name: 'High Risk', value: riskCounts.HIGH, color: '#f43f5e' }    
    ];

    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayTxs = transactions.filter(tx => tx.timestamp && isSameDay(new Date(tx.timestamp), date));
            const dayVol = dayTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            data.push({
                date: format(date, 'MMM dd'),
                volume: dayVol
            });
        }
        return data;
    }, [transactions]);

    // Custom Tooltip for the Area Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
                    <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
                    <p className="text-white font-mono font-semibold text-sm">
                        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fadeIn mt-2">
            
            {/* TOP METRIC CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                        <Activity size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">System Volume</p>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5 truncate">
                            ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Active Liquidity</p>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5 truncate">
                            ${activeLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3">
                        <ShieldAlert size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Total Transactions</p>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                            {txCount}
                        </h3>
                    </div>
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Liquidity Velocity Chart */}
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <Activity size={16} className="text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Liquidity Velocity (7 Days)</h3>
                        </div>
                    </div>
                    
                    <div className="w-full h-[220px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="volume" 
                                    stroke="#4f46e5" 
                                    strokeWidth={2.5} 
                                    fillOpacity={1} 
                                    fill="url(#colorVolume)" 
                                    activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution Donut Chart */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                        <PieChartIcon size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Risk Distribution</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">AI evaluation of ledger mutations.</p>
                    
                    <div className="w-full h-[180px] flex items-center justify-center mt-2 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55} 
                                    outerRadius={70} 
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '13px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Compact Custom Legend */}
                    <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-100">
                        {riskData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-[13px] font-medium text-slate-600">{item.name}</span>
                                </div>
                                <span className="text-[13px] font-mono font-semibold text-slate-900">{item.value} Tx</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsView;