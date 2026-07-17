import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    BarChart3,
    Briefcase,
    Wallet,
    ShieldCheck,
    Trophy,
    ArrowRight,
    UserPlus,
    Search,
    ShoppingBag,
    LineChart,
    BookOpen,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import Navbar from '../components/home/Navbar';


export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
            <Navbar />
            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden bg-white border-b border-slate-100 py-20 md:py-28">
                <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="w-3.5 h-3.5" /> StockGuru • Trading Simulator Platform
                    </div>
                    <h1 className="text-1xl md:text-5xl font-black text-slate-600 tracking-tight leading-tight max-w-4xl mx-auto m-0">
                        Master the Indian Stock Market <br />
                        <span className="text-black-500">Without Financial Risk</span>
                    </h1>
                    <p className="text-base text-1xl md:text-2xl text-sky-500 max-w-2xl mx-auto font-medium leading-relaxed m-0">
                        Trade using <span className="text-sky-700 font-bold">₹1,00,000 virtual money</span>. Learn investing with real market data, interactive charts, and portfolio tracking.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button
                            onClick={() => navigate('/market/explore')}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer border-none"
                        >
                            Start Trading <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/kyc')}
                            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer border-none"
                        >
                            Complete KYC
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. ABOUT STOCKGURU SECTION */}
            <section className="max-w-6xl mx-auto px-4 py-16 space-y-8">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 m-0">What is StockGuru?</h2>
                    <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto m-0">
                        StockGuru is a virtual stock trading platform designed for beginners and students. Practice investing using virtual money, analyze real market movements, and improve your trading skills without risking real capital.
                    </p>
                </div>
            </section>

            {/* 3. KEY FEATURES SECTION */}
            <section className="max-w-6xl mx-auto px-4 py-16 space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 m-0">Platform Core Features</h2>
                    <p className="text-xs md:text-sm text-slate-600 font-medium max-w-xl mx-auto m-0">Everything you need to experience genuine market conditions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><TrendingUp className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Live Market Data</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Track real-time NSE & BSE price ticks for top Indian bluechips safely.</p>
                        </div>
                    </div>
                    {/* Feature 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><BarChart3 className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Candlestick & Line Charts</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Toggle layouts flawlessly to execute precise technical analysis checks.</p>
                        </div>
                    </div>
                    {/* Feature 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Briefcase className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Portfolio Management</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Monitor active holding, purchase history log strings,buy and sell stocks.</p>
                        </div>
                    </div>
                    {/* Feature 4 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><Wallet className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Virtual Trading</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Utilize ₹1 Lakh mock balances to complete trade allocations with ease.</p>
                        </div>
                    </div>
                    {/* Feature 5 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"><ShieldCheck className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">KYC Verification</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Get verified manually by local platform admins to adjust limits.</p>
                        </div>
                    </div>
                    {/* Feature 5 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Watchlist</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 m-0">Easily add or remove stocks to track their live prices instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW IT WORKS SECTION */}
            <section className="bg-slate-700 text-white py-16 border-t border-b border-slate-900">
                <div className="max-w-5xl mx-auto px-4 space-y-12">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0">How It Works</h2>
                        <p className="text-xs md:text-sm text-slate-600 font-medium max-w-xs mx-auto m-0">Your straightforward path to trading mastery.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-sm"><UserPlus className="w-4 h-4" /></div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200 m-0 pt-1">Create Account</h4>
                            <p className="text-[11px] text-slate-600 font-medium max-w-[160px] m-0">Sign up instantly with your email credentials.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-sm"><ShieldCheck className="w-4 h-4" /></div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200 m-0 pt-1">Complete KYC</h4>
                            <p className="text-[11px] text-slate-600 font-medium max-w-[160px] m-0">Submit info for system admin review confirmation.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-sm"><Search className="w-4 h-4" /></div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200 m-0 pt-1">Explore Markets</h4>
                            <p className="text-[11px] text-slate-600 font-medium max-w-[160px] m-0">Look up companies and build close watchlists.</p>
                        </div>
                        {/* Step 4 */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-sm"><ShoppingBag className="w-4 h-4" /></div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200 m-0 pt-1">Buy & Sell</h4>
                            <p className="text-[11px] text-slate-600 font-medium max-w-[160px] m-0">Place mock order requests at live prices.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-sm"><LineChart className="w-4 h-4" /></div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200 m-0 pt-1">Track Portfolio</h4>
                            <p className="text-[11px] text-slate-600 font-medium max-w-[160px] m-0">Monitor total return metrics and rank</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. WHY CHOOSE STOCKGURU SECTION */}
            <section className="max-w-5xl mx-auto px-4 py-16 space-y-12">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 m-0">Why Choose StockGuru</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="text-2xl m-0">🛡️</div>
                        <h3 className="text-sm font-bold text-slate-800 m-0">No Financial Risk</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed m-0">Test complex strategies on genuine assets while keeping your capital fully safe.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="text-2xl m-0">🔬</div>
                        <h3 className="text-sm font-bold text-slate-800 m-0">Learn Technical Analysis</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed m-0">Read candlestick patterns and charts to establish clear analytical recognition habits.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="text-2xl m-0">⚡</div>
                        <h3 className="text-sm font-bold text-slate-800 m-0">Realistic Experience</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed m-0">Simulate authentic brokerage execution workflows without dealing withlags.</p>
                    </div>
                </div>
            </section>

            {/* 6. CALL TO ACTION SECTION */}
            <section className="bg-sky-600 text-white py-16 text-center">
                <div className="max-w-3xl mx-auto px-4 space-y-6">
                    <h2 className="text-3xl font-black tracking-tight text-white m-0">Ready to Start?</h2>
                    <p className="text-sm md:text-base text-blue-100 font-medium max-w-xl mx-auto m-0">Join StockGuru and begin your investing journey today.</p>
                    <div className="pt-2">
                        <button
                            onClick={() => navigate('/market/explore')}
                            className="bg-white hover:bg-slate-50 text-blue-600 font-bold px-8 py-3.5 rounded-xl shadow-lg transition cursor-pointer border-none"
                        >
                            Start Trading Now
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. MINIMALIST FOOTER SECTION */}
            <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-slate-600 font-medium border-t border-slate-200/60">
                © {new Date().getFullYear()} StockGuru Inc. Simulated trading parameters are strictly for educational target exercises.
            </footer>
        </div>
    );
}