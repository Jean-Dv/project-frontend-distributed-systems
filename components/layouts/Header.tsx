export default function Header() {
    return (
        <header className="w-full px-8 py-6 flex justify-between items-center">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
                Ledger
            </div>
            <div className="hidden md:flex gap-6">
                <span className="text-sm font-medium text-on-surface-variant">
                    Transparencia y Trazabilidad
                </span>
            </div>
        </header>
    );
}