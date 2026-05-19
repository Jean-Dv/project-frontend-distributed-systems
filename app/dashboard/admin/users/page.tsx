"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/helpers/use-api.helper";
import { showToast } from "@/helpers/toast.helper";
import UserRegisterForm from "@/components/admin/UserRegisterForm";
import UserList from "@/components/admin/UserList";
import Card from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export interface User {
  id: number;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
}

export default function AdminUsersPage() {
  const { apiFetch } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("http://localhost:8080/ms-auth/auth/users");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "Error al cargar usuarios", "error");
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast("Error de conexion con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-on-surface">Gestion de Usuarios</h1>
        </div>

        <Card padding="lg">
          <UserRegisterForm onSuccess={fetchUsers} />
        </Card>

        <Card padding="lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-loader text-primary text-2xl">
                progress_activity
              </span>
              <span className="ml-2 text-on-surface-variant">Cargando usuarios...</span>
            </div>
          ) : (
            <UserList users={users} onRefresh={fetchUsers} />
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
