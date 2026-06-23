import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Hexagon, Mail, Lock, ArrowRight, Zap, ShieldCheck, Database, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Real-time Docker Cluster Probing State
    const [clusterStatus, setClusterStatus] = useState('pinging');

    useEffect(() => {
        const verifyClusterConnection = async () => {
            try {
                const response = await axios.get('/api/auth/health-check', { timeout: 2500 });
                if (response.status === 200) setClusterStatus('connected');
                else setClusterStatus('disconnected');
            } catch (err) {
                setClusterStatus('disconnected');
            }
        };
        
        verifyClusterConnection();
        const intervalId = setInterval(verifyClusterConnection, 8000);
        return () => clearInterval(intervalId);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials provided.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex font-sans text-left bg-slate-900 lg:bg-white">
            
            <div className="hidden lg:flex w-1/2 h-full bg-slate-900 flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Hexagon className="text-indigo-400" size={26} />
                        </div>
                        <span className="text-xl font-black text-white tracking-widest font-mono">FINFLOW</span>
                    </div>

                    <div>
                        <div className="mb-6 h-7 flex items-center">
                            {clusterStatus === 'connected' && (
                                <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 animate-fadeIn">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>SYSTEM LINK ACTIVE: DOCKER CLUSTER CONNECTED</span>
                                </div>
                            )}
                            {clusterStatus === 'disconnected' && (
                                <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-rose-400 animate-fadeIn">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    <span>API OFFLINE: DOCKER CLUSTER UNREACHABLE</span>
                                </div>
                            )}
                            {clusterStatus === 'pinging' && (
                                <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-amber-400 animate-fadeIn">
                                    <Loader2 size={12} className="animate-spin text-amber-400" />
                                    <span>PROBING DOCKER NETWORK...</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1]">
                            Intelligent Financial Operations Platform
                        </h1>
                        <p className="text-slate-400 text-sm xl:text-base mt-4 leading-relaxed max-w-md font-medium">
                            An end-to-end distributed architecture delivering real-time double-entry bookkeeping, interactive ledger visualization, and automated risk scoring.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 my-auto py-8 space-y-6 border-y border-slate-800/80">
                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-indigo-400 shrink-0 mt-0.5">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-tight">Redis In-Memory Caching</h4>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Sub-millisecond query response times and distributed session state management.</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-emerald-400 shrink-0 mt-0.5">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-tight">Stateless JWT Security</h4>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Role-Based Access Control (RBAC) enforced at the Spring Security filter chain level.</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sky-400 shrink-0 mt-0.5">
                            <Database size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white tracking-tight">ACID-Compliant MySQL</h4>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Strict database transaction constraints guaranteeing zero mathematical drift.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pt-2">
                    <span>FINFLOW CORE V1.0.0</span>
                    <span>SPRING BOOT 3.2 LTS</span>
                </div>
            </div>

            <div className="w-full lg:w-1/2 h-full flex flex-col justify-between lg:justify-center bg-slate-900 lg:bg-white relative overflow-y-auto">
                
                <div className="flex lg:hidden flex-col items-center justify-center pt-10 pb-4 px-6 text-center z-10 my-auto">
                    <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                        <Hexagon size={32} />
                    </div>
                    <span className="text-2xl font-black tracking-widest text-white font-mono">FINFLOW</span>
                    <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">Secure Institutional Treasury</p>
                </div>

                <div className="w-full max-w-md mx-auto bg-white rounded-t-[2.5rem] lg:rounded-none p-8 sm:p-10 lg:p-0 shadow-2xl lg:shadow-none mt-auto lg:mt-0 z-10">
                    
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1">Enter your credentials to access your workspace</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 text-left">
                        {error && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all shadow-2xs"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Password</label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all shadow-2xs font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 text-sm disabled:opacity-50 cursor-pointer mt-4"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            <span>{loading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
                            {!loading && <ArrowRight size={16} className="ml-2" />}
                        </button>
                    </form>

                    <div className="text-center pt-6 mt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="h-4 lg:hidden"></div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage; 