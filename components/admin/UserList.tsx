"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useApi } from "@/helpers/use-api.helper";
import { showToast } from "@/helpers/toast.helper";
import Button from "@/components/ui/Button";

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

function RoleChangeModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}) {
  const { apiFetch } = useApi();
  const [newRole, setNewRole] = useState("OFFICER");
  const [isLoading, setIsLoading] = useState(false);

  // Prevent body scroll when open
  if (typeof window !== "undefined") {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  const handleChangeRole = async () => {
    if (!user || !newRole) return;

    setIsLoading(true);
    try {
      const currentRoles = user.roles.map((r) => r.toUpperCase());
      const res = await apiFetch(
        `http://localhost:8080/ms-auth/auth/users/${user.id}/roles`,
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
      onClose();
      onSuccess();
    } catch {
      showToast("Error de conexion con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            borderBottom: "1px solid #e2e2e7",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1a1c1f",
              margin: 0,
            }}
          >
            Cambiar Rol de Usuario
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <p style={{ marginBottom: "16px", color: "#43474f", fontSize: "14px" }}>
            Usuario: <strong style={{ color: "#1a1c1f" }}>{user.username}</strong>
          </p>
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#43474f",
                marginBottom: "8px",
              }}
            >
              Nuevo Rol
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  borderRadius: "6px",
                  border: "1px solid #c3c6d1",
                  backgroundColor: "#f4f3f8",
                  color: "#1a1c1f",
                  fontSize: "14px",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#737780",
                  pointerEvents: "none",
                }}
              >
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #e2e2e7",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangeRole} isLoading={isLoading}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

export default function UserList({ users, onRefresh }: UserListProps) {
  const { apiFetch } = useApi();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
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

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
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
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            user.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions" as const,
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openRoleModal(user)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Cambiar rol"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Rol
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              user.active
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
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
      <h2 className="text-xl font-bold text-gray-900">Usuarios Registrados</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Email</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Rol</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{user.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.roles.map((r) => r).join(", ") || "Sin rol"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Cambiar rol"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Rol
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                          user.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={user.active ? "Deshabilitar" : "Habilitar"}
                      >
                        <span className="material-symbols-outlined text-base">
                          {user.active ? "block" : "check_circle"}
                        </span>
                        {user.active ? "Deshabilitar" : "Habilitar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RoleChangeModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={onRefresh}
      />
    </div>
  );
}
