import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute allowedRoles={["AUDITOR", "ADMIN"]}>{children}</ProtectedRoute>;
}
