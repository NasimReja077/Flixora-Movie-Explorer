// src/components/AuthCard.jsx — shared card shell for the secondary auth pages
const AuthCard = ({ icon: Icon, title, subtitle, children, footer }) => (
    <div className="w-full max-w-[460px] rounded-3xl border border-white/5 bg-[#1E1717]/90 p-8 shadow-2xl md:p-10">
        {Icon && (
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/15 text-brand-red">
                <Icon className="h-6 w-6" />
            </div>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mb-8 mt-1 text-sm leading-relaxed text-gray-400">{subtitle}</p>}
        {children}
        {footer && <div className="mt-8 text-center text-sm text-gray-400">{footer}</div>}
    </div>
);

export default AuthCard;