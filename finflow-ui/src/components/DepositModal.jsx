import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmDeposit } from '../services/financeService';
import { X, Plus, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // Prevent page refresh
        });

        if (stripeError) {
            setError(stripeError.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                const receipt = await confirmDeposit(amount);
                onSuccess(receipt.transactionReference);
            } catch (err) {
                setError("Card charged, but database sync failed. Contact engineering.");
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <PaymentElement 
                    options={{ 
                        layout: 'tabs',
                        wallets: {
                            applePay: 'never',
                            googlePay: 'never'
                        }
                    }} 
                />
            </div>
            
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start space-x-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>
            )}

            <div className="pt-2 flex space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="flex-1 flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 cursor-pointer"
                >
                    {isProcessing ? <Loader2 size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
                    {isProcessing ? 'Processing...' : `Pay $${parseFloat(amount).toFixed(2)}`}
                </button>
            </div>
        </form>
    );
};

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [loadingSecret, setLoadingSecret] = useState(false);
    const [successReceipt, setSuccessReceipt] = useState(null);
    const [initError, setInitError] = useState('');

    if (!isOpen) return null;

    const handleAmountSubmit = async (e) => {
        e.preventDefault();
        setInitError('');
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount < 1) {
            setInitError('Minimum deposit amount is $1.00');
            return;
        }

        setLoadingSecret(true);
        try {
            const data = await createPaymentIntent(numAmount);
            setClientSecret(data.clientSecret);
        } catch (err) {
            setInitError('Failed to initialize payment gateway.');
        } finally {
            setLoadingSecret(false);
        }
    };

    const handleFullClose = () => {
        setAmount('');
        setClientSecret('');
        setSuccessReceipt(null);
        setInitError('');
        onClose();
    };

    const handlePaymentSuccess = (receiptId) => {
        setSuccessReceipt(receiptId);
        onSuccess(); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn font-sans">
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 transform transition-all text-left">
                
                <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Plus size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 tracking-tight">External Liquidity Injection</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Stripe 256-bit AES Gateway</p>
                        </div>
                    </div>
                    <button onClick={handleFullClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 bg-[#FAFAFA]">
                    {successReceipt ? (
                        <div className="text-center py-2 space-y-5 animate-fadeIn">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold text-slate-900">Deposit Complete</h4>
                                <p className="text-sm text-slate-500">Funds secured in SQL vault.</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-600">
                                Ref: {successReceipt}
                            </div>
                            <button
                                onClick={handleFullClose}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    ) : clientSecret ? (
                        <div className="animate-fadeIn">
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} onCancel={() => setClientSecret('')} />
                            </Elements>
                        </div>
                    ) : (
                        <form onSubmit={handleAmountSubmit} className="space-y-6">
                            {initError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
                                    <AlertCircle size={16} />
                                    <span>{initError}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-slate-400 font-medium text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="500.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-mono font-medium text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingSecret || !amount}
                                className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 cursor-pointer"
                            >
                                {loadingSecret ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                                {loadingSecret ? 'Connecting securely...' : 'Proceed to Payment Gateway'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositModal;