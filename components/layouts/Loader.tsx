export default function Loader() {
    return (
        <main className="relative flex flex-col items-center justify-center p-8 w-full text-center">
            <div className="mb-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary mb-6 flex items-center justify-center rounded shadow-sm">
                    <span className="material-symbols-outlined text-on-primary text-3xl">
                        shield_person
                    </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-on-background font-headline uppercase letter">
                    Ledger
                </h1>
            </div>
            <div className="relative flex items-center justify-center mb-10 h-32 w-32">
                <div className="absolute inset-0 rounded-full border-2 border-outline/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-dim border-r-primary-dim animate-loader"></div>
                <div className={`w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center animate-pulse-slow`}>
                    <span className="material-symbols-outlined text-primary text-2xl">
                        fingerprint
                    </span>
                </div>
            </div>
            <div className="space-y-3">
                <p className="text-on-surface text-lg font-medium tracking-wide">
                    Cargando...
                </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-outline font-bold uppercase tracking-[0.2em]">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                Entorno seguro
            </div>
        </main>
    );
}