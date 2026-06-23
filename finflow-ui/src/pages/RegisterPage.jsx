import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowRight, Hexagon, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- NEW: Frontend Validation Check ---
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            // Enhanced error mapping
            const serverMessage = err.response?.data?.message || err.response?.data?.error;
            setError(serverMessage || 'Registration failed. This email address may already be in use.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-slate-900 selection:bg-indigo-500 selection:text-white">
            {/* Left Production Architecture Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-16 border-r border-slate-800/60">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

                <div className="relative z-10 flex items-center space-x-3">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/5">
                        <Hexagon className="text-indigo-400 fill-indigo-400/10" size={26} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white font-mono">FINFLOW</span>
                </div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                        <ShieldCheck size={13} className="mr-1" />
                        <span>Secure Onboarding</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Create your enterprise profile.
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        Instantly provision an operator account to interact with the live ledger. Once authenticated, you can execute wallet deposits, initiate wire transfers, and access immutable MySQL ledger records.
                    </p>
                </div>

                <div className="relative z-10 text-slate-500 text-xs font-mono uppercase tracking-widest border-t border-slate-800/80 pt-6">
                    Architecture: React SPA + Spring Boot
                </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-12 overflow-y-auto">
                <div className="max-w-md w-full space-y-8">
                    
                    <div className="lg:hidden flex items-center space-x-3 border-b border-slate-100 pb-6">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                            <Hexagon size={22} />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 font-mono">FINFLOW</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign up</h2>
                        <p className="text-slate-500 text-sm mt-1.5 font-medium">Create a new account to get started</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="John"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-slate-900 font-medium text-sm" 
                                        onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                    />
                                    <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Doe"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-slate-900 font-medium text-sm" 
                                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-slate-900 font-medium text-sm" 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="••••••••"
                                    // Added minLength attribute for built-in HTML5 validation fallback
                                    minLength="8" 
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none text-slate-900 font-medium text-sm" 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                />
                                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting || formData.password.length > 0 && formData.password.length < 8}
                            className="w-full group flex justify-center items-center bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-600 transition-all duration-200 shadow-sm disabled:opacity-50 text-sm mt-4 cursor-pointer"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                            {!isSubmitting && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;