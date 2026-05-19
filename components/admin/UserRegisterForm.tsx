"use client";

import { useState } from "react";
import { useApi } from "@/helpers/use-api.helper";
import { showToast } from "@/helpers/toast.helper";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "OFFICER", label: "Funcionario" },
  { value: "AUDITOR", label: "Auditor" },
];

export interface UserRegisterFormProps {
  onSuccess: () => void;
}

export default function UserRegisterForm({ onSuccess }: UserRegisterFormProps) {
  const { apiFetch } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "OFFICER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Register user
      const registerRes = await apiFetch("http://localhost:8080/ms-auth/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json().catch(() => ({}));
        showToast(errorData.message || "Error al registrar usuario", "error");
        return;
      }

      const userData = await registerRes.json();

      // Assign role
      if (formData.role && formData.role !== "USER") {
        const roleRes = await apiFetch(
          `http://localhost:8080/ms-auth/auth/users/${userData.id}/roles`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ add: [formData.role], remove: [] }),
          }
        );

        if (!roleRes.ok) {
          showToast("Usuario creado pero error al asignar rol", "error");
        } else {
          showToast("Usuario registrado exitosamente", "success");
        }
      } else {
        showToast("Usuario registrado exitosamente", "success");
      }

      setFormData({ username: "", email: "", password: "", role: "OFFICER" });
      onSuccess();
    } catch (err) {
      showToast("Error de conexión con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-on-surface mb-2">Registrar Nuevo Usuario</h2>
      <InputField
        id="username"
        label="Nombre de usuario"
        icon="person"
        placeholder="Ej: juan.perez"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />
      <InputField
        id="email"
        label="Correo electrónico"
        icon="mail"
        type="email"
        placeholder="Ej: juan@ejemplo.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <InputField
        id="password"
        label="Contraseña"
        icon="lock"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        minLength={6}
      />
      <div className="flex flex-col gap-2">
        <label className="text-label-caps text-on-surface-variant ml-1">Rol</label>
        <div className="relative">
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full pl-4 pr-10 py-3.5 bg-surface-container-low rounded text-on-surface outline outline-1 outline-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm appearance-none"
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
      <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2">
        Registrar Usuario
      </Button>
    </form>
  );
}
