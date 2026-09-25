
const Logo = () => (
    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-md">
        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 12l12 6" />
            <circle cx="6" cy="12" r="2" fill="currentColor" />
            <circle cx="18" cy="6" r="2" fill="currentColor" />
            <circle cx="18" cy="18" r="2" fill="currentColor" />
        </svg>
    </div>
);

export default Logo;
