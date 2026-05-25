import StatusChip from "@/components/ui/StatusChip";
import { CONTRACT_STATUS_LABELS, ContractStatus } from "@/helpers/contracts.helper";

type ChipVariant = "success" | "alert" | "warning" | "default";

const STATUS_VARIANTS: Record<ContractStatus, ChipVariant> = {
    in_preparation: "default",
    published: "warning",
    awarded: "success",
    in_execution: "success",
    finalized: "default",
    cancelled: "alert",
};

const STATUS_ICONS: Record<ContractStatus, string> = {
    in_preparation: "edit_document",
    published: "publish",
    awarded: "emoji_events",
    in_execution: "play_circle",
    finalized: "check_circle",
    cancelled: "cancel",
};

interface ContractStatusChipProps {
    status: ContractStatus;
}

export function ContractStatusChip({ status }: ContractStatusChipProps) {
    return (
        <StatusChip
            variant={STATUS_VARIANTS[status] ?? "default"}
            icon={STATUS_ICONS[status]}
        >
            {CONTRACT_STATUS_LABELS[status] ?? status}
        </StatusChip>
    );
}
