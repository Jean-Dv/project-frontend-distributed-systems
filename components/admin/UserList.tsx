"use client";

import { useState } from "react";
import { useApi } from "@/helpers/use-api.helper";
import { showToast } from "@/helpers/toast.helper";
import Table from "@/components/ui/Table";
import StatusChip from "@/components/ui/StatusChip";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface User {
  id: number;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
}

export interface UserListProps {
  users: User[];
  onRefresh: () => void;
}

const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "OFFICER", label: "Funcionario" },
  { value: "AUDITOR", label: "Auditor" },
];

export default function UserList({ users, onRefresh }: UserListProps) {
  const { apiFetch } = useApi();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async (user: User) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `http://localhost:8080/ms-auth/auth/users/${user.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !user.active }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "Error al cambiar estado", "error");
        return;
      }

      showToast(
        `Usuario ${!user.active ? "habilitado" : "deshabilitado"} exitosamente`,
        "success"
      );
      onRefresh();
    } catch {
      showToast("Error de conexion con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    setIsLoading(true);
    try {
      const currentRoles = selectedUser.roles.map((r) => r.toUpperCase());
      const res = await apiFetch(
        `http://localhost:8080/ms-auth/auth/users/${selectedUser.id}/roles`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            add: [newRole],
            remove: currentRoles.filter((r) => r !== newRole),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "Error al cambiar rol", "error");
        return;
      }

      showToast("Rol actualizado exitosamente", "success");
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      onRefresh();
    } catch {
      showToast("Error de conexion con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.roles[0]?.toUpperCase() || "OFFICER");
    setIsRoleModalOpen(true);
  };

  const columns = [
    { header: "ID", accessorKey: "id" as const },
    { header: "Usuario", accessorKey: "username" as const },
    { header: "Email", accessorKey: "email" as const },
    {
      header: "Rol",
      accessorKey: "roles" as const,
      cell: (user: User) => (
        <span className="text-label-caps text-on-surface-variant">
          {user.roles.map((r) => r).join(", ") || "Sin rol"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "active" as const,
      cell: (user: User) => (
        <StatusChip variant={user.active ? "success" : "alert"}>
          {user.active ? "Activo" : "Inactivo"}
        </StatusChip>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions" as const,
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openRoleModal(user)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
            title="Cambiar rol"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Rol
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              user.active
                ? "text-error hover:bg-error/10"
                : "text-secondary hover:bg-secondary/10"
            }`}
            title={user.active ? "Deshabilitar" : "Habilitar"}
          >
            <span className="material-symbols-outlined text-base">
              {user.active ? "block" : "check_circle"}
            </span>
            {user.active ? "Deshabilitar" : "Habilitar"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-on-surface">Usuarios Registrados</h2>
      <Table data={users} columns={columns} emptyStateMessage="No hay usuarios registrados." />

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        title="Cambiar Rol de Usuario"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleChangeRole} isLoading={isLoading}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-on-surface-variant text-sm">
            Usuario: <strong className="text-on-surface">{selectedUser?.username}</strong>
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface-variant">Nuevo Rol</label>
            <div className="relative">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-surface-container-low rounded text-on-surface outline outline-1 outline-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm appearance-none"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
