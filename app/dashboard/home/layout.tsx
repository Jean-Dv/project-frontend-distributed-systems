import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layouts/DashboardShell";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <DashboardShell>{children}</DashboardShell>
        </ProtectedRoute>
    );
}
