import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layouts/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardShell>{children}</DashboardShell>
        </ProtectedRoute>
    );
}
