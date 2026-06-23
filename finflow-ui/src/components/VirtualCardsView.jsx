import React, { useState, useEffect } from 'react';
import { getMyVirtualCards, issueVirtualCard } from '../services/financeService';
import { CreditCard, Cpu, Wifi, Plus, ShieldCheck, Loader2 } from 'lucide-react';

const VirtualCardsView = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [issuing, setIssuing] = useState(false);
    
    const [cardName, setCardName] = useState('');
    const [cardLimit, setCardLimit] = useState('');

    const fetchCards = async () => {
        try {
            const data = await getMyVirtualCards();
            setCards(data);
        } catch (error) {
            console.error("Failed to fetch cards", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleIssueCard = async (e) => {
        e.preventDefault();
        if (!cardName || !cardLimit) return;
        setIssuing(true);
        try {
            await issueVirtualCard(cardName, parseFloat(cardLimit));
            setCardName('');
            setCardLimit('');
            await fetchCards(); 
        } catch (error) {
            alert("Failed to issue card.");
        } finally {
            setIssuing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn mt-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Cards</h2>
                    <p className="text-slate-500 text-sm mt-1">Issue and manage virtual spending credentials linked to your treasury vault.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Active Cards Grid Container */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-48 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-sm font-medium">
                            <Loader2 size={18} className="animate-spin mr-2 text-indigo-500" />
                            Unlocking card vault...
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[340px]">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">No active corporate cards</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                You haven't issued any digital assets yet. Use the command console to instantly authorize a card.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            {cards.map((card) => (
                                <div key={card.id} className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white p-6 flex flex-col justify-between shadow-lg shadow-slate-900/10 overflow-hidden group border border-slate-800">
                                    {/* Glass reflection accents */}
                                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-40"></div>
                                    
                                    <div className="flex justify-between items-start z-10">
                                        <span className="font-bold tracking-widest text-base font-mono text-slate-200/90">FINFLOW</span>
                                        <Wifi size={20} className="rotate-90 text-slate-400/80" />
                                    </div>
                                    
                                    <div className="z-10 mt-1">
                                        <Cpu size={32} className="text-amber-200/90" strokeWidth={1.2} />
                                    </div>
                                    
                                    <div className="z-10 font-mono text-lg sm:text-xl tracking-[0.22em] font-medium text-slate-100 mt-2">
                                        {card.cardNumber}
                                    </div>
                                    
                                    <div className="flex justify-between items-end z-10 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 font-mono">Cardholder</span>
                                            <span className="uppercase font-semibold tracking-wide text-xs text-slate-200">{card.cardholderName}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 font-mono">Valid Thru</span>
                                            <span className="font-mono text-xs text-slate-200">{card.expiryDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Issuing Command Console */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-3 bg-white">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Issuing Console</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Authorize real-time credentials</p>
                        </div>
                    </div>
                    
                    {/* Balanced Form Body */}
                    <div className="p-6 space-y-5 bg-white">
                        <form onSubmit={handleIssueCard} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="e.g. Lucius Fox"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xs"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Spending Limit</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-slate-400 font-medium text-sm">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={cardLimit}
                                        onChange={(e) => setCardLimit(e.target.value)}
                                        placeholder="5,000"
                                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xs"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={issuing || !cardName || !cardLimit}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center text-sm disabled:opacity-50 cursor-pointer"
                            >
                                {issuing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                                {issuing ? 'Authorizing Tokens...' : 'Issue Virtual Card'}
                            </button>
                        </form>
                        
                        <p className="text-xs text-slate-400 text-center leading-relaxed font-medium pt-2 border-t border-slate-100">
                            Instantly compiles a cryptographically unique sequence backed by strict tokenization rules.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VirtualCardsView;