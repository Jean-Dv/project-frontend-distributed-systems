import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full px-12 py-8 mt-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm leading-relaxed text-slate-600">
                © 2026 Architectural Ledger. All rights reserved.
            </p>
            <div className="flex gap-8">
                {[
                    { label: "Privacy Policy", href: "#" },
                    { label: "Audit Methodology", href: "#" },
                    { label: "Security Status", href: "#" },
                ].map(({ label, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </footer>
    );
}