import StatusChip from "@/components/ui/StatusChip";

interface SupplierStatusChipProps {
    isActive: boolean;
}

export function SupplierStatusChip({ isActive }: SupplierStatusChipProps) {
    return (
        <StatusChip
            variant={isActive ? "success" : "alert"}
            icon={isActive ? "check_circle" : "block"}
        >
            {isActive ? "HABILITADO" : "INHABILITADO"}
        </StatusChip>
    );
}
