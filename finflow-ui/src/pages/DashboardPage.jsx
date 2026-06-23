import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import { getMyWallet, getTransactionHistory, downloadStatement } from '../services/financeService';
import BalanceCard from '../components/BalanceCard';
import TransactionTable from '../components/TransactionTable';
import TransferModal from '../components/TransferModal'; 
import DepositModal from '../components/DepositModal'; 
import AnalyticsView from '../components/AnalyticsView'; 
import VirtualCardsView from '../components/VirtualCardsView'; 
import InvoiceWidget from '../components/InvoiceWidget'; 
import { LogOut, Hexagon, Server, Shield, Clock, Plus, Send, ArrowRightLeft, Activity, Download, BellRing, X, FileText, Home, BarChart3, CreditCard } from 'lucide-react';

const DashboardPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); 
    
    const [clusterStatus, setClusterStatus] = useState('pinging');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); 
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false); 

    const [liveAlert, setLiveAlert] = useState(null);
    const [stompStatus, setStompStatus] = useState('connecting'); 
    const [invoiceRefreshTrigger, setInvoiceRefreshTrigger] = useState(0); 

    const fetchDashboardData = async () => {
        try {
            const walletData = await getMyWallet();
            const txData = await getTransactionHistory();
            setWallet(walletData);
            setTransactions(txData);
            
        } catch (error) {
            console.error("Failed to fetch ledger data", error);

            if (error?.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!user?.email) return;

        const safeUserEmail = user.email.toLowerCase().trim();

        const stompClient = new Client({
            brokerURL: 'wss://finflow-api-f9z7.onrender.com/ws-finflow',
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setStompStatus('connected');
                const userTopic = `/topic/transfers/${safeUserEmail}`;
                stompClient.subscribe(userTopic, (message) => {
                    const payload = JSON.parse(message.body);
                    setLiveAlert(payload);
                    setTimeout(() => {
                        fetchDashboardData();
                        setInvoiceRefreshTrigger(prev => prev + 1); 
                    }, 500);
                    setTimeout(() => setLiveAlert(null), 7000);
                });
            },
            onDisconnect: () => setStompStatus('disconnected'),
            onWebSocketError: () => setStompStatus('disconnected')
        });

        stompClient.activate();
        return () => stompClient.deactivate();
    }, [user]);

    useEffect(() => {
        const verifyClusterConnection = async () => {
            try {
                const response = await axios.get('/api/auth/health-check', { timeout: 2000 });
                if (response.status === 200) setClusterStatus('connected');
                else setClusterStatus('disconnected');
            } catch (err) {
                setClusterStatus('disconnected');
            }
        };
        verifyClusterConnection();
        const intervalId = setInterval(verifyClusterConnection, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const highRiskAnomaliesCount = transactions?.filter(tx => tx.riskScore === 'HIGH').length || 0;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDownloadStatement = async () => {
        try {
            const blob = await downloadStatement();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FINFLOW_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("Error: Could not generate PDF. Check backend connection.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans">
                <Hexagon className="text-indigo-600 animate-spin mb-4" size={40} />
                <p className="font-mono text-xs tracking-widest uppercase text-slate-500 font-bold">Synchronizing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-indigo-100 text-left relative">
            
            {/* DYNAMIC FLOATING TOAST (HANDLES BOTH WIRES AND INVOICES) */}
            {liveAlert && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce w-full max-w-md px-4">
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-start space-x-4 relative">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30 shrink-0 mt-0.5">
                            <BellRing size={20} className="animate-pulse" />
                        </div>
                        <div className="flex-1 pr-6">
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                                    Liquidity Event
                                </span>
                                <span className="text-xs font-mono text-slate-400">Just now</span>
                            </div>
                            
                            {/* Dynamic Title */}
                            <h4 className="text-base font-black tracking-tight mt-1">
                                {liveAlert.type === 'INVOICE_RECEIVED' ? 'New Invoice Received!' : 'Incoming Wire Received!'}
                            </h4>
                            
                            {/* Dynamic Message */}
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {liveAlert.type === 'INVOICE_RECEIVED' 
                                    ? <><span className="font-semibold text-white">{liveAlert.sender}</span> is requesting <span className="font-mono font-bold text-amber-400">${parseFloat(liveAlert.amount).toFixed(2)} USD</span>.</>
                                    : <>Institutional deposit of <span className="font-mono font-bold text-emerald-400">${parseFloat(liveAlert.amount).toFixed(2)} USD</span> executed by <span className="font-semibold text-white">{liveAlert.sender}</span>.</>
                                }
                            </p>
                            
                            <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                                <span>Ref: {liveAlert.reference?.substring(0, 13)}...</span>
                                <span className={liveAlert.type === 'INVOICE_RECEIVED' ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                                    {liveAlert.type === 'INVOICE_RECEIVED' ? 'ACTION REQUIRED' : `+ ${parseFloat(liveAlert.amount).toFixed(2)}`}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setLiveAlert(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} onSuccess={fetchDashboardData} currentBalance={wallet?.balance !== undefined ? parseFloat(wallet.balance) : 0} />
            <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} onSuccess={fetchDashboardData} />

            <div>
                <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2.5">
                                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm"><Hexagon size={20} className="text-white" /></div>
                                    <span className="text-xl font-black text-slate-900 tracking-tight font-mono">FINFLOW</span>
                                </div>
                                
                                <div className="hidden lg:flex items-center space-x-6 ml-10">
                                    <button onClick={() => setActiveTab('overview')} className={`pb-5 pt-5 text-sm font-medium transition-all relative cursor-pointer ${activeTab === 'overview' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Overview
                                        {activeTab === 'overview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                                    </button>
                                    <button onClick={() => setActiveTab('transfers')} className={`pb-5 pt-5 text-sm font-medium transition-all relative cursor-pointer ${activeTab === 'transfers' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Wire & Settlement
                                        {activeTab === 'transfers' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                                    </button>
                                    <button onClick={() => setActiveTab('analytics')} className={`pb-5 pt-5 text-sm font-medium transition-all relative cursor-pointer ${activeTab === 'analytics' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Treasury Analytics
                                        {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                                    </button>
                                    <button onClick={() => setActiveTab('cards')} className={`pb-5 pt-5 text-sm font-medium transition-all relative cursor-pointer ${activeTab === 'cards' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Corporate Cards
                                        {activeTab === 'cards' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {stompStatus === 'connected' ? (
                                    <div className="hidden md:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-700 shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>LIVE LEDGER</span>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-amber-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span><span>SOCKET IDLE</span>
                                    </div>
                                )}
                                <div className="hidden sm:flex items-center space-x-2.5 text-xs font-mono font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span>{user?.email}</span>
                                </div>
                                <button onClick={handleLogout} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                                    <LogOut size={16} className="mr-1.5" />Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 lg:pb-8 space-y-6">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Treasury Command Center</h1>
                                    <p className="text-slate-500 text-sm mt-1">Real-time monitoring of institutional liquidity and ledger mutations.</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => setIsDepositModalOpen(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center transition-all cursor-pointer"><Plus size={16} className="mr-1.5" /> Deposit</button>
                                    <button onClick={() => setIsTransferModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center transition-all cursor-pointer"><Send size={14} className="mr-2" /> Wire Transfer</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-2"><BalanceCard balance={wallet?.balance} currency={wallet?.currency} /></div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600"><Server size={18} /></div>
                                        {clusterStatus === 'connected' ? <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span> Port 6380</span> : <span className="inline-flex items-center text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 border border-rose-200 px-2 py-1 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span> Offline</span>}
                                    </div>
                                    <div><p className="text-sm font-bold text-slate-900">Redis Cache Pool</p><p className="text-xs text-slate-500 mt-1 leading-relaxed">{clusterStatus === 'connected' ? 'Docker instance stable. Session caching active.' : 'API connection lost. Inspect Docker network.'}</p></div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-indigo-600"><Shield size={18} /></div>
                                        {clusterStatus !== 'connected' ? <span className="inline-flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span> Offline</span> : highRiskAnomaliesCount === 0 ? <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span> Compliant</span> : <span className="inline-flex items-center text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 border border-amber-200 px-2 py-1 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> {highRiskAnomaliesCount} Flagged</span>}
                                    </div>
                                    <div><p className="text-sm font-bold text-slate-900">AML Risk Sentinel</p><p className="text-xs text-slate-500 mt-1 leading-relaxed">{clusterStatus !== 'connected' ? 'Monitoring suspended. Reconnect API.' : highRiskAnomaliesCount === 0 ? 'Zero anomalous ledger velocity spikes detected.' : `${highRiskAnomaliesCount} high-risk mutations isolated.`}</p></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Ledger History</h2>
                                        <button onClick={handleDownloadStatement} className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 cursor-pointer"><Download size={12} /><span>Export PDF</span></button>
                                    </div>
                                    <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider"><Clock size={12} className="mr-1.5" /> Updated {new Date().toLocaleTimeString()}</div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <TransactionTable transactions={transactions} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WIRE & SETTLEMENT */}
                    {activeTab === 'transfers' && (
                        <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto mt-2">
                            
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
                                        <Activity size={14} />
                                        <span>Internal Peer-to-Peer Engine</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Outbound Wire Transfer</h2>
                                    <p className="text-slate-500 text-sm mt-1.5">Transfer funds directly to registered local accounts via Spring Boot REST controller.</p>
                                </div>
                                <button 
                                    onClick={() => setIsTransferModalOpen(true)} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm flex items-center transition-all cursor-pointer shrink-0"
                                >
                                    <Send size={16} className="mr-2" /> Initialize Transfer
                                </button>
                            </div>

                            {/* Info Grid */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                <div className="p-6">
                                    <span className="text-sm font-medium text-slate-500 block mb-1">Transfer Protocol</span>
                                    <div className="text-lg font-semibold text-slate-900">Local P2P Bridge</div>
                                    <span className="text-sm text-indigo-600 font-medium mt-1 inline-block">Account-to-Account</span>
                                </div>
                                <div className="p-6">
                                    <span className="text-sm font-medium text-slate-500 block mb-1">Data Safety</span>
                                    <div className="text-lg font-semibold text-slate-900">@Transactional</div>
                                    <span className="text-sm text-emerald-600 font-medium mt-1 inline-block">Auto-Rollback Safe</span>
                                </div>
                                <div className="p-6">
                                    <span className="text-sm font-medium text-slate-500 block mb-1">Available Sender Pool</span>
                                    <div className="text-xl font-mono font-bold text-slate-900 tracking-tight">
                                        {wallet?.balance !== undefined ? `$${parseFloat(wallet.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '$0.00'}
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium mt-1 inline-block">Mapped to local MySQL</span>
                                </div>
                            </div>
                            
                            {/* Empty State / Banner */}
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
                                <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-1 shadow-sm">
                                        <ArrowRightLeft size={20} />
                                    </div>
                                    <div className="text-base font-semibold text-slate-900">Transfer Desk Ready</div>
                                    <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                                        Click 'Initialize Transfer' above to target a verified recipient email and execute an ACID balance update across your accounts.
                                    </p>
                                </div>
                            </div>

                            {/* B2B INVOICING WIDGET */}
                            <InvoiceWidget 
                                onPaymentSuccess={fetchDashboardData} 
                                refreshTrigger={invoiceRefreshTrigger} 
                            />

                        </div>
                    )}

                    {/* TREASURY ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <AnalyticsView transactions={transactions} wallet={wallet} />
                    )}

                    {/* CORPORATE CARDS */}
                    {activeTab === 'cards' && (
                        <VirtualCardsView />
                    )}

                </main>
            </div>

            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
                        <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Architecture</h4><ul className="space-y-2 text-xs font-medium text-slate-600"><li>Docker Compose Cluster</li><li>Spring Boot 3.2 REST API</li><li>MySQL 8.0 Relational Database</li><li>Redis In-Memory Cache</li></ul></div>
                        <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Security & Logic</h4><ul className="space-y-2 text-xs font-medium text-slate-600"><li>Stateless JWT Authentication</li><li>BCrypt Password Hashing</li><li>Role-Based Access Control (RBAC)</li><li>Algorithmic Risk Scoring</li></ul></div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">System Status</h4>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                <div className="flex items-center space-x-2">
                                    {clusterStatus === 'connected' ? <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Cloud Link Active</span></> : <><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">API Offline</span></>}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium">React proxying strictly to live Render Spring Boot backend.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* NATIVE iOS MOBILE BOTTOM TAB BAR (Visible strictly on phones/tablets) */}
            <div className="fixed bottom-0 left-0 z-[99999] w-full h-16 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex lg:hidden justify-around items-center px-2 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`flex flex-col items-center justify-center w-1/4 h-full transition-all cursor-pointer ${activeTab === 'overview' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Home size={20} />
                    <span className="text-[10px] mt-1 font-sans">Overview</span>
                </button>
                <button 
                    onClick={() => setActiveTab('transfers')} 
                    className={`flex flex-col items-center justify-center w-1/4 h-full transition-all cursor-pointer ${activeTab === 'transfers' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Send size={20} />
                    <span className="text-[10px] mt-1 font-sans">Wires</span>
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')} 
                    className={`flex flex-col items-center justify-center w-1/4 h-full transition-all cursor-pointer ${activeTab === 'analytics' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <BarChart3 size={20} />
                    <span className="text-[10px] mt-1 font-sans">Analytics</span>
                </button>
                <button 
                    onClick={() => setActiveTab('cards')} 
                    className={`flex flex-col items-center justify-center w-1/4 h-full transition-all cursor-pointer ${activeTab === 'cards' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <CreditCard size={20} />
                    <span className="text-[10px] mt-1 font-sans">Cards</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;