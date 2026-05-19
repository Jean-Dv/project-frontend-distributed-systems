import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute allowedRoles={["FUNC", "ADMIN"]}>{children}</ProtectedRoute>;
}
