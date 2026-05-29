import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layouts/DashboardShell";

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["FUNC", "ADMIN"]}>
            <DashboardShell>{children}</DashboardShell>
        </ProtectedRoute>
    );
}
