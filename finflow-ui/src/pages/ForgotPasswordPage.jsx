import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft, Loader2, MailCheck } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-center p-16 relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxdS00MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz4KPHBhdGggZD0iTTAgMGgxdjQwaC0xeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPgo8L3N2Zz4=')] opacity-30"></div>
                
                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center space-x-3 mb-12">
                        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Hexagon className="text-indigo-400" size={28} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">FINFLOW</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                        Secure Credential Recovery Protocol.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Regain access to your institutional treasury. We employ strict verification checks before dispatching cryptographic reset tokens.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 text-left">
                <div className="w-full max-w-md">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8">
                        <ArrowLeft size={16} className="mr-2" /> Back to sign in
                    </Link>

                    {isSuccess ? (
                        <div className="animate-fadeIn space-y-6">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                                <MailCheck size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your inbox</h2>
                                <p className="text-slate-500 mt-2 leading-relaxed text-sm">
                                    We've dispatched secure password reset instructions to <span className="font-semibold text-slate-700">{email}</span>. The link will expire in 15 minutes.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Reset your password</h2>
                            <p className="text-slate-500 text-sm mb-8">Enter your registered email address to receive recovery instructions.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                                    {isSubmitting ? 'Verifying...' : 'Send reset instructions'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;