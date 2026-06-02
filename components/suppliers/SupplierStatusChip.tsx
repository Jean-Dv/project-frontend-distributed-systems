import { StatusChip } from "@/components/ui/StatusChip";

interface SupplierStatusChipProps {
    isActive: boolean;
}

export function SupplierStatusChip({ isActive }: SupplierStatusChipProps) {
    return (
        <StatusChip variant={isActive ? "success" : "alert"}>
            {isActive ? "HABILITADO" : "INHABILITADO"}
        </StatusChip>
    );
}
